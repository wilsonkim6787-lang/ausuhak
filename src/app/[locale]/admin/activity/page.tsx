// PART K 3.5: Wilson 활동 로그 대시보드.
// activity_logs SELECT는 RLS로 Wilson만 허용 (is_super_admin()).

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

type LogRow = {
  id: string;
  user_id: string | null;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

type SP = { action?: string; user?: string; since?: string };

const ACTION_GROUPS: Record<string, string[]> = {
  보안: ["unauthorized_access", "role_mismatch", "rls_denied"],
  인증: ["login", "logout", "signup", "password_recovery"],
  결제: ["create_payment", "confirm_payment", "refund_payment"],
  견적: ["create_quote", "update_quote"],
  학생: ["update_student", "advance_stage", "view_student"],
  서류: ["upload_document", "verify_document"],
};

const SECURITY_ACTIONS = new Set(ACTION_GROUPS.보안);

export default async function AdminActivityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SP>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  // users join 폐기 — PostgREST fk 인식 이슈 회피 + RLS 거부 시 활동 로그 자체는 보임.
  let query = supabase
    .from("activity_logs")
    .select(
      "id, user_id, action_type, target_table, target_id, details, ip_address, user_agent, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (sp.action) query = query.eq("action_type", sp.action);
  if (sp.user) query = query.eq("user_id", sp.user);
  if (sp.since) query = query.gte("created_at", sp.since);

  const { data, error } = await query;
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold text-navy-900">🛡️ 활동 로그</h1>
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          <p className="font-semibold">활동 로그 조회 실패</p>
          <p className="mt-2 font-mono text-xs">{error.message}</p>
          <p className="mt-3 text-xs text-ink-700">
            원인 후보: ① supabase migration 023 (activity_logs) 미적용
            · ② RLS 거부 (is_super_admin() 함수 또는 role 확인) · ③ 환경변수 누락.
          </p>
        </div>
      </div>
    );
  }
  const rows = (data ?? []) as LogRow[];

  // 학생·직원 이름 매핑 (별도 fetch — join 분리)
  const userIds = Array.from(
    new Set(rows.map((r) => r.user_id).filter((v): v is string => !!v)),
  );
  const userById = new Map<string, UserRow>();
  if (userIds.length > 0) {
    const { data: usersData } = await supabase
      .from("users")
      .select("id, name, email, role")
      .in("id", userIds);
    for (const u of (usersData ?? []) as UserRow[]) {
      userById.set(u.id, u);
    }
  }

  // 보안 이벤트 카운트
  const securityCount = rows.filter((r) => SECURITY_ACTIONS.has(r.action_type)).length;
  const unauthorized = rows.filter((r) => r.action_type === "unauthorized_access").length;
  const roleMismatch = rows.filter((r) => r.action_type === "role_mismatch").length;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          보안 · 감사
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          🛡️ 활동 로그
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          모든 보안·인증·데이터 변경 자동 기록 (최근 300건). UPDATE/DELETE 차단 = 변조 불가.
        </p>
      </header>

      {/* 보안 알림 카드 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="최근 300건 中 보안 이벤트" value={securityCount} highlight={securityCount > 0} />
        <Stat label="비로그인 무단 접근" value={unauthorized} highlight={unauthorized > 0} />
        <Stat label="권한 불일치 (role mismatch)" value={roleMismatch} highlight={roleMismatch > 0} />
      </section>

      {/* 필터 */}
      <nav className="flex flex-wrap gap-2 text-xs">
        <FilterChip current={sp.action} value={undefined} label="전체" />
        {Object.entries(ACTION_GROUPS).flatMap(([group, actions]) =>
          actions.map((a) => (
            <FilterChip
              key={a}
              current={sp.action}
              value={a}
              label={`${group}: ${a}`}
            />
          )),
        )}
      </nav>

      {/* 로그 테이블 */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-cream-300 bg-cream-100/40 p-6 text-center text-sm text-ink-500">
          {sp.action
            ? `${sp.action} 이벤트가 없습니다.`
            : "기록된 로그가 없습니다. (Wilson 또는 학생이 로그인·결제·견적 작업을 하면 자동 기록됩니다.)"}
        </div>
      ) : (
        <ul className="divide-y divide-cream-200 overflow-hidden rounded-2xl border border-cream-300 bg-white">
          {rows.map((r) => (
            <LogRowItem
              key={r.id}
              log={r}
              user={r.user_id ? userById.get(r.user_id) ?? null : null}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-error/30 bg-error/5" : "border-cream-300 bg-white"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-2xl font-bold ${
          highlight ? "text-error" : "text-navy-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  current,
  value,
  label,
}: {
  current: string | undefined;
  value: string | undefined;
  label: string;
}) {
  const href = value ? `/admin/activity?action=${value}` : "/admin/activity";
  const active = (current ?? undefined) === value;
  return (
    <Link
      href={href}
      className={`rounded-full px-2.5 py-1 font-medium transition ${
        active
          ? "bg-navy-900 text-white"
          : "border border-cream-300 bg-white text-navy-700 hover:bg-cream-200"
      }`}
    >
      {label}
    </Link>
  );
}

function LogRowItem({ log, user }: { log: LogRow; user: UserRow | null }) {
  const security = SECURITY_ACTIONS.has(log.action_type);
  return (
    <li
      className={`flex flex-col gap-1 px-5 py-3 text-sm ${
        security ? "bg-error/5" : ""
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              security
                ? "bg-error text-white"
                : "bg-navy-900 text-gold-400"
            }`}
          >
            {log.action_type}
          </span>
          {user?.name ? (
            <span className="text-xs text-navy-700">
              {user.name} ({user.role})
            </span>
          ) : user?.email ? (
            <span className="text-xs text-navy-700">
              {user.email} ({user.role})
            </span>
          ) : (
            <span className="text-xs text-ink-500">비로그인 / 익명</span>
          )}
          {log.target_table && (
            <span className="font-mono text-[10px] text-ink-500">
              {log.target_table}
              {log.target_id ? `#${log.target_id.slice(0, 6)}` : ""}
            </span>
          )}
        </div>
        <span className="text-[10px] text-ink-500">
          {new Date(log.created_at).toLocaleString("ko-KR")}
        </span>
      </div>
      {log.details && Object.keys(log.details).length > 0 && (
        <pre className="overflow-x-auto rounded-lg bg-cream-100/50 px-3 py-2 text-[11px] leading-snug text-ink-700">
          {JSON.stringify(log.details, null, 2)}
        </pre>
      )}
      {log.ip_address && (
        <p className="text-[10px] text-ink-500">
          IP: {log.ip_address}
          {log.user_agent && ` · ${log.user_agent.slice(0, 60)}`}
        </p>
      )}
    </li>
  );
}
