// PART J-5 / BLOCK 3: 학생 자동 케어 — 지금 챙길 학생만 카드로, 규칙은 접기.
// 엔진(lib/care/rules.ts)·Cron 로직 불변. 코드 조건 텍스트 제거, 평이한 한국어만.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  CARE_RULES,
  evaluateCareRules,
  renderAutoMessage,
  type StudentForCare,
} from "@/lib/care/rules";
import CopyButton from "@/components/admin/CopyButton";
import StudentAvatar from "@/components/admin/StudentAvatar";
import CareRulesPanel from "@/components/admin/CareRulesPanel";

// 규칙 → 화면 표현(평이한 한국어). 코드 조건은 절대 노출 X.
const RULE_PRESENTATION: Record<
  string,
  { label: string; audience: "wilson" | "student"; reason: (d: number | null) => string }
> = {
  inactive_5d: {
    label: "5일 넘게 활동이 없는 학생",
    audience: "wilson",
    reason: (d) => `${d ?? 5}일째 아무 활동이 없어요 — 안부를 확인해 주세요`,
  },
  mypage_7d: {
    label: "마이페이지 1주 넘게 미접속",
    audience: "student",
    reason: (d) => `마이페이지에 ${d ?? 7}일째 안 들어왔어요`,
  },
  doc_delay_3d: {
    label: "서류 업로드 3일 넘게 지연",
    audience: "student",
    reason: (d) => `서류 업로드가 ${d ?? 3}일째 밀려 있어요`,
  },
  payment_no_consult_5d: {
    label: "결제 후 5일 넘게 다음 단계 없음",
    audience: "wilson",
    reason: (d) => `결제 후 ${d ?? 5}일째 다음 단계가 안 잡혔어요`,
  },
  visa_pending_30d: {
    label: "비자 신청 후 30일 경과 (안심 안내)",
    audience: "student",
    reason: (d) => `비자 신청 후 ${d ?? 30}일 지났어요 — 안심 안내가 필요해요`,
  },
  stage_stuck_14d: {
    label: "같은 단계 14일 넘게 정체",
    audience: "wilson",
    reason: (d) => `같은 단계에서 ${d ?? 14}일째 멈춰 있어요`,
  },
  arrival_6m: {
    label: "호주 도착 6개월 후 점검",
    audience: "wilson",
    reason: () => `호주 도착 6개월 점검 시점이에요`,
  },
};

type StudentRaw = {
  id: string;
  name: string | null;
  kakao_id: string | null;
  current_stage: number;
  lead_status: string | null;
  updated_at: string;
  user_id: string | null;
  photo_path: string | null;
  users: { last_login_at: string | null } | { last_login_at: string | null }[] | null;
};

type DocRow = { student_id: string; created_at: string };
type VisaRow = { student_id: string; submitted_at: string | null };

type Reason = { rule_id: string; days_since: number | null; audience: "wilson" | "student" };
type StudentCard = {
  student_id: string;
  name: string | null;
  photo: string | null;
  kakao: string | null;
  reasons: Reason[];
  hasWilson: boolean;
  maxDays: number;
};

export default async function AdminCarePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  const [studentsRes, docsRes, visasRes] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, name, kakao_id, current_stage, lead_status, updated_at, user_id, photo_path, users(last_login_at)",
      )
      .limit(2000),
    supabase
      .from("documents")
      .select("student_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabase
      .from("visa_cases")
      .select("student_id, submitted_at")
      .eq("status", "submitted")
      .not("submitted_at", "is", null),
  ]);

  if (studentsRes.error) {
    return (
      <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
        학생 조회 실패: {studentsRes.error.message}
      </div>
    );
  }

  const latestDocByStudent = new Map<string, string>();
  for (const d of (docsRes.data ?? []) as DocRow[]) {
    if (!latestDocByStudent.has(d.student_id)) {
      latestDocByStudent.set(d.student_id, d.created_at);
    }
  }
  const visaByStudent = new Map<string, string>();
  for (const v of (visasRes.data ?? []) as VisaRow[]) {
    if (v.submitted_at && !visaByStudent.has(v.student_id)) {
      visaByStudent.set(v.student_id, v.submitted_at);
    }
  }

  const studentsForCare: StudentForCare[] = (studentsRes.data ?? []).map((s) => {
    const raw = s as StudentRaw;
    const usersField = Array.isArray(raw.users) ? raw.users[0] ?? null : raw.users;
    return {
      id: raw.id,
      name: raw.name,
      kakao_id: raw.kakao_id,
      current_stage: raw.current_stage,
      lead_status: raw.lead_status,
      updated_at: raw.updated_at,
      user_id: raw.user_id,
      photo_path: raw.photo_path,
      users: usersField ?? undefined,
      latest_document_at: latestDocByStudent.get(raw.id) ?? null,
      visa_submitted_at: visaByStudent.get(raw.id) ?? null,
    };
  });

  const allHits = evaluateCareRules(studentsForCare);

  // ── 학생별 그룹화 ──
  const byStudent = new Map<string, StudentCard>();
  for (const h of allHits) {
    const pres = RULE_PRESENTATION[h.rule_id];
    if (!pres) continue;
    const card =
      byStudent.get(h.student_id) ?? {
        student_id: h.student_id,
        name: h.student_name,
        photo: h.student_photo_path,
        kakao: h.student_kakao_id,
        reasons: [],
        hasWilson: false,
        maxDays: 0,
      };
    card.reasons.push({ rule_id: h.rule_id, days_since: h.days_since, audience: pres.audience });
    if (pres.audience === "wilson") card.hasWilson = true;
    card.maxDays = Math.max(card.maxDays, h.days_since ?? 0);
    byStudent.set(h.student_id, card);
  }

  const cards = [...byStudent.values()].sort((a, b) => {
    if (a.hasWilson !== b.hasWilson) return a.hasWilson ? -1 : 1;
    return b.maxDays - a.maxDays;
  });

  // ── 규칙별 카운트 (하단 패널) ──
  const ruleCounts = new Map<string, number>();
  for (const h of allHits) ruleCounts.set(h.rule_id, (ruleCounts.get(h.rule_id) ?? 0) + 1);
  const panelRules = CARE_RULES.map((r) => ({
    label: RULE_PRESENTATION[r.id]?.label ?? r.title,
    audience: RULE_PRESENTATION[r.id]?.audience ?? "wilson",
    count: ruleCounts.get(r.id) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          학생 케어
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          🩺 학생 자동 케어
        </h1>
        <p className="mt-1 text-sm text-ink-500">지금 챙겨야 할 학생만 위에 보여드려요.</p>
      </header>

      {/* 지금 챙길 학생 */}
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-base font-bold text-navy-900">
          지금 챙길 학생 {cards.length > 0 && <span className="text-ink-500">{cards.length}명</span>}
        </h2>

        {cards.length === 0 ? (
          <div className="rounded-2xl border-l-4 border-success bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <span>✓</span> 지금 챙길 학생이 없어요
            </p>
          </div>
        ) : (
          cards.map((c) => <CareCard key={c.student_id} card={c} />)
        )}
      </section>

      {/* 케어 규칙 7개 — 접기 */}
      <CareRulesPanel rules={panelRules} />
    </div>
  );
}

function CareCard({ card }: { card: StudentCard }) {
  // 대표 사유: 윌슨 우선 → 오래된 순
  const primary = [...card.reasons].sort((a, b) => {
    if ((a.audience === "wilson") !== (b.audience === "wilson"))
      return a.audience === "wilson" ? -1 : 1;
    return (b.days_since ?? 0) - (a.days_since ?? 0);
  })[0];
  const pres = RULE_PRESENTATION[primary.rule_id];
  const more = card.reasons.length - 1;

  const rule = CARE_RULES.find((r) => r.id === primary.rule_id);
  const message =
    primary.audience === "student" && rule?.autoMessageTemplate
      ? renderAutoMessage(rule, card.name)
      : null;

  return (
    <div
      className={`rounded-2xl border-l-4 bg-white p-4 shadow-sm ${
        card.hasWilson ? "border-error" : "border-gold-500"
      }`}
    >
      <div className="flex items-center gap-3">
        <StudentAvatar name={card.name} photoPath={card.photo} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-navy-900">
              {card.name?.trim() || "이름 미입력"}
            </span>
            {card.hasWilson ? (
              <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-gold-600">
                윌슨 케어
              </span>
            ) : (
              <span className="rounded-full bg-info/15 px-2 py-0.5 text-[10px] font-bold text-info">
                학생 안내
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-ink-700">
            {pres.reason(primary.days_since)}
            {more > 0 && <span className="text-ink-500"> · 외 {more}건</span>}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {card.kakao && (
            <CopyButton value={card.kakao} label={`📋 ${card.kakao}`} copiedLabel="ID 복사됨" />
          )}
          {message && <CopyButton value={message} label="💬 메시지 복사" />}
          <Link
            href={`/admin/students/${card.student_id}`}
            className="rounded-full bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-700"
          >
            학생 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
