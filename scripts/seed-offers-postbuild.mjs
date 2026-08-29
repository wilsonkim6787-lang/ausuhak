// 빌드 후 합격 오퍼 시드 자동 등록 (Vercel 배포 시 1회성 자동 실행).
// - env 없으면(로컬 빌드 등) 조용히 skip — 빌드를 절대 깨뜨리지 않는다 (항상 exit 0)
// - 이미 등록된 항목(image_path 동일)은 건드리지 않는다 → 이후 admin 에서
//   수정한 내용이 재배포로 덮어써지는 일 없음. 순수 "없으면 넣기"만.
// - 신규 항목은 published 로 등록 → 메인 OfferShowcase 즉시 노출.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("[seed-offers] env 없음 (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) → skip");
  process.exit(0);
}

try {
  const sb = createClient(url, key);
  const seedDir = new URL("./offers-seed/", import.meta.url);
  const offers = JSON.parse(readFileSync(new URL("offers.json", seedDir), "utf8"));

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const o of offers) {
    const { data: exists, error: selErr } = await sb
      .from("offers")
      .select("id")
      .eq("image_path", o.file)
      .maybeSingle();
    if (selErr) {
      failed++;
      console.log(`[seed-offers] ✗ 조회 실패: ${o.file} — ${selErr.message}`);
      continue;
    }
    if (exists) {
      skipped++;
      continue;
    }

    const img = readFileSync(new URL(`images/${o.file}`, seedDir));
    const contentType = o.file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    const { error: upErr } = await sb.storage
      .from("offers")
      .upload(o.file, img, { contentType, upsert: true });
    if (upErr) {
      failed++;
      console.log(`[seed-offers] ✗ 스토리지 실패: ${o.file} — ${upErr.message}`);
      continue;
    }

    const { error: insErr } = await sb.from("offers").insert({
      school: o.school,
      program: o.program,
      year: o.year,
      student_alias: o.student_alias,
      image_path: o.file,
      story: o.story,
      display_order: o.display_order,
      status: "published",
    });
    if (insErr) {
      failed++;
      console.log(`[seed-offers] ✗ DB 실패: ${o.file} — ${insErr.message}`);
      continue;
    }
    inserted++;
    console.log(`[seed-offers] ✓ 등록: [${o.display_order}] ${o.school} (${o.student_alias})`);
  }

  console.log(`[seed-offers] 완료 — 신규 ${inserted} / 기존 유지 ${skipped} / 실패 ${failed}`);
} catch (e) {
  console.log(`[seed-offers] 예외 → skip: ${e?.message ?? e}`);
}
process.exit(0);
