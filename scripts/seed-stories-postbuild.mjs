// 빌드 후 합격 오퍼 '후기(story)' 자동 입력 (Vercel 배포 시 실행).
// 운영 방식: Wilson 이 후기 메모를 주면 → offer-stories/stories.json 에 원고 추가 → 배포되면 자동 입력.
// - env 없으면(로컬 빌드 등) 조용히 skip — 빌드를 절대 깨뜨리지 않는다 (항상 exit 0)
// - 기존 offers 행을 학교명·연도·별칭 규칙으로 찾아 story 가 "비어있는 행만" 채운다.
//   → admin 에서 이미 작성·수정한 후기는 재배포로 절대 덮어써지지 않는다 (멱등).
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("[seed-stories] env 없음 (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) → skip");
  process.exit(0);
}

// match 규칙: schoolAny(하나라도 포함, 소문자) / schoolNot(포함 시 제외) / year / aliasPrefix
function matches(row, m) {
  const school = (row.school ?? "").toLowerCase();
  if (!m.schoolAny.some((s) => school.includes(s))) return false;
  if (m.schoolNot && school.includes(m.schoolNot)) return false;
  if (m.year != null && row.year !== m.year) return false;
  if (m.aliasPrefix && !(row.student_alias ?? "").startsWith(m.aliasPrefix)) return false;
  return true;
}

try {
  const sb = createClient(url, key);
  const stories = JSON.parse(
    readFileSync(new URL("./offer-stories/stories.json", import.meta.url), "utf8"),
  );

  const { data: rows, error: selErr } = await sb
    .from("offers")
    .select("id, school, year, student_alias, story");
  if (selErr) throw new Error(`offers 조회 실패: ${selErr.message}`);

  let filled = 0;
  let kept = 0;
  let miss = 0;
  let failed = 0;

  for (const s of stories) {
    const cands = (rows ?? []).filter((r) => matches(r, s.match));
    if (cands.length === 0) {
      miss++;
      console.log(`[seed-stories] ? 대상 없음: [${s.no}] ${s.title}`);
      continue;
    }
    for (const row of cands) {
      if (row.story && row.story.trim() !== "") {
        kept++;
        continue;
      }
      const { error: upErr } = await sb
        .from("offers")
        .update({ story: s.story })
        .eq("id", row.id);
      if (upErr) {
        failed++;
        console.log(`[seed-stories] ✗ 입력 실패: [${s.no}] ${row.school} — ${upErr.message}`);
      } else {
        filled++;
        row.story = s.story; // 같은 행 중복 매칭 방지
        console.log(`[seed-stories] ✓ 입력: [${s.no}] ${row.school} (${row.student_alias ?? "-"})`);
      }
    }
  }

  console.log(
    `[seed-stories] 완료 — 입력 ${filled} / 기존 후기 유지 ${kept} / 대상 없음 ${miss} / 실패 ${failed}`,
  );
} catch (e) {
  console.log(`[seed-stories] 예외 → skip: ${e?.message ?? e}`);
}
process.exit(0);
