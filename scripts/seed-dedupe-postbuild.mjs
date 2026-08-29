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

  // 일회성: 후기(메모) 없는 19장은 공개하지 않기로 함 — 이미 published 로
  // 들어갔다면 draft 로 내린다. site_settings 가드로 한 번만 실행되므로
  // 이후 관리자가 admin 에서 공개로 바꾸면 그대로 유지된다.
  const DEMOTE_KEY = "seed_demote_v1";
  const DEMOTE_FILES = [
    "m01_UNSW-College_KIM.jpg","m02_LaTrobe-College_KIM.jpg","m03_QUT-Nursing-PKG_SEO.jpg",
    "m04_ILSC-Sydney_SONG.jpg","m05_Griffith-Nursing_OH.jpg","m06_Griffith-Medicine.jpg",
    "m07_UNSW-College_JEONG.jpg","m09_USyd-Commerce_PARK.jpg","m11_UNSW-College_SONG.jpg",
    "m13_Griffith-College_OH.jpg","m15_UniSA-Physio_LEE.jpg","m18_UTS-IT_CHAE.jpg",
    "m19_UNSW-College_SUNG.jpg","m20_GlenEira-College_KIM.jpg","m24_BROWNS-HSP_KWON.jpg",
    "m26_Newcastle-Nursing-Award_KIM.jpg","m27_Monash-Medicine-PKG_KIM.jpg",
    "m28_TRA-PSA-Carpenter_KIM.jpg","m30_USyd-Sustainability_KIM.jpg",
  ];
  const { data: demoteDone } = await sb
    .from("site_settings").select("key").eq("key", DEMOTE_KEY).maybeSingle();
  if (!demoteDone) {
    const { data: demoted, error: demErr } = await sb
      .from("offers")
      .update({ status: "draft" })
      .in("image_path", DEMOTE_FILES)
      .eq("status", "published")
      .select("image_path");
    if (demErr) {
      lines.push(`비공개 처리 실패: ${demErr.message}`);
    } else {
      lines.push(`후기 없는 카드 비공개(draft) 처리: ${(demoted ?? []).length}건`);
      // 같은 케이스의 어제 자동분(구 시드 중복 9종)도 함께 보관 —
      // 후기 없는 카드가 자동분으로만 남아 보이는 혼선 방지. 유일본 4장은 유지.
      const OLD_DUP_FILES = [
        "01_USyd-Sustainability.png", "02_USyd-USPP.png", "03_UNSW-College-Commerce.png",
        "04_UNSW-College-Medicine.png", "05_QUT-Nursing.png", "06_Griffith-Uni-Nursing.png",
        "07_LaTrobe-College-Nursing.png", "08_Griffith-College-Pathway.png", "09_Glen-Eira-College.png",
      ];
      const { data: oldArch } = await sb
        .from("offers")
        .update({ status: "archived" })
        .in("image_path", OLD_DUP_FILES)
        .eq("status", "published")
        .select("image_path");
      lines.push(`구 자동분 중복 보관 처리: ${(oldArch ?? []).length}건`);
      await sb.from("site_settings").upsert(
        { key: DEMOTE_KEY, value: new Date().toISOString(), value_en: null, category: "internal", is_public: true },
        { onConflict: "key" },
      );
    }
  }
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
  // 2차: 완전 동일 카드(학교·연도·별칭·과정이 모두 같은 published 행) — 두 번 올라간 실수 정리.
  // 후기 있는 쪽 > display_order 낮은 쪽을 남기고 나머지를 보관 처리.
  const { data: rows2 } = await sb
    .from("offers")
    .select("id, school, year, student_alias, program, story, display_order, status")
    .eq("status", "published");
  const groups = new Map();
  for (const r of rows2 ?? []) {
    const k = [
      (r.school ?? "").trim().toLowerCase(),
      r.year ?? "",
      (r.student_alias ?? "").trim(),
      (r.program ?? "").trim().toLowerCase(),
    ].join("|");
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    g.sort(
      (a, b) =>
        (b.story ? 1 : 0) - (a.story ? 1 : 0) ||
        (a.display_order ?? 999) - (b.display_order ?? 999),
    );
    for (const extra of g.slice(1)) {
      const { error: e2 } = await sb
        .from("offers")
        .update({ status: "archived" })
        .eq("id", extra.id);
      if (!e2) {
        archived++;
        lines.push(`동일 카드 중복 보관: ${extra.school} (${extra.year ?? "-"} · ${extra.student_alias ?? "-"})`);
      }
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
