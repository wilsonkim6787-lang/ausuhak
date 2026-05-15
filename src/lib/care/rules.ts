// PART J-5: 학생 자동 케어 — 정체 감지 룰 7개.
// Vercel Cron(Phase 3.1)이 호출하거나, Wilson이 /admin/care에서 실시간 평가.

export type RuleSeverity = "wilson" | "auto_kakao";

export type CareRule = {
  id: string;
  num: number;
  emoji: string;
  title: string;
  severity: RuleSeverity;
  description: string;
  // 학생 카톡으로 자동 발송될 템플릿 (severity='auto_kakao'인 경우)
  autoMessageTemplate?: string;
};

export const CARE_RULES: CareRule[] = [
  {
    id: "inactive_5d",
    num: 1,
    emoji: "💤",
    title: "5일+ 활동 X",
    severity: "wilson",
    description: "students.updated_at 5일+ 전. lead/pr 제외.",
  },
  {
    id: "mypage_7d",
    num: 2,
    emoji: "📭",
    title: "마이페이지 1주+ 미접속",
    severity: "auto_kakao",
    description: "users.last_login_at 7일+ 전. 회원가입 학생만.",
    autoMessageTemplate: "{name}님 잘 지내시죠? 진행 상황 어떠세요?",
  },
  {
    id: "doc_delay_3d",
    num: 3,
    emoji: "📁",
    title: "서류 업로드 3일+ 지연",
    severity: "auto_kakao",
    description: "Stage 6+ 학생 중 documents 최근 업데이트 3일+ 전.",
    autoMessageTemplate: "{name}님, 서류 업로드 부탁드려요.",
  },
  {
    id: "payment_no_consult_5d",
    num: 4,
    emoji: "📅",
    title: "결제 후 5일+ 1:1 상담 X",
    severity: "wilson",
    description: "current_stage=2 (결제 완료) 인데 5일+ 멈춤. 1:1 상담 일정 안 잡힘.",
  },
  {
    id: "visa_pending_30d",
    num: 5,
    emoji: "🛂",
    title: "비자 신청 후 30일+",
    severity: "auto_kakao",
    description: "visa_cases.submitted_at 30일+ 전 / status='submitted'.",
    autoMessageTemplate:
      "{name}님, 비자 심사 평균 4~8주입니다. 결과 나오면 즉시 알려드릴게요.",
  },
  {
    id: "stage_stuck_14d",
    num: 6,
    emoji: "⏳",
    title: "Stage 정체 14일+",
    severity: "wilson",
    description: "동일 Stage 14일+. lead/pr 제외.",
  },
  {
    id: "arrival_6m",
    num: 7,
    emoji: "🇦🇺",
    title: "호주 도착 후 6개월 체크",
    severity: "wilson",
    description: "Stage 12 진입 6개월+. Failure Pattern 6개 체크 트리거.",
  },
];

// 룰 평가에 필요한 학생 + 관련 데이터 한 묶음.
export type StudentForCare = {
  id: string;
  name: string | null;
  current_stage: number;
  lead_status: string | null;
  updated_at: string;
  user_id: string | null;
  // 가입된 학생만 (users.last_login_at)
  users?: { last_login_at: string | null } | null;
  // 최근 문서 1개 (created_at)
  latest_document_at?: string | null;
  // 진행 중 비자 케이스 (submitted_at)
  visa_submitted_at?: string | null;
};

export type CareHit = {
  rule_id: string;
  student_id: string;
  student_name: string | null;
  current_stage: number;
  severity: RuleSeverity;
  days_since: number | null; // 정체된 일수 (계산 가능 시)
};

const DAY = 86_400_000;

function daysAgo(iso: string | null | undefined, now: number): number | null {
  if (!iso) return null;
  return Math.floor((now - new Date(iso).getTime()) / DAY);
}

export function evaluateCareRules(
  students: StudentForCare[],
  now: number = Date.now(),
): CareHit[] {
  const hits: CareHit[] = [];

  for (const s of students) {
    const inActiveLifecycle = s.lead_status !== "lead" && s.lead_status !== "pr";

    // 1. 5일+ 활동 X
    const sinceUpdated = daysAgo(s.updated_at, now);
    if (inActiveLifecycle && sinceUpdated != null && sinceUpdated >= 5) {
      hits.push(makeHit("inactive_5d", s, sinceUpdated));
    }

    // 2. 마이페이지 1주+ 미접속
    const sinceLogin = daysAgo(s.users?.last_login_at, now);
    if (s.user_id && sinceLogin != null && sinceLogin >= 7) {
      hits.push(makeHit("mypage_7d", s, sinceLogin));
    }

    // 3. 서류 업로드 3일+ 지연 (Stage 6+)
    const sinceDoc = daysAgo(s.latest_document_at, now);
    if (
      s.current_stage >= 6 &&
      sinceDoc != null &&
      sinceDoc >= 3 &&
      inActiveLifecycle
    ) {
      hits.push(makeHit("doc_delay_3d", s, sinceDoc));
    }

    // 4. 결제 후 5일+ 1:1 상담 X (current_stage = 2 / 그대로 멈춤)
    if (
      s.current_stage === 2 &&
      sinceUpdated != null &&
      sinceUpdated >= 5
    ) {
      hits.push(makeHit("payment_no_consult_5d", s, sinceUpdated));
    }

    // 5. 비자 신청 후 30일+
    const sinceVisa = daysAgo(s.visa_submitted_at, now);
    if (sinceVisa != null && sinceVisa >= 30) {
      hits.push(makeHit("visa_pending_30d", s, sinceVisa));
    }

    // 6. Stage 정체 14일+
    if (inActiveLifecycle && sinceUpdated != null && sinceUpdated >= 14) {
      hits.push(makeHit("stage_stuck_14d", s, sinceUpdated));
    }

    // 7. 호주 도착 후 6개월
    if (s.current_stage === 12 && sinceUpdated != null && sinceUpdated >= 180) {
      hits.push(makeHit("arrival_6m", s, sinceUpdated));
    }
  }

  return hits;
}

function makeHit(
  ruleId: string,
  s: StudentForCare,
  daysSince: number,
): CareHit {
  const rule = CARE_RULES.find((r) => r.id === ruleId)!;
  return {
    rule_id: ruleId,
    student_id: s.id,
    student_name: s.name,
    current_stage: s.current_stage,
    severity: rule.severity,
    days_since: daysSince,
  };
}

export function renderAutoMessage(
  rule: CareRule,
  studentName: string | null,
): string {
  if (!rule.autoMessageTemplate) return "";
  return rule.autoMessageTemplate.replace(/{name}/g, studentName ?? "학생");
}
