// 빌드 후 합격증 갤러리 중복 정리 (Vercel 배포 시 실행).
// 자동 시드(offers-seed)로 등록된 카드와 관리자가 직접 올린 카드가 같은 오퍼로
// 겹치는 경우, "관리자 업로드본을 남기고" 시드본을 archived 로 전환한다.
// - 삭제가 아니라 보관(archived) — admin 에서 언제든 복구 가능, 이미지도 유지
// - 관리자 업로드 대응본이 실제로 존재할 때만 전환 (유일본은 절대 건드리지 않음)
// - env 없으면 조용히 skip, 항상 exit 0
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("[seed-dedupe] env 없음 → skip");
  process.exit(0);
}

// 시드 파일명 → 관리자 업로드 대응본을 찾는 조건 (한/영 표기 모두).
// 목록에 없는 시드(10~13번: Imagine·Le Rosey·YBI·Navitas)는 유일본이므로 유지.
const DUP_RULES = [
  { file: "01_USyd-Sustainability.png", any: ["sydney", "시드니"], not: ["western", "웨스턴", "taylors", "테일러스", "ilsc"], year: 2022 },
  { file: "02_USyd-USPP.png", any: ["taylors", "테일러스"] },
  { file: "03_UNSW-College-Commerce.png", any: ["unsw"] },
  { file: "04_UNSW-College-Medicine.png", any: ["unsw"] },
  { file: "05_QUT-Nursing.png", any: ["qut", "퀸즐랜드"] },
  { file: "06_Griffith-Uni-Nursing.png", any: ["griffith", "그리피스"], not: ["college", "칼리지"], year: 2026 },
  { file: "07_LaTrobe-College-Nursing.png", any: ["la trobe", "라트로브", "라 트로브"], mustHave: ["college", "칼리지"] },
  { file: "08_Griffith-College-Pathway.png", any: ["griffith", "그리피스"], mustHave: ["college", "칼리지"] },
  { file: "09_Glen-Eira-College.png", any: ["glen", "글렌"] },
];
const SEED_FILES = new Set([
  "01_USyd-Sustainability.png", "02_USyd-USPP.png", "03_UNSW-College-Commerce.png",
  "04_UNSW-College-Medicine.png", "05_QUT-Nursing.png", "06_Griffith-Uni-Nursing.png",
  "07_LaTrobe-College-Nursing.png", "08_Griffith-College-Pathway.png", "09_Glen-Eira-College.png",
  "10_Imagine-Cookery.png", "11_LeRosey-Hospitality.png", "12_YBI-Tiling.png", "13_Navitas-English.png",
]);

function manualMatches(row, r) {
  const s = (row.school ?? "").toLowerCase();
  if (!r.any.some((t) => s.includes(t))) return false;
  if (r.not && r.not.some((t) => s.includes(t))) return false;
  if (r.mustHave && !r.mustHave.some((t) => s.includes(t))) return false;
  if (r.year != null && row.year !== r.year) return false;
  return true;
}

const lines = [];
try {
  const sb = createClient(url, key);
  const { data: rows, error } = await sb
    .from("offers")
    .select("id, school, year, image_path, status");
  if (error) throw new Error(error.message);

  const manual = (rows ?? []).filter(
    (r) => r.status === "published" && r.image_path && !SEED_FILES.has(r.image_path),
  );

  let archived = 0;
  let kept = 0;
  for (const r of DUP_RULES) {
    const seedRow = (rows ?? []).find((x) => x.image_path === r.file && x.status === "published");
    if (!seedRow) continue; // 이미 정리됐거나 없음
    const twin = manual.find((m) => manualMatches(m, r));
    if (!twin) {
      kept++;
      lines.push(`유지(대응본 없음): ${r.file}`);
      continue;
    }
    const { error: upErr } = await sb
      .from("offers")
      .update({ status: "archived" })
      .eq("id", seedRow.id);
    if (upErr) {
      lines.push(`실패: ${r.file} — ${upErr.message}`);
    } else {
      archived++;
      lines.push(`중복 보관 처리: ${r.file} ↔ ${twin.school} (${twin.year ?? "-"})`);
    }
  }
  lines.unshift(`중복 정리 — 보관 ${archived}건 / 유지 ${kept}건 (${new Date().toISOString()})`);
  console.log(lines.map((l) => `[seed-dedupe] ${l}`).join("\n"));

  await sb.from("site_settings").upsert(
    { key: "seed_report_dedupe", value: lines.join("\n"), value_en: null, category: "internal", is_public: true },
    { onConflict: "key" },
  );
} catch (e) {
  console.log(`[seed-dedupe] 예외 → skip: ${e?.message ?? e}`);
}
process.exit(0);
