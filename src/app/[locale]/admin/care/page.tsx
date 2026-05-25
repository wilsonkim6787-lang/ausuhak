// PART J-5 / PART K 3.2: 학생 자동 케어 대시보드 (Wilson).
// 7개 룰 실시간 평가 + 룰별 학생 그룹화. Cron(Phase 3.1)이 추가되면 동일 룰을 자동 발송.

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

const LEAD_OPTIONS: { key: string; label: string }[] = [
  { key: "all",       label: "전체" },
  { key: "lead",      label: "리드" },
  { key: "contacted", label: "연락" },
  { key: "pro",       label: "상담" },
  { key: "contract",  label: "계약" },
  { key: "visa",      label: "비자" },
  { key: "onsite",    label: "도착" },
  { key: "pr",        label: "PR" },
];

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

export default async function AdminCarePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ lead?: string; q?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const leadFilter = sp.lead && sp.lead !== "all" ? sp.lead : null;
  const nameQ = sp.q?.trim().toLowerCase() ?? "";
  setRequestLocale(locale);

  const supabase = await createClient();

  // 1) 활성 학생 전체 (lead/pr 포함해서 가져온 후 룰에서 필터)
  // 2) 각 학생의 가장 최근 documents.created_at
  // 3) 각 학생의 최근 visa_cases.submitted_at (status='submitted')
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

  // 학생별 최신 문서 / 비자 매핑
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

  const studentsForCare: StudentForCare[] = (studentsRes.data ?? []).map(
    (s) => {
      const raw = s as StudentRaw;
      const usersField = Array.isArray(raw.users)
        ? raw.users[0] ?? null
        : raw.users;
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
    },
  );

  const allHits = evaluateCareRules(studentsForCare);
  const hits = allHits.filter((h) => {
    if (leadFilter && h.lead_status !== leadFilter) return false;
    if (nameQ && !(h.student_name ?? "").toLowerCase().includes(nameQ)) return false;
    return true;
  });

  // 룰별 그룹화 + 정렬 (오래 정체된 학생 먼저)
  const byRule = new Map<string, typeof hits>();
  for (const h of hits) {
    const arr = byRule.get(h.rule_id) ?? [];
    arr.push(h);
    byRule.set(h.rule_id, arr);
  }
  byRule.forEach((arr) =>
    arr.sort((a, b) => (b.days_since ?? 0) - (a.days_since ?? 0)),
  );

  const wilsonRules = CARE_RULES.filter((r) => r.severity === "wilson");
  const autoRules = CARE_RULES.filter((r) => r.severity === "auto_kakao");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          PHASE 3
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          🩺 학생 자동 케어
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          정체 감지 7룰 실시간 평가 · 학생 {studentsForCare.length}명 / 트리거 {hits.length}건
          {leadFilter || nameQ ? ` (필터 적용 / 전체 ${allHits.length}건)` : ""}.
          Cron 자동 발송은 Step 3.1 이후 활성화.
        </p>
      </header>

      {/* 필터 */}
      <div className="flex flex-col gap-3 rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
        <form action="/admin/care" className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="학생 이름 검색"
            className="flex-1 rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
          />
          {sp.lead && <input type="hidden" name="lead" value={sp.lead} />}
          <button type="submit" className="rounded-lg bg-navy-900 px-4 text-xs font-semibold text-white hover:bg-navy-700">
            검색
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {LEAD_OPTIONS.map((opt) => {
            const params = new URLSearchParams();
            if (opt.key !== "all") params.set("lead", opt.key);
            if (sp.q) params.set("q", sp.q);
            const href = params.toString() ? `/admin/care?${params.toString()}` : "/admin/care";
            const active = (sp.lead ?? "all") === opt.key;
            return (
              <Link
                key={opt.key}
                href={href}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-navy-900 bg-navy-900 text-white"
                    : "border-cream-300 bg-white text-navy-700 hover:bg-cream-100"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          🚨 Wilson 직접 케어 필요
        </h2>
        <div className="flex flex-col gap-4">
          {wilsonRules.map((r) => (
            <RuleGroup
              key={r.id}
              rule={r}
              hits={byRule.get(r.id) ?? []}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          📤 자동 카톡 발송 (Step 2.5 활성화 후 자동)
        </h2>
        <div className="flex flex-col gap-4">
          {autoRules.map((r) => (
            <RuleGroup
              key={r.id}
              rule={r}
              hits={byRule.get(r.id) ?? []}
            />
          ))}
        </div>
      </section>

      <p className="text-center text-[11px] text-ink-500">
        ⚠️ Step 2.5 카톡 알림톡 활성화 전까지 자동 발송은 보류. Wilson이 위 목록을 보고 수동 카톡 발송 권장.
      </p>
    </div>
  );
}

function RuleGroup({
  rule,
  hits,
}: {
  rule: typeof CARE_RULES[number];
  hits: ReturnType<typeof evaluateCareRules>;
}) {
  const isWilson = rule.severity === "wilson";
  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${
        hits.length > 0
          ? isWilson
            ? "border-error/30 bg-error/5"
            : "border-gold-600/30 bg-gold-100/40"
          : "border-cream-300 bg-white"
      }`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xs font-bold text-gold-600">
            #{rule.num}
          </span>
          <span className="text-xl">{rule.emoji}</span>
          <h3 className="font-display text-base font-semibold text-navy-900">
            {rule.title}
          </h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            hits.length > 0
              ? isWilson
                ? "bg-error text-white"
                : "bg-gold-600 text-white"
              : "bg-cream-300 text-ink-700"
          }`}
        >
          {hits.length}건
        </span>
      </header>
      <p className="mt-1 text-xs text-ink-500">{rule.description}</p>
      {rule.autoMessageTemplate && hits[0] && (
        <p className="mt-2 rounded-lg bg-white px-3 py-1.5 text-[11px] text-ink-700">
          📤 자동 발송 예시: &ldquo;{renderAutoMessage(rule, hits[0].student_name)}&rdquo;
        </p>
      )}

      {hits.length === 0 ? (
        <p className="mt-3 text-xs text-ink-500">— 트리거된 학생 없음</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {hits.slice(0, 20).map((h) => {
            const message = rule.autoMessageTemplate
              ? renderAutoMessage(rule, h.student_name)
              : null;
            return (
              <li
                key={`${h.rule_id}-${h.student_id}`}
                className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm"
              >
                <Link
                  href={`/admin/students/${h.student_id}`}
                  className="flex min-w-0 flex-1 items-center gap-2 font-medium text-navy-900 underline-offset-2 hover:underline"
                >
                  <StudentAvatar
                    name={h.student_name}
                    photoPath={h.student_photo_path}
                    size="sm"
                  />
                  <span className="truncate">{h.student_name?.trim() || "이름 미입력"}</span>
                </Link>
                <span className="shrink-0 rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-white">
                  Stage {h.current_stage}
                </span>
                {h.lead_status && (
                  <span className="shrink-0 rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium text-navy-700">
                    {h.lead_status}
                  </span>
                )}
                {h.days_since != null && (
                  <span className="shrink-0 text-[11px] font-semibold text-ink-700">
                    {h.days_since}일 전
                  </span>
                )}
                {h.student_kakao_id && (
                  <CopyButton
                    value={h.student_kakao_id}
                    label={`📋 ${h.student_kakao_id}`}
                    copiedLabel="ID 복사됨"
                  />
                )}
                {message && (
                  <CopyButton value={message} label="💬 메시지 복사" />
                )}
              </li>
            );
          })}
          {hits.length > 20 && (
            <li className="text-center text-[11px] text-ink-500">
              ...외 {hits.length - 20}명
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
