import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import StudentAvatar from "@/components/admin/StudentAvatar";

type SP = { status?: string; q?: string };

type PaymentRow = {
  id: string;
  student_id: string;
  payment_type: string;
  amount_krw: number | null;
  status: string | null;
  confirmed_at: string | null;
  created_at: string;
  students?: { name: string | null; photo_path: string | null } | null;
};

const TYPE_LABEL: Record<string, string> = {
  pro_50k: "PRO ₩50,000",
  medical_300k: "의대 ₩300,000",
  full_consulting: "풀 컨설팅",
};

export default async function AdminPaymentsListPage({
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
  let query = supabase
    .from("payments")
    .select(
      "id, student_id, payment_type, amount_krw, status, confirmed_at, created_at, students(name, photo_path)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (sp.status && ["pending", "confirmed", "refunded", "cancelled"].includes(sp.status)) {
    query = query.eq("status", sp.status);
  }

  const { data, error } = await query;
  if (error) {
    return (
      <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
        결제 조회 실패: {error.message}
      </div>
    );
  }
  let rows = (data ?? []) as unknown as PaymentRow[];

  // 학생 이름 검색 (client filter — 200건 limit 이라 안전)
  if (sp.q) {
    const needle = sp.q.toLowerCase();
    rows = rows.filter((p) =>
      (p.students?.name ?? "").toLowerCase().includes(needle),
    );
  }

  // 이번 달 통계
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthRows = rows.filter((p) => new Date(p.created_at) >= monthStart);
  const sumConfirmed = monthRows
    .filter((p) => p.status === "confirmed")
    .reduce((acc, p) => acc + (p.amount_krw ?? 0), 0);
  const pendingCount = rows.filter((p) => p.status === "pending").length;
  const refundedCount = monthRows.filter((p) => p.status === "refunded").length;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          메뉴 5
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          💰 결제·커미션
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          학생 결제 수동 등록 / 입금 확인 / 환불. 자동 회원가입 트리거 포함.
        </p>
      </header>

      {/* 이번 달 통계 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="이번 달 확정 수익" value={`₩${sumConfirmed.toLocaleString("ko-KR")}`} />
        <Stat label="대기 중 (전체)" value={pendingCount.toString()} highlight={pendingCount > 0} />
        <Stat label="이번 달 환불" value={refundedCount.toString()} />
        <Stat label="이번 달 총 등록" value={monthRows.length.toString()} />
      </section>

      {/* 검색 + 필터 */}
      <div className="flex flex-col gap-3">
        <form action="/admin/payments" className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="학생 이름 검색"
            className="flex-1 rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
          />
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <button type="submit" className="rounded-lg bg-navy-900 px-4 text-xs font-semibold text-white hover:bg-navy-700">
            검색
          </button>
        </form>
        <nav className="flex flex-wrap gap-2 text-xs">
          <FilterChip status={undefined} current={sp.status} q={sp.q} label="전체" />
          <FilterChip status="pending" current={sp.status} q={sp.q} label="대기" />
          <FilterChip status="confirmed" current={sp.status} q={sp.q} label="확정" />
          <FilterChip status="refunded" current={sp.status} q={sp.q} label="환불" />
        </nav>
      </div>

      {/* 목록 */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-cream-300 bg-cream-100/40 p-6 text-center text-sm text-ink-500">
          {sp.status ? `${sp.status} 상태인 결제가 없습니다.` : "등록된 결제가 없습니다."}
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm">
          {rows.map((p, i) => (
            <li
              key={p.id}
              className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 text-sm ${
                i > 0 ? "border-t border-cream-200" : ""
              }`}
            >
              <Link
                href={`/admin/students/${p.student_id}/payments`}
                className="flex min-w-[140px] items-center gap-2 font-medium text-navy-900 underline-offset-2 hover:underline"
              >
                <StudentAvatar name={p.students?.name ?? null} photoPath={p.students?.photo_path ?? null} size="sm" />
                <span>{p.students?.name ?? "이름 미입력"}</span>
              </Link>
              <span className="min-w-[140px] text-ink-700">
                {TYPE_LABEL[p.payment_type] ?? p.payment_type}
              </span>
              <span className="ml-auto font-semibold text-navy-900">
                ₩{(p.amount_krw ?? 0).toLocaleString("ko-KR")}
              </span>
              <StatusBadge status={p.status} />
              <span className="w-full text-[11px] text-ink-500 sm:w-auto">
                {new Date(p.created_at).toLocaleDateString("ko-KR")}
              </span>
            </li>
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
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-gold-600/30 bg-gold-100/40"
          : "border-cream-300 bg-white"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold text-navy-900">{value}</p>
    </div>
  );
}

function FilterChip({
  status,
  current,
  q,
  label,
}: {
  status: string | undefined;
  current: string | undefined;
  q: string | undefined;
  label: string;
}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const href = params.toString()
    ? `/admin/payments?${params.toString()}`
    : "/admin/payments";
  const active = (current ?? undefined) === status;
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 font-medium transition ${
        active
          ? "bg-navy-900 text-white"
          : "border border-cream-300 bg-white text-navy-700 hover:bg-cream-200"
      }`}
    >
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; fg: string }> = {
    pending: { bg: "bg-gold-100", fg: "text-gold-600" },
    confirmed: { bg: "bg-success/15", fg: "text-success" },
    refunded: { bg: "bg-error/15", fg: "text-error" },
    cancelled: { bg: "bg-cream-300", fg: "text-ink-700" },
  };
  const s = map[status ?? ""] ?? map.pending;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.bg} ${s.fg}`}>
      {status ?? "pending"}
    </span>
  );
}
