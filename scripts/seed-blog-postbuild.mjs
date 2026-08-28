// 빌드 후 소식(blogs) 글 시드 자동 등록 (Vercel 배포 시 실행).
// 운영 방식: Wilson 이 원문을 주면 → blog-seed/ 에 md 원고 + posts.json 항목 추가 → 배포되면 자동 발행.
// - env 없으면(로컬 빌드 등) 조용히 skip — 빌드를 절대 깨뜨리지 않는다 (항상 exit 0)
// - 이미 있는 글(slug 동일)은 건드리지 않는다 → admin 에서 수정한 내용이
//   재배포로 덮어써지는 일 없음. 순수 "없으면 넣기"만.
// - 신규 글은 published + published_at=now 로 등록 → 소식 게시판·메인 미리보기 노출.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("[seed-blog] env 없음 (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) → skip");
  process.exit(0);
}

try {
  const sb = createClient(url, key);
  const seedDir = new URL("./blog-seed/", import.meta.url);
  const posts = JSON.parse(readFileSync(new URL("posts.json", seedDir), "utf8"));

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of posts) {
    const { data: exists, error: selErr } = await sb
      .from("blogs")
      .select("id")
      .eq("slug", p.slug)
      .maybeSingle();
    if (selErr) {
      failed++;
      console.log(`[seed-blog] ✗ 조회 실패: ${p.slug} — ${selErr.message}`);
      continue;
    }
    if (exists) {
      skipped++;
      continue;
    }

    const body = readFileSync(new URL(p.file, seedDir), "utf8");
    const { error: insErr } = await sb.from("blogs").insert({
      slug: p.slug,
      title: p.title,
      body,
      excerpt: p.excerpt ?? null,
      category: p.category ?? null,
      status: "published",
      published_at: new Date().toISOString(),
    });
    if (insErr) {
      failed++;
      console.log(`[seed-blog] ✗ DB 실패: ${p.slug} — ${insErr.message}`);
      continue;
    }
    inserted++;
    console.log(`[seed-blog] ✓ 발행: [${p.category}] ${p.title}`);
  }

  console.log(`[seed-blog] 완료 — 신규 ${inserted} / 기존 유지 ${skipped} / 실패 ${failed}`);
} catch (e) {
  console.log(`[seed-blog] 예외 → skip: ${e?.message ?? e}`);
}
process.exit(0);
