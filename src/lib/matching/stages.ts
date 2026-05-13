// 매칭 엔진 5단계 (PART J / PART F-3)
// 단계 1 의대 분기 → 2 교육→경로 → 3 차단룰 → 4 Wilson Alert → 5 카드 7장 조립

import { schools, blockingRules, wilsonAlerts, faqs, schoolsByName } from "@/data";
import { isSchoolMajorExcluded, getSchoolRegionsOverride } from "@/data/overrides";
import type { School, FaqEntry } from "@/data";
import type {
  DiagnoseInput, MatchResult, AgeRange, MedicalPathway,
  PathwayPlan, SchoolPick, AppliedBlock, AppliedAlert, Cards,
} from "./types";

// ─── helpers ────────────────────────────────────────────────────

function ageRange(age: number): AgeRange {
  if (age < 18) return "18미만";
  if (age <= 24) return "18-24";
  if (age <= 32) return "25-32";
  if (age <= 39) return "33-39";
  return "40+";
}

function ieltsNumber(v: unknown): number | null {
  if (v == null) return null;
  const s = String(v).match(/(\d+\.\d+|\d+)/);
  return s ? parseFloat(s[1]) : null;
}

function englishToIelts(level: DiagnoseInput["english_level"]): number {
  switch (level) {
    case "없음": return 0;
    case "4.0-5.0": return 4.5;
    case "5.5": return 5.5;
    case "6.0": return 6.0;
    case "6.5": return 6.5;
    case "7.0+": return 7.0;
  }
}

function regionToCity(r: DiagnoseInput["preferred_region"]): string | null {
  const map: Record<string, string> = {
    "시드니": "Sydney", "멜번": "Melbourne", "브리즈번": "Brisbane",
    "골드코스트": "Gold Coast", "퍼스": "Perth", "애들레이드": "Adelaide",
    "호바트": "Hobart", "캔버라": "Canberra",
  };
  return map[r] ?? null;
}

// 지역별 캠퍼스 매칭 패턴 (PART J / Wilson 검수)
// 매칭 우선순위: campus full string → 학교 이름.
// 본 캠퍼스가 해당 지역인 학교만 포함 (e.g. UNE Armidale은 "Sydney 6시간" 표기지만 시드니 X).
const REGION_PATTERNS: Record<string, RegExp> = {
  "시드니":     /Sydney(\s*\(NSW\)|\s*CBD)|^Sydney\b|\bUltimo\b|\bParramatta\b|\bWallumattagal\b|Macquarie Park|\bPenrith\b/i,
  "멜번":       /Melbourne(\s*\(VIC\)|\s*CBD|\s*Burwood|\s*Bundoora)?|^Melbourne\b|\bClayton\b|\bHawthorn\b|\bFootscray\b/i,
  "브리즈번":   /^Brisbane\b|Brisbane\s*\(QLD\)|Brisbane\s*CBD|\bSt Lucia\b|Gardens Point|Kelvin Grove|\bNathan\b/i,
  "골드코스트": /Gold Coast|\bRobina\b|\bSouthport\b|\bMt Gravatt\b/i,
  "퍼스":       /^Perth\b|Perth\s*CBD|\bBentley\b|\bJoondalup\b|\bMurdoch\b|\bCrawley\b|\bFremantle\b/i,
  "애들레이드": /^Adelaide\b|Adelaide\s*(CBD|Wakefield|North Terrace)|North Terrace|\bMagill\b/i,
  "호바트":     /^Hobart\b|Hobart\s*(CBD|Sandy Bay)|Sandy Bay/i,
  "캔버라":     /^Canberra\b|Canberra\s*\(ACT\)|\bBruce\b|\bActon\b/i,
};

function isSchoolInRegion(s: School, region: DiagnoseInput["preferred_region"]): boolean {
  if (region === "추천받기") return true;
  // (1) override 매핑 (campus 데이터 누락된 학교)
  const override = getSchoolRegionsOverride(s.name);
  if (override) return override.includes(region);
  const pat = REGION_PATTERNS[region];
  if (!pat) return true;
  // (2) PRIMARY 캠퍼스만 테스트 (' + '로 multi-campus 분리 / 첫 토큰 = 본 캠퍼스)
  // e.g. Newcastle "Callaghan + Newcastle CBD + Sydney CBD" → 'Callaghan' = Newcastle
  if (s.campus) {
    const primary = s.campus.split(/\s+\+\s+/)[0].trim();
    if (pat.test(primary)) return true;
  }
  // (3) 학교 이름 fallback (e.g. "UNSW Sydney", "Western Sydney University")
  if (pat.test(s.name)) return true;
  return false;
}

// ─── 단계 1: 의대 분기 (PART B-4) ────────────────────────────────

export function stage1_medicalBranch(input: DiagnoseInput): {
  is_medical: boolean;
  medical_pathway: MedicalPathway | null;
} {
  const is_medical = input.major === "의료";
  if (!is_medical) return { is_medical: false, medical_pathway: null };
  let pathway: MedicalPathway = "direct";
  if (input.education === "대졸") pathway = "graduate";
  else if (input.education === "대학재학") pathway = "transfer";
  else if (input.education === "워홀러") pathway = "converter";
  else if (input.education === "검정고시" || input.education === "고졸") pathway = "direct";
  return { is_medical, medical_pathway: pathway };
}

// ─── 단계 2: 교육 → 경로 (PART F-3) ───────────────────────────────

const PATHWAY_TEMPLATES: Record<string, PathwayPlan> = {
  "검정고시→Foundation→학사": {
    pathway: "검정고시 → Foundation → 학사",
    steps: ["ELICOS (선택)", "Foundation 1년", "학사 3년"],
    duration_years_min: 4, duration_years_max: 5,
  },
  "검정고시→Direct→학사": {
    pathway: "검정고시 → Direct → 학사",
    steps: ["IELTS 6.5 확보", "학사 3년 직접 진학"],
    duration_years_min: 3, duration_years_max: 4,
  },
  "고졸→Foundation→학사": {
    pathway: "고졸 → Foundation → 학사",
    steps: ["ELICOS (필요시)", "Foundation 1년", "학사 3년"],
    duration_years_min: 4, duration_years_max: 5,
  },
  "고졸→Diploma→학사2학년": {
    pathway: "고졸 → Diploma → 학사 2학년 편입",
    steps: ["Diploma 1년 (학사 1년 인정)", "학사 2년 (편입)"],
    duration_years_min: 3, duration_years_max: 3,
  },
  "대학재학→Transfer→학사": {
    pathway: "대학재학 → Credit Transfer → 학사",
    steps: ["학점 평가", "학사 편입 (2-3학년)"],
    duration_years_min: 2, duration_years_max: 3,
  },
  "대졸→PG→석사": {
    pathway: "대졸 → 석사 (PG)",
    steps: ["IELTS 6.5/7.0", "석사 1.5-2년"],
    duration_years_min: 1.5, duration_years_max: 2,
  },
  "워홀러→Vocational→TAFE→학사": {
    pathway: "워홀러 → Vocational / TAFE → 학사",
    steps: ["Bridge 코스 (필요시)", "Vocational/TAFE Diploma", "학사 편입 (선택)"],
    duration_years_min: 2, duration_years_max: 5,
  },
};

export function stage2_pathway(input: DiagnoseInput): PathwayPlan {
  const e = input.english_level;
  const hasHighEng = e === "6.5" || e === "7.0+";
  if (input.education === "검정고시") {
    return hasHighEng ? PATHWAY_TEMPLATES["검정고시→Direct→학사"] : PATHWAY_TEMPLATES["검정고시→Foundation→학사"];
  }
  if (input.education === "고졸") {
    return hasHighEng ? PATHWAY_TEMPLATES["고졸→Diploma→학사2학년"] : PATHWAY_TEMPLATES["고졸→Foundation→학사"];
  }
  if (input.education === "대학재학") return PATHWAY_TEMPLATES["대학재학→Transfer→학사"];
  if (input.education === "대졸") return PATHWAY_TEMPLATES["대졸→PG→석사"];
  return PATHWAY_TEMPLATES["워홀러→Vocational→TAFE→학사"];
}

// ─── 단계 3: 차단룰 적용 (36개) ───────────────────────────────────

export function stage3_blocking(input: DiagnoseInput, candidates: School[]): {
  blocks_hard: AppliedBlock[];
  blocks_soft: AppliedBlock[];
  filtered: School[];
} {
  const blocks_hard: AppliedBlock[] = [];
  const blocks_soft: AppliedBlock[] = [];
  const filtered: School[] = [];
  const ielts = englishToIelts(input.english_level);

  for (const sch of candidates) {
    let excluded = false;

    // (A) AHPRA: 간호 + IELTS < 7.0 → soft (영어 확보 가능)
    if (input.major === "간호" && ielts < 7.0) {
      const matched = blockingRules.find((r) => r.id === "MAJ-NUR-01");
      if (!blocks_soft.some((b) => b.rule_id === "AHPRA-IELTS")) {
        blocks_soft.push({
          rule_id: matched?.id ?? "AHPRA-IELTS",
          severity: "soft",
          title: "AHPRA 등록 기준 IELTS 7.0 필요",
          message: `간호 코스 진학을 위해서는 AHPRA 기준 IELTS 7.0 (각 영역 7.0) 필요합니다. 현재 ${input.english_level}.`,
          alternative: matched?.alternative ?? "ELICOS + 모의 IELTS 트랙으로 7.0 확보 후 간호 진학 권장",
        });
      }
    }

    // (B) UNSW + 간호 → hard (PART H-0 UNSW 간호 미운영)
    if (input.major === "간호" && /UNSW/i.test(sch.name)) {
      const matched = blockingRules.find((r) => /UNSW.*간호|UNSW.*Nursing/i.test(r.title));
      blocks_hard.push({
        rule_id: matched?.id ?? "BLOCK-UNSW-NUR",
        severity: "hard",
        title: matched?.title ?? "UNSW 간호 미운영",
        message: "UNSW는 학부/대학원 간호 코스를 운영하지 않습니다 (Wilson 학교 내부 검수).",
        alternative: matched?.alternative ?? "Sydney USyd / UTS / WSU / ACU 등 ANMAC 인증 학교 우선",
      });
      excluded = true;
    }

    // (C) 학교 status closed → exclude
    // (마스터에 status=active만 있어도 안전)

    // (D) 간호 + ANMAC 미인증 학교 → exclude
    if (input.major === "간호" && sch.anmac === null && /university/i.test(sch.type) === false) {
      // 대학이 아니면서 ANMAC 인증도 없으면 간호 추천 X
      excluded = true;
    }

    if (!excluded) filtered.push(sch);
  }
  return { blocks_hard, blocks_soft, filtered };
}

// ─── 단계 4: Wilson Alert 트리거 (24개, 운영자 전용) ─────────────

export function stage4_alerts(input: DiagnoseInput): AppliedAlert[] {
  const out: AppliedAlert[] = [];
  const age = input.age;
  const ielts = englishToIelts(input.english_level);

  for (const a of wilsonAlerts) {
    const c = a.conditions as Record<string, unknown>;
    const ageMin = (c.age_min as number) ?? null;
    const ageMax = (c.age_max as number) ?? null;
    const reqMajor = (c.major as string) ?? null;
    const reqEdu = (c.education as string) ?? null;
    const reqIeltsMax = (c.ielts_max as number) ?? null;

    if (ageMin != null && age < ageMin) continue;
    if (ageMax != null && age > ageMax) continue;
    if (reqMajor && reqMajor !== input.major) continue;
    if (reqEdu && reqEdu !== input.education) continue;
    if (reqIeltsMax != null && ielts > reqIeltsMax) continue;

    out.push({ alert_id: a.id, title: a.title ?? a.id, truth: a.truth ?? "" });
  }
  return out;
}

// ─── 시나리오 매칭 (FAQ scenarios → required modules) ─────────────

function pickScenario(input: DiagnoseInput): FaqEntry | null {
  const candidates = faqs.filter((f) => f.type === "scenario" && f.match);
  let best: FaqEntry | null = null;
  let bestScore = -1;
  for (const f of candidates) {
    const m = f.match!;
    let score = 0;
    if (m.education?.includes(input.education)) score += 3;
    if (m.major?.includes(input.major)) score += 4;
    if (m.is_medical === (input.major === "의료")) score += 1;
    if (score > bestScore) { bestScore = score; best = f; }
  }
  return bestScore >= 4 ? best : null;
}

// ─── 학교 추천 (지역 + 전공 + 예산 + 차단 후) ────────────────────

// Foundation 8 + Diploma 22 (고졸/검정고시 Pathway 경유 트랙)
function pathwaySchoolsFor(input: DiagnoseInput): School[] {
  // 지역 strict 필터. 전공 필터는 Foundation/Diploma 단계라 적용 X (Foundation = generalist).
  return schools
    .filter((s) => s.type === "foundation" || s.type === "diploma_verified")
    .filter((s) => isSchoolInRegion(s, input.preferred_region))
    .sort((a, b) => {
      // Foundation 우선 (연결 학사 명확), QS 낮은 순(=Top tier)
      if (a.type !== b.type) return a.type === "foundation" ? -1 : 1;
      return (a.qs ?? 999) - (b.qs ?? 999);
    })
    .slice(0, 4);
}

function topSchoolsFor(input: DiagnoseInput): School[] {
  const majorKeywords: Record<string, RegExp> = {
    "간호": /nursing|간호/i,
    "IT": /information|computing|IT|software|computer/i,
    "비즈니스": /business|commerce|accounting|회계|비즈니스/i,
    "공학": /engineering|공학/i,
    "요리·호텔": /cookery|hospitality|culinary|요리|호텔/i,
    "유아교육": /early childhood|education|유아|교육/i,
    "디자인": /design|디자인/i,
    "Trade": /trade|carpentry|electrician|plumb/i,
    "의료": /medic|medicine|의/i,
    "미정": /.*/,
  };
  const re = majorKeywords[input.major] ?? /.*/;

  // (1) university만 (Foundation/Diploma는 pathwaySchoolsFor에서) → (2) 전공 필터 → (3) override 차단 → (4) 지역 strict → (5) 정렬 → (6) top 3
  const scored = schools
    .filter((s) => s.type === "university")
    .filter((s) => s.programs.some((p) => re.test(p.name ?? "")))
    .filter((s) => !isSchoolMajorExcluded(s.name, input.major))
    .filter((s) => isSchoolInRegion(s, input.preferred_region))
    .map((s) => {
      let score = 0;
      if (s.qs && s.qs <= 100) score += 3;
      else if (s.qs && s.qs <= 300) score += 2;
      if (s.type === "university") score += 1;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.s);

  return scored;
}

function schoolToPick(s: School, input: DiagnoseInput): SchoolPick {
  const re = new RegExp(
    input.major === "간호" ? "nursing|간호" :
    input.major === "IT" ? "information|computing|IT|software" :
    input.major === "비즈니스" ? "business|commerce|account" :
    input.major === "공학" ? "engineering" :
    input.major === "요리·호텔" ? "cookery|hospitality" :
    input.major === "유아교육" ? "early childhood|education" :
    input.major === "디자인" ? "design" :
    input.major === "Trade" ? "trade" :
    input.major === "의료" ? "medic" : ".*",
    "i"
  );
  const progs = s.programs.filter((p) => re.test(p.name ?? "")).slice(0, 3);
  const reasons: string[] = [];
  if (s.qs && s.qs <= 100) reasons.push("QS 100위 이내");
  if (isSchoolInRegion(s, input.preferred_region)) reasons.push(`${input.preferred_region} 위치`);
  if (s.anmac && input.major === "간호") reasons.push("ANMAC 인증");
  return {
    id: s.id, name: s.name, city: s.city, state: s.state, type: s.type, qs: s.qs,
    reason: reasons.join(" · ") || "Wilson 검수 정본 학교",
    programs: progs.map((p) => ({ name: p.name, ielts: p.ielts, tuition: p.tuition, pr_cat: p.pr_cat, pr_grade: p.pr_grade })),
  };
}

// ─── 단계 5: 카드 7장 데이터 조립 ─────────────────────────────────

export function stage5_cards(
  input: DiagnoseInput,
  pathway: PathwayPlan,
  schoolsPicks: SchoolPick[],
  scenario: FaqEntry | null,
  blocks: { hard: AppliedBlock[]; soft: AppliedBlock[] },
): Cards {
  const regionFaq = faqs.find((f) => f.type === "region" && f.id === `region_${input.preferred_region}`);
  const majorFaq = faqs.find((f) => f.type === "major" && f.id === `major_${input.major}`);
  const visaFaq = faqs.find((f) => f.id === "visa_pr_학생비자_500");

  // 고졸/검정고시 = 2경로 (학사 직접 + Pathway 경유)
  const showDualPath = input.education === "고졸" || input.education === "검정고시";
  const pathwayPicks: SchoolPick[] = showDualPath
    ? pathwaySchoolsFor(input).map((s) => ({
        id: s.id, name: s.name, city: s.city, state: s.state, type: s.type, qs: s.qs,
        reason: s.type === "foundation"
          ? `Foundation → ${s.operator ?? "학사 연결"} 1학년 진입`
          : `Diploma → 학사 2학년 편입`,
        programs: s.programs.map((p) => ({ name: p.name, ielts: p.ielts, tuition: p.tuition })),
      }))
    : [];

  // 카드 1 empty 메시지 (지역 strict 매칭 결과 0건일 때)
  const directEmpty = schoolsPicks.length === 0;
  const pathwayEmpty = pathwayPicks.length === 0;
  const emptyMsg = directEmpty && (!showDualPath || pathwayEmpty)
    ? `${input.preferred_region} 지역에 ${input.major} 코스를 운영하는 정본 학교가 적습니다. 다른 지역 추가 고려 또는 카톡 상담으로 케이스별 안내를 권장합니다.`
    : undefined;

  const pathwayNote = showDualPath
    ? "내신 상위 + 영어 충족 → 학사 직접 입학. 내신 부족하면 Foundation (1년) 또는 Diploma → 학사 2학년 편입. 두 트랙 다 최종 학위는 동일합니다."
    : undefined;
  const consultNote = showDualPath
    ? "정확한 경로는 내신/영어 평가 후 1:1 카톡 상담에서 확정합니다."
    : undefined;

  // PR 정보 (간호/요리·호텔/IT 등은 PR 경로 있음)
  let prInfo: string | undefined;
  if (input.major === "간호") prInfo = "MLTSSL 등재 · 졸업 → 485 비자 → 직업평가 → 189/190/491 신청";
  else if (input.major === "IT") prInfo = "Software Engineer 등 MLTSSL · ACS 직업평가 필요";
  else if (input.major === "요리·호텔") prInfo = "Cook/Chef MLTSSL · 경력 + 직업평가 (TRA)";
  else if (input.major === "Trade") prInfo = "전기·배관·목공 등 MLTSSL · TRA 평가";

  const cards: Cards = {
    card1_schools: {
      title: "추천 학교",
      items: schoolsPicks,
      pathway_items: showDualPath ? pathwayPicks : undefined,
      show_dual_path: showDualPath,
      pathway_note: pathwayNote,
      consultation_note: consultNote,
      empty_message: emptyMsg,
    },
    card2_region: {
      title: "지역 정보",
      region: input.preferred_region,
      description: regionFaq?.card_text?.split("\n").slice(0, 6).join("\n") ?? `${input.preferred_region} 지역 학교를 우선 추천합니다.`,
      faq_text: regionFaq?.card_text,
    },
    card3_pathway: {
      title: "진학 경로",
      plan: pathway,
      scenario_id: scenario?.id,
      faq_text: scenario?.card_text,
    },
    card4_major: {
      title: "전공",
      major: input.major,
      description: majorFaq?.card_text?.split("\n").slice(0, 6).join("\n") ?? `${input.major} 전공 안내.`,
      faq_text: majorFaq?.card_text,
      pr_info: prInfo,
    },
    card5_visa_pr: {
      title: "비자 & PR",
      visa: "학생비자 500 (Subclass 500)",
      pr_paths: prInfo ? ["485 졸업비자", "직업평가", "189/190/491 PR"] : ["485 졸업비자", "스킬리스트 확인 필요"],
      faq_text: visaFaq?.card_text,
    },
    card6_wilson: {
      title: "Wilson 추천",
      quote: blocks.hard.length > 0
        ? "차단 룰이 적용된 케이스입니다. 대안 경로를 직접 확인해드릴게요."
        : "19년 컨설팅 + 호주 학교 교직원 경력으로 본 케이스, 진학 후 학교 케어까지 동선이 잡힙니다.",
      recommendation: scenario?.wilson_note?.split("\n").slice(0, 8).join("\n")
        ?? "1:1 카톡 상담에서 학비/장학금/세부 학교 비교까지 무료로 안내드립니다.",
    },
    card7_next: {
      title: "다음 액션",
      actions: [
        { label: "💬 카톡 1:1 상담 (30분 무료)", kind: "kakao" },
        { label: "📩 결과를 이메일로 받기", kind: "form" },
        { label: "📋 학교 비교표 받기 (PDF)", kind: "form" },
      ],
    },
  };
  return cards;
}

// ─── 통합 매칭 함수 ───────────────────────────────────────────────

export function matchDiagnose(input: DiagnoseInput): MatchResult {
  const medical = stage1_medicalBranch(input);
  const pathway = stage2_pathway(input);
  const topSchools = topSchoolsFor(input);
  const { blocks_hard, blocks_soft, filtered } = stage3_blocking(input, topSchools);
  const alerts = stage4_alerts(input);
  const scenario = pickScenario(input);

  const picks = filtered.slice(0, 3).map((s) => schoolToPick(s, input));
  const cards = stage5_cards(input, pathway, picks, scenario, { hard: blocks_hard, soft: blocks_soft });

  return {
    age_range: ageRange(input.age),
    is_medical: medical.is_medical,
    medical_pathway: medical.medical_pathway,
    scenario_id: scenario?.id ?? null,
    blocks_hard, blocks_soft, alerts,
    cards,
  };
}
