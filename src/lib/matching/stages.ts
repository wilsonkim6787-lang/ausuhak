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

function ageRange(age: number | undefined): AgeRange | null {
  if (age == null) return null;
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
// `\bCity\b(?!\s*차)` 패턴은 "Sydney 차 6시간" 같은 distance suffix 배제.
// 본 캠퍼스 검사는 isSchoolInRegion 에서 campus split + primary 만.
const REGION_PATTERNS: Record<string, RegExp> = {
  "시드니":     /\bSydney\b(?!\s*차)|\bUltimo\b|\bParramatta\b|\bWallumattagal\b|Macquarie Park|\bPenrith\b|\bSurry Hills\b|\bPyrmont\b|\bHyde Park\b/i,
  "멜번":       /\bMelbourne\b(?!\s*차)|\bClayton\b|\bHawthorn\b|\bFootscray\b|\bBox Hill\b|\bChadstone\b|\bDandenong\b|\bFrankston\b|\bSunshine\b/i,
  "브리즈번":   /\bBrisbane\b(?!\s*차)|\bSt Lucia\b|Gardens Point|Kelvin Grove|\bNathan\b|South Bank/i,
  "골드코스트": /Gold Coast|\bRobina\b|\bSouthport\b|\bMt Gravatt\b/i,
  "퍼스":       /\bPerth\b(?!\s*차)|\bBentley\b|\bJoondalup\b|\bMurdoch\b|\bCrawley\b|\bFremantle\b/i,
  "애들레이드": /\bAdelaide\b(?!\s*차)|North Terrace|\bMagill\b|Days Rd|Sturt St|Regency|Tonsley/i,
  "호바트":     /\bHobart\b|Sandy Bay|Launceston|Burnie/i,
  "캔버라":     /\bCanberra\b|\bBruce\b|\bActon\b/i,
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

  // 요리·호텔·Trade = vocational 트랙. 학점 transfer·Foundation·학사 곧바로 진학 X — Cert III 부터 시작.
  // education (검정고시/고졸/대학재학/대졸/워홀러) 무관하게 동일 트랙 — Wilson 명시 2026-05-19.
  "요리·호텔→Vocational": {
    pathway: "요리·호텔 → Cert III → Diploma → (Bachelor 선택)",
    steps: [
      "(필요시) ELICOS 또는 한국에서 IELTS 6.0 확보",
      "Cert III in Commercial Cookery 1-1.5년 — Chef·Cook 기초",
      "Cert IV in Kitchen Management 0.5년 — Sous Chef 진입 (선택)",
      "Diploma of Hospitality Management 1-2년 — Restaurant·Hotel Manager (선택)",
      "Bachelor of Culinary/Hotel Mgmt 2-3년 — William Angliss·BMIHMS·ICHM (선택)",
    ],
    duration_years_min: 1, duration_years_max: 5,
  },
  "Trade→Vocational": {
    pathway: "Trade → Cert III + Apprenticeship",
    steps: [
      "(필요시) ELICOS 또는 IELTS 5.5 확보 — Trade 는 영어 요건 낮음",
      "Cert III in Trade (Carpentry/Electrical/Plumbing) 1.5-2년",
      "Apprenticeship 호주 현장 실습 1-2년 (임금 받음)",
      "Cert IV / Diploma 진입 — Site Supervisor 트랙 (선택)",
      "TRA 직업평가 → 485 → 189/190 PR 진입",
    ],
    duration_years_min: 2, duration_years_max: 4,
  },
};

// 의료 (MBBS/MD) 전용 pathway — stage1_medicalBranch 분기 결과별 1대1 매핑.
// 의대는 일반 학사·석사 분류와 달리 ISAT/GAMSAT·MMI 등 별도 진학 시험·인터뷰 동선이 필수라
// PATHWAY_TEMPLATES 와 분리. (Wilson 정본 / /medical sub-funnel 과 정합)
const MEDICAL_PATHWAYS: Record<MedicalPathway, PathwayPlan> = {
  direct: {
    pathway: "의대 본 과정 (MBBS/MD 6년 통합)",
    steps: [
      "ISAT 또는 UCAT 응시 (학교별 다름)",
      "IELTS 7.0+ (각 영역 7.0)",
      "MMI 인터뷰 통과",
      "MBBS/MD 6년 (Adelaide BMD-MD · UQ Provisional · UNSW Med 등)",
    ],
    duration_years_min: 6, duration_years_max: 6,
  },
  graduate: {
    pathway: "대졸 → GAMSAT → MD 4년 (Graduate Entry)",
    steps: [
      "Bachelor 학점 Distinction 이상 유지",
      "GAMSAT (또는 MCAT) 응시 + IELTS 7.0",
      "MMI 인터뷰 통과",
      "MD 4년 (USyd · Melbourne · Monash · UQ Grad 등)",
    ],
    duration_years_min: 4, duration_years_max: 4,
  },
  transfer: {
    pathway: "대학재학 → 의대 재진입 (학점 이전 거의 불가 / 재시작 케이스 다수)",
    steps: [
      "현 학점 평가 — 대부분 의대는 학점 이전 불인정",
      "재학 단계에 따라 ISAT (학사 곧바로) 또는 GAMSAT (졸업 후 PG 대기)",
      "IELTS 7.0+ · MMI",
      "MBBS/MD 재시작 또는 GAMSAT 후 Graduate Entry MD",
    ],
    duration_years_min: 4, duration_years_max: 6,
  },
  converter: {
    pathway: "워홀러 → 학력 인정 + GAMSAT → MD (long-shot)",
    steps: [
      "기존 학력 인정 평가 (학사 없으면 학사 선이수)",
      "IELTS 7.0+ / GAMSAT",
      "MD 4년 (Graduate Entry) 또는 MBBS 6년 (Direct)",
    ],
    duration_years_min: 4, duration_years_max: 8,
  },
  undergrad: {
    pathway: "학사 진행 중 → 졸업 후 Graduate Entry MD 대기",
    steps: [
      "현 학사 졸업 (Distinction 이상 유지)",
      "GAMSAT + IELTS 7.0",
      "MD 4년 (Graduate Entry)",
    ],
    duration_years_min: 4, duration_years_max: 5,
  },
};

// 검정고시·고졸 = Diploma/TAFE → 학사 2학년 편입 (또는 Foundation) — Wilson 정본 2026-05-20.
// 호주 모든 학교가 검정고시·고졸 곧바로 진학 불가. 간호=IELTS 6.5 / 그 외=IELTS 6.0 임계점.
// 간호는 Foundation 분기 금지 — Wilson 정본 (Foundation = 일반 학사 트랙이라 ANMAC 간호 진입 동선과 어긋남).
// IELTS 부족하면 ELICOS → Diploma of Health Sciences (College) 또는 TAFE Diploma of Nursing (EN) → RN 편입.
function buildPathwayForGedOrHighSchool(
  education: "검정고시" | "고졸",
  major: DiagnoseInput["major"],
  englishIelts: number,
): PathwayPlan {
  if (major === "간호") {
    if (englishIelts >= 6.5) {
      return {
        pathway: `${education} → Diploma of Health Sciences → 간호 학사 2학년 편입`,
        steps: [
          "IELTS 6.5 확보",
          "Diploma of Health Sciences 1년 (Griffith/Deakin/QUT College 등)",
          "Bachelor of Nursing 2학년 편입 (2년)",
          "졸업 후 AHPRA 등록 IELTS 7.0 (각 영역) 필요",
        ],
        duration_years_min: 3, duration_years_max: 3,
      };
    }
    return {
      pathway: `${education} → ELICOS → TAFE Diploma of Nursing (EN) → RN Bachelor 편입`,
      steps: [
        "ELICOS 또는 한국에서 IELTS 6.5 확보",
        "TAFE Diploma of Nursing 1.5-2년 (Enrolled Nurse)",
        "EN 등록 → 485 졸업비자 → RN Bachelor 2학년 편입",
        "RN 졸업 후 AHPRA 등록 IELTS 7.0 (각 영역) 필요",
      ],
      duration_years_min: 4, duration_years_max: 5,
    };
  }

  const ieltsTarget = 6.0;
  if (englishIelts >= ieltsTarget) {
    return {
      pathway: `${education} → Diploma/TAFE → 학사 2학년 편입`,
      steps: [
        "IELTS 6.0 확보",
        "Diploma 1년 (College 또는 TAFE)",
        "학사 2년 편입",
      ],
      duration_years_min: 3, duration_years_max: 3,
    };
  }
  return {
    pathway: `${education} → ELICOS → Foundation → 학사`,
    steps: ["ELICOS (IELTS 5.5 도달)", "Foundation 1년", "학사 3년"],
    duration_years_min: 4, duration_years_max: 5,
  };
}

export function stage2_pathway(input: DiagnoseInput): PathwayPlan {
  // (0) 의료 override — stage1_medicalBranch 와 동일 분류로 MEDICAL_PATHWAYS 매핑.
  //     일반 학사·석사 트랙과 다른 ISAT/GAMSAT·MMI 동선이라 최상단 분기.
  if (input.major === "의료") {
    const med = stage1_medicalBranch(input);
    return MEDICAL_PATHWAYS[med.medical_pathway ?? "direct"];
  }

  // (1) Vocational major override — education 무관 (Wilson 명시 2026-05-19)
  if (input.major === "요리·호텔") return PATHWAY_TEMPLATES["요리·호텔→Vocational"];
  if (input.major === "Trade") return PATHWAY_TEMPLATES["Trade→Vocational"];

  // (2) 검정고시·고졸 = 동일 처리, major 따라 IELTS 임계점 분기 (Wilson 2026-05-20)
  if (input.education === "검정고시" || input.education === "고졸") {
    return buildPathwayForGedOrHighSchool(
      input.education,
      input.major,
      englishToIelts(input.english_level),
    );
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

  // ── 인풋 레벨 룰 (학교 loop 밖) ───────────────────────────────
  // AHPRA IELTS 7.0: 간호 + IELTS < 7.0 → soft 1회만
  if (input.major === "간호" && ielts < 7.0) {
    const matched = blockingRules.find((r) => r.id === "MAJ-NUR-01");
    blocks_soft.push({
      rule_id: matched?.id ?? "AHPRA-IELTS",
      severity: "soft",
      title: "AHPRA 등록 기준 IELTS 7.0 필요",
      message: `간호 코스 진학을 위해서는 AHPRA 기준 IELTS 7.0 (각 영역 7.0) 필요합니다. 현재 ${input.english_level}.`,
      alternative: matched?.alternative ?? "ELICOS + 모의 IELTS 트랙으로 7.0 확보 후 간호 진학 권장",
    });
  }

  // ── 학교 레벨 룰 (loop 안) ────────────────────────────────────
  for (const sch of candidates) {
    let excluded = false;

    // (B) UNSW + 간호 → hard (PART H-0 UNSW 간호 미운영)
    if (input.major === "간호" && /UNSW/i.test(sch.name)) {
      const matched = blockingRules.find((r) => /UNSW.*간호|UNSW.*Nursing/i.test(r.title));
      if (!blocks_hard.some((b) => b.rule_id === (matched?.id ?? "BLOCK-UNSW-NUR"))) {
        blocks_hard.push({
          rule_id: matched?.id ?? "BLOCK-UNSW-NUR",
          severity: "hard",
          title: matched?.title ?? "UNSW 간호 미운영",
          message: "UNSW는 학부/대학원 간호 코스를 운영하지 않습니다 (Wilson 학교 내부 검수).",
          alternative: matched?.alternative ?? "Sydney USyd / UTS / WSU / ACU 등 ANMAC 인증 학교 우선",
        });
      }
      excluded = true;
    }

    // (D) 간호 + ANMAC 미인증 + 대학 아님 → 조용히 제외
    if (input.major === "간호" && sch.anmac === null && /university/i.test(sch.type) === false) {
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

    if (ageMin != null && (age == null || age < ageMin)) continue;
    if (ageMax != null && (age == null || age > ageMax)) continue;
    if (reqMajor && reqMajor !== input.major) continue;
    if (reqEdu && reqEdu !== input.education) continue;
    if (reqIeltsMax != null && ielts > reqIeltsMax) continue;

    out.push({ alert_id: a.id, title: a.title ?? a.id, truth: a.truth ?? "" });
  }
  // Dedupe by alert_id (안전 차원 / 정본에 동일 id 중복 시)
  const seen = new Set<string>();
  return out.filter((a) => (seen.has(a.alert_id) ? false : (seen.add(a.alert_id), true)));
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

// Foundation 8 + Diploma 22 (고졸/검정고시 Pathway 경유 트랙 — 비-간호 전공용)
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

// ── 간호 전용 Pathway (Wilson 19년 정본) ─────────────────────────
// master_v2_clean의 간호 Pathway 데이터가 messy해서 (TAFE가 type='university'로 잘못 들어가는 등)
// Wilson 검수 기준 직접 큐레이션. Foundation은 간호 매칭에서 완전 제외.
type NursingPathwaySchool = {
  id: string;
  name: string;
  kind: "diploma_pathway" | "tafe_diploma_nursing";
  region: string[];   // DiagnoseInput.preferred_region 값
  state: string;
  programName: string;
  ielts: string;
  prInfo?: string;
};

const NURSING_PATHWAY: NursingPathwaySchool[] = [
  // (1) Diploma → 학사 2학년 편입 (IELTS 6.5)
  { id: "griffith-college-nur", name: "Griffith College",
    kind: "diploma_pathway", region: ["브리즈번", "골드코스트"], state: "QLD",
    programName: "Diploma of Health Care → 학사 2학년 편입", ielts: "IELTS 6.5" },
  { id: "deakin-college-nur", name: "Deakin College",
    kind: "diploma_pathway", region: ["멜번"], state: "VIC",
    programName: "Diploma of Health Sciences → 학사 2학년 편입", ielts: "IELTS 6.5" },
  { id: "qut-intl-college-nur", name: "QUT International College",
    kind: "diploma_pathway", region: ["브리즈번"], state: "QLD",
    programName: "Diploma of Health Sciences → 학사 2학년 편입", ielts: "IELTS 6.5" },

  // (2) TAFE Diploma of Nursing (EN = Enrolled Nurse, IELTS 7.0 각 영역)
  { id: "tafe-nsw-nur", name: "TAFE NSW",
    kind: "tafe_diploma_nursing", region: ["시드니"], state: "NSW",
    programName: "Diploma of Nursing (Enrolled Nurse)", ielts: "IELTS 7.0 (각 영역)",
    prInfo: "EN → 485 → RN Bachelor 2학년 편입" },
  { id: "tafe-vic-nur", name: "TAFE Victoria",
    kind: "tafe_diploma_nursing", region: ["멜번"], state: "VIC",
    programName: "Diploma of Nursing (Enrolled Nurse)", ielts: "IELTS 7.0 (각 영역)",
    prInfo: "EN → 485 → RN Bachelor 2학년 편입" },
  { id: "tafe-qld-nur", name: "TAFE Queensland",
    kind: "tafe_diploma_nursing", region: ["브리즈번", "골드코스트"], state: "QLD",
    programName: "Diploma of Nursing (Enrolled Nurse)", ielts: "IELTS 7.0 (각 영역)",
    prInfo: "EN → 485 → RN Bachelor 2학년 편입" },
  { id: "tafe-sa-nur", name: "TAFE SA",
    kind: "tafe_diploma_nursing", region: ["애들레이드"], state: "SA",
    programName: "Diploma of Nursing (Enrolled Nurse)", ielts: "IELTS 7.0 (각 영역)",
    prInfo: "EN → 485 → RN Bachelor 2학년 편입" },
  { id: "tafe-wa-nur", name: "TAFE WA",
    kind: "tafe_diploma_nursing", region: ["퍼스"], state: "WA",
    programName: "Diploma of Nursing (Enrolled Nurse)", ielts: "IELTS 7.0 (각 영역)",
    prInfo: "EN → 485 → RN Bachelor 2학년 편입" },
  { id: "tastafe-nur", name: "TasTAFE",
    kind: "tafe_diploma_nursing", region: ["호바트"], state: "TAS",
    programName: "Diploma of Nursing (Enrolled Nurse)", ielts: "IELTS 7.0 (각 영역)",
    prInfo: "EN → 485 → RN Bachelor 2학년 편입" },
];

function nursingPathwayPicks(input: DiagnoseInput): SchoolPick[] {
  const region = input.preferred_region;
  return NURSING_PATHWAY
    .filter((s) => region === "추천받기" ? true : s.region.includes(region))
    .map((s) => ({
      id: s.id,
      name: s.name,
      city: null,
      state: s.state,
      type: s.kind === "diploma_pathway" ? "diploma_verified" : "tafe",
      qs: null,
      reason: s.kind === "diploma_pathway"
        ? "Diploma → 학사 2학년 편입 · IELTS 6.5"
        : `TAFE Diploma (Enrolled Nurse) · ${s.prInfo}`,
      programs: [{ name: s.programName, ielts: s.ielts }],
    }));
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

  // 요리·호텔·Trade 는 vocational 트랙이 핵심이라 university 외에도 TAFE / 사립 specialist / pathway_college 포함.
  // 그 외 전공 (간호·IT·비즈니스 등) 은 기존대로 university only (Foundation/Diploma 는 pathwaySchoolsFor 에서 처리).
  const vocationalMajor = input.major === "요리·호텔" || input.major === "Trade";
  const allowedTypes: string[] = vocationalMajor
    ? ["university", "tafe", "vocational_private", "pathway_college"]
    : ["university"];

  // 학교 등급 score: 사립 specialist (요리·호텔에선 브랜드 가치 큼) > TAFE > university (QS) > pathway_college.
  // 일반 university 전공에선 QS 우선.
  const scored = schools
    .filter((s) => allowedTypes.includes(s.type))
    .filter((s) => s.programs.some((p) => re.test(p.name ?? "")))
    .filter((s) => !isSchoolMajorExcluded(s.name, input.major))
    .filter((s) => isSchoolInRegion(s, input.preferred_region))
    .map((s) => {
      let score = 0;
      if (vocationalMajor) {
        // 요리·호텔·Trade: specialist 우선
        if (s.type === "vocational_private") score += 4;
        else if (s.type === "tafe") score += 3;
        else if (s.type === "university") score += 2;
        else if (s.type === "pathway_college") score += 1;
      } else {
        // 일반 전공: QS 우선
        if (s.qs && s.qs <= 100) score += 3;
        else if (s.qs && s.qs <= 300) score += 2;
        if (s.type === "university") score += 1;
      }
      return { s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.s);

  return scored;
}

// education → program level 우선순위. master_v2_clean.programs[].level 이 비어있거나 비표준이면
// fallback 으로 programs[].name 도 검사 (Bachelor / Master / Diploma 키워드).
function programLevelRank(p: { level?: string; name?: string }, education: DiagnoseInput["education"]): number {
  const text = `${p.level ?? ""} ${p.name ?? ""}`.toLowerCase();
  const isMaster = /\b(master|graduate entry|md|phd|pg|postgraduate)\b/.test(text);
  const isBachelor = /\b(bachelor|honours)\b/.test(text) && !isMaster;
  const isDipFound = /\b(diploma|foundation|cert|certificate)\b/.test(text);

  if (education === "대졸") {
    if (isMaster) return 3;
    if (isBachelor) return 1; // 거의 무관, 후순위
    return 2;
  }
  if (education === "대학재학") {
    if (isBachelor) return 3;
    if (isMaster) return 2;
    return 1;
  }
  if (education === "검정고시" || education === "고졸") {
    if (isBachelor) return 3;
    if (isDipFound) return 2;
    return 1;
  }
  if (education === "워홀러") {
    if (isDipFound) return 3;
    if (isBachelor) return 2;
    return 1;
  }
  return 1;
}

function schoolToPick(s: School, input: DiagnoseInput): SchoolPick {
  const re = new RegExp(
    input.major === "간호" ? "nursing|간호" :
    input.major === "IT" ? "information|computing|IT|software" :
    input.major === "비즈니스" ? "business|commerce|account" :
    input.major === "공학" ? "engineering" :
    input.major === "요리·호텔" ? "cookery|hospitality|culinary|patisserie|kitchen|hotel|tourism" :
    input.major === "유아교육" ? "early childhood|education" :
    input.major === "디자인" ? "design" :
    input.major === "Trade" ? "trade|carpentry|electrician|plumb|welder" :
    input.major === "의료" ? "medic" : ".*",
    "i"
  );
  // education 에 맞는 level 우선 정렬 후 상위 3개
  const progs = s.programs
    .filter((p) => re.test(p.name ?? ""))
    .sort((a, b) => programLevelRank(b, input.education) - programLevelRank(a, input.education))
    .slice(0, 3);
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

  // 고졸/검정고시 = 2경로 (목표 학사 + Pathway 진입).
  // 단 의료(Direct MBBS/MD), 요리·호텔·Trade(Cert III·Diploma vocational) 는 Pathway→학사 모델이 아니라 dual-path 부적합 → 단일 경로.
  const standardEducationPath = !(
    input.major === "의료" || input.major === "요리·호텔" || input.major === "Trade"
  );
  const showDualPath =
    (input.education === "고졸" || input.education === "검정고시") && standardEducationPath;
  let pathwayPicks: SchoolPick[] = [];
  if (showDualPath) {
    if (input.major === "간호") {
      // Wilson 19년 정본: Foundation 제외, Diploma 3교(Griffith/Deakin/QUT) + TAFE 지역별
      pathwayPicks = nursingPathwayPicks(input);
    } else {
      pathwayPicks = pathwaySchoolsFor(input).map((s) => ({
        id: s.id, name: s.name, city: s.city, state: s.state, type: s.type, qs: s.qs,
        reason: s.type === "foundation"
          ? `Foundation → ${s.operator ?? "학사 연결"} 1학년 진입`
          : `Diploma → 학사 2학년 편입`,
        programs: s.programs.map((p) => ({ name: p.name, ielts: p.ielts, tuition: p.tuition })),
      }));
    }
  }

  // 카드 1 empty 메시지 (지역 strict 매칭 결과 0건일 때)
  const directEmpty = schoolsPicks.length === 0;
  const pathwayEmpty = pathwayPicks.length === 0;
  const emptyMsg = directEmpty && (!showDualPath || pathwayEmpty)
    ? `${input.preferred_region} 지역에 ${input.major} 코스를 운영하는 정본 학교가 적습니다. 다른 지역 추가 고려 또는 1:1 정밀 상담(유료)으로 케이스별 안내를 받으실 수 있습니다.`
    : undefined;

  // 검정고시·고졸 = 호주 학사 곧바로 진학 불가 (Wilson 정본). 'A' = 졸업 목표 학교 / 'B' = Pathway 진입 학교.
  const pathwayNote = showDualPath
    ? (input.major === "간호"
        ? "한국 검정고시·고졸은 호주 간호 학사 곧바로 진학 불가. 모든 학생이 Diploma of Health Sciences (College) 또는 TAFE Diploma of Nursing (EN) 거친 후 RN 학사 편입. 'A' 학교 = 최종 RN 학위 목표, 'B' 학교 = Pathway 진입 학교입니다."
        : "한국 검정고시·고졸은 호주 학사 곧바로 진학 불가. 모든 학생이 Foundation 또는 Diploma 1년 거친 후 학사 편입. 'A' 학교 = 최종 학사 학위 목표, 'B' 학교 = Pathway 진입 학교입니다.")
    : undefined;
  const consultNote =
    "정확한 학교 추천·합격 가능성·정밀 학비·IELTS 트랙은 1:1 정밀 상담(유료)에서 확정합니다.";

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
      description: regionFaq?.card_text ?? `${input.preferred_region} 지역 학교를 우선 추천합니다.`,
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
      description: majorFaq?.card_text ?? `${input.major} 전공 안내.`,
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
      recommendation: scenario?.wilson_note
        ?? "정밀 상담에서는 학비·장학금·합격 가능성·IELTS 트랙·비자 일정을 본인 케이스로 잡아드립니다.",
    },
    card7_next: {
      title: "다음 액션",
      actions: [
        { label: "💬 1:1 정밀 상담 신청 (유료)", kind: "kakao" },
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
