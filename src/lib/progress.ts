// 진행 모델 정본 (학생 마이페이지 = 표시 / admin = 제어 공용).
// 5 phase × sub-step. 기존 Stage 12 (students.current_stage) 와 1:1 매핑 → 백필·파생.
// 순수 모듈 (서버 import 없음) → client·server 양쪽에서 사용 가능.

export type SubstepStatus = "done" | "in_progress" | "pending";

// staff 가 제공하는(학생이 "받음") 서류 슬롯
export type StaffDoc = { docType: string; label: string };

export type Substep = {
  key: string;
  label: string;
  stage: number; // 기존 Stage 12 매핑 (파생/백필용)
  staffDoc?: StaffDoc; // staff 제공 서류 슬롯 (CoE·견적서·Grant 등)
  collectsStudentDocs?: boolean; // 학생 제출 서류(여권·재정 등)가 표시되는 단계
};

export type Phase = {
  key: string;
  label: string;
  substeps: Substep[];
};

export const PHASES: Phase[] = [
  {
    key: "consult",
    label: "상담",
    substeps: [
      { key: "c_kakao", label: "카톡 1차 상담", stage: 1 },
      { key: "c_signup", label: "마이페이지 가입", stage: 2 },
      { key: "c_payment", label: "상담 결제", stage: 2 },
      {
        key: "c_quote",
        label: "1:1 상담 + 견적서",
        stage: 3,
        staffDoc: { docType: "quote", label: "견적서" },
      },
    ],
  },
  {
    key: "apply",
    label: "학교지원",
    substeps: [
      { key: "a_select", label: "학교 선정", stage: 4 },
      { key: "a_english", label: "영어 준비", stage: 5 },
      { key: "a_docs", label: "지원 서류 수집", stage: 6, collectsStudentDocs: true },
      { key: "a_submit", label: "지원서 제출", stage: 7 },
    ],
  },
  {
    key: "offer",
    label: "입학허가",
    substeps: [
      {
        key: "o_offer",
        label: "Offer Letter 수령",
        stage: 8,
        staffDoc: { docType: "offer_letter", label: "Offer Letter" },
      },
      { key: "o_tuition", label: "학비 납부", stage: 9 },
      {
        key: "o_coe",
        label: "입학허가서(CoE) 발급",
        stage: 9,
        staffDoc: { docType: "coe", label: "입학허가서(CoE)" },
      },
    ],
  },
  {
    key: "visa",
    label: "비자",
    substeps: [
      { key: "v_prep", label: "비자 서류 준비", stage: 10 },
      { key: "v_form", label: "신청서 작성", stage: 10 },
      { key: "v_submit", label: "비자 신청 제출", stage: 10 },
      {
        key: "v_grant",
        label: "비자 승인서(Grant) 수령",
        stage: 10,
        staffDoc: { docType: "visa_grant", label: "비자 승인서(Grant)" },
      },
    ],
  },
  {
    key: "depart",
    label: "출국",
    substeps: [
      { key: "d_ticket", label: "항공권 예약", stage: 11 },
      { key: "d_insurance", label: "보험 가입", stage: 11 },
      { key: "d_prep", label: "출국 준비 안내", stage: 11 },
      { key: "d_arrive", label: "호주 도착", stage: 12 },
    ],
  },
];

// 학생 제출 서류 (gold "올림") / staff 제공 서류 (blue "받음")
export const STUDENT_DOC_TYPES = [
  "passport",
  "transcript",
  "english_score",
  "financial",
  "gs_statement",
  "recommendation",
  "personal_statement",
  "other",
] as const;

export const STAFF_DOC_TYPES = ["quote", "offer_letter", "coe", "visa_grant"] as const;

export const ALL_SUBSTEPS: Substep[] = PHASES.flatMap((p) => p.substeps);

const SUBSTEP_INDEX = new Map(ALL_SUBSTEPS.map((s, i) => [s.key, i]));

export function substepByKey(key: string): Substep | undefined {
  return ALL_SUBSTEPS.find((s) => s.key === key);
}

export function isStaffDocType(docType: string | null | undefined): boolean {
  return docType != null && (STAFF_DOC_TYPES as readonly string[]).includes(docType);
}

export const VALID_SUBSTEP_KEYS = new Set(ALL_SUBSTEPS.map((s) => s.key));

// 명시 row 가 없을 때 current_stage 로부터 파생 (백필·stub·미적용 대비)
export function deriveStatus(substepStage: number, currentStage: number): SubstepStatus {
  if (substepStage < currentStage) return "done";
  if (substepStage === currentStage) return "in_progress";
  return "pending";
}

// 명시 row 우선, 없으면 current_stage 파생.
export function buildStatusMap(
  rows: { substep_key: string; status: string }[],
  currentStage: number,
): Record<string, SubstepStatus> {
  const explicit = new Map(rows.map((r) => [r.substep_key, r.status as SubstepStatus]));
  const map: Record<string, SubstepStatus> = {};
  for (const s of ALL_SUBSTEPS) {
    map[s.key] = explicit.get(s.key) ?? deriveStatus(s.stage, currentStage);
  }
  return map;
}

// 현재 진행 중인 sub-step: 첫 in_progress, 없으면 첫 pending, 둘 다 없으면 마지막(전부 done).
export function currentSubstep(statusMap: Record<string, SubstepStatus>): Substep {
  const inProgress = ALL_SUBSTEPS.find((s) => statusMap[s.key] === "in_progress");
  if (inProgress) return inProgress;
  const pending = ALL_SUBSTEPS.find((s) => statusMap[s.key] === "pending");
  if (pending) return pending;
  return ALL_SUBSTEPS[ALL_SUBSTEPS.length - 1];
}

// 다음 sub-step (현재 다음 순번). 마지막이면 null.
export function nextSubstep(statusMap: Record<string, SubstepStatus>): Substep | null {
  const cur = currentSubstep(statusMap);
  const idx = SUBSTEP_INDEX.get(cur.key) ?? 0;
  return ALL_SUBSTEPS[idx + 1] ?? null;
}

// 현재 phase index (0-based): 첫 non-done sub-step 이 속한 phase. 전부 done 이면 마지막.
export function currentPhaseIndex(statusMap: Record<string, SubstepStatus>): number {
  const firstNotDone = ALL_SUBSTEPS.find((s) => statusMap[s.key] !== "done");
  if (!firstNotDone) return PHASES.length - 1;
  return PHASES.findIndex((p) => p.substeps.some((s) => s.key === firstNotDone.key));
}

export function phaseIsComplete(phase: Phase, statusMap: Record<string, SubstepStatus>): boolean {
  return phase.substeps.every((s) => statusMap[s.key] === "done");
}

// students.current_stage 로 다시 쓸 값 (legacy kanban·care·timeline 일관성 유지).
export function deriveCurrentStage(statusMap: Record<string, SubstepStatus>): number {
  return currentSubstep(statusMap).stage;
}
