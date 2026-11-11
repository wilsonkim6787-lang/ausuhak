// 빌드 후 소식(blogs) 글 시드 자동 등록 — 사이트 재구축(2026.11) 이후 복구한 최소 버전.
// 운영 방식: scripts/blog-seed/ 에 md 원고 + posts.json 항목 추가 → 병합·배포되면 자동 발행.
// - Vercel 프로덕션 빌드(VERCEL_ENV=production)에서만 실행한다. 프리뷰·로컬 빌드는 건너뜀.
// - env 없으면 조용히 skip — 빌드를 절대 깨뜨리지 않는다 (항상 exit 0)
// - 이미 있는 글(slug 동일)은 건드리지 않는다. 단, posts.json 에서 "sync": true 로 표시한 글은 제목·요약·본문을 파일에 맞춘다.
//   (본문 교정·날짜 보정·팝업 설정 같은 옛 시더의 부가 기능은 넣지 않았다.)
// - 신규 글은 published + posts.json 의 published_at 으로 등록 → 소식 게시판·메인 미리보기 노출.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

if (process.env.VERCEL_ENV !== "production") {
  console.log(`[seed-blog] production 빌드가 아님(VERCEL_ENV=${process.env.VERCEL_ENV ?? "없음"}) → skip`);
  process.exit(0);
}

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
      .select("id, title, excerpt, body")
      .eq("slug", p.slug)
      .maybeSingle();
    if (selErr) {
      failed++;
      console.log(`[seed-blog] ✗ 조회 실패: ${p.slug} — ${selErr.message}`);
      continue;
    }
    if (exists) {
      // "sync": true 인 글만 제목·요약·본문을 파일 내용으로 맞춘다 (발행일은 그대로).
      if (p.sync) {
        const nb = readFileSync(new URL(p.file, seedDir), "utf8");
        if (exists.title !== p.title || (exists.excerpt ?? null) !== (p.excerpt ?? null) || exists.body !== nb) {
          const { error: upErr } = await sb.from("blogs").update({ title: p.title, excerpt: p.excerpt ?? null, body: nb }).eq("id", exists.id);
          if (upErr) {
            failed++;
            console.log(`[seed-blog] ✗ 수정 실패: ${p.slug} — ${upErr.message}`);
          } else {
            console.log(`[seed-blog] ✓ 수정: ${p.title}`);
          }
          continue;
        }
      }
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
      published_at: p.published_at
        ? new Date(p.published_at).toISOString()
        : new Date().toISOString(),
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
