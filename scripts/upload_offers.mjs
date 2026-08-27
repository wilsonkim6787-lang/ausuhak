// 합격증 갤러리 시드 업로드 — scripts/offers-seed/ 의 마스킹 이미지 15장 + 후기를
// Supabase Storage('offers' 버킷) + offers 테이블에 넣는다. 전부 draft 상태로 들어가며,
// /admin/offers 에서 검토 후 공개(published)로 전환하는 것을 전제로 한다.
//
// 사용법:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload_offers.mjs
// (.env.local 이 있으면: node --env-file=.env.local scripts/upload_offers.mjs)
//
// 재실행해도 안전: 같은 image_path 가 이미 있으면 갱신한다.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("환경변수 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.");
  process.exit(1);
}

const sb = createClient(url, key);
const seedDir = new URL("./offers-seed/", import.meta.url);
const offers = JSON.parse(readFileSync(new URL("offers.json", seedDir), "utf8"));

let ok = 0;
for (const o of offers) {
  const img = readFileSync(new URL(`images/${o.file}`, seedDir));
  const { error: upErr } = await sb.storage
    .from("offers")
    .upload(o.file, img, { contentType: "image/png", upsert: true });
  if (upErr) {
    console.error(`✗ 스토리지 업로드 실패: ${o.file} — ${upErr.message}`);
    continue;
  }

  const row = {
    school: o.school,
    program: o.program,
    year: o.year,
    student_alias: o.student_alias,
    image_path: o.file,
    story: o.story,
    display_order: o.display_order,
    status: "draft",
  };
  const { data: exists } = await sb.from("offers").select("id").eq("image_path", o.file).maybeSingle();
  const res = exists
    ? await sb.from("offers").update(row).eq("id", exists.id)
    : await sb.from("offers").insert(row);
  if (res.error) {
    console.error(`✗ DB 실패: ${o.file} — ${res.error.message}`);
    continue;
  }
  ok++;
  console.log(`✓ ${exists ? "갱신" : "등록"} [${o.display_order}] ${o.school} (${o.student_alias})`);
}
console.log(`\n완료: ${ok}/${offers.length}건 — 전부 draft 상태입니다. /admin/offers 에서 후기 검토 후 공개로 전환하세요.`);
