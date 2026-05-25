// 📈 운영 통계 — 학생·결제·견적·Stage 분포.
// 아침 대시보드 (/admin) 와 별개: 누적 수치·trend 위주.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

type StudentStat = {
  current_stage: number;
  lead_status: string | null;
  is_medical: boolean | null;
  created_at: string;
};

type PaymentStat = {
  amount_krw: number | null;
  status: string | null;
  created_at: string;
};

type QuoteStat = {
  status: string | null;
  total_krw: number | null;
  created_at: string;
};

const LEAD_LABEL: Record<string, string> = {
  lead:      "리드",
  contacted: "연락",
  pro:       "상담",
  contract:  "계약",
  visa:      "비자",
  onsite:    "도착",
  pr:        "PR",
};

function monthStart(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 3600 * 1000);
}

export default async function AdminStatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const month = monthStart();

  const [studentsRes, paymentsRes, quotesRes] = await Promise.all([
    supabase
      .from("students")
      .select("current_stage, lead_status, is_medical, created_at")
      .limit(5000),
    supabase
      .from("payments")
      .select("amount_krw, status, created_at")
      .gte("created_at", daysAgo(90).toISOString())
      .limit(5000),
    supabase
      .from("quotes")
      .select("status, total_krw, created_at")
      .gte("created_at", daysAgo(90).toISOString())
      .limit(5000),
  ]);

  const students = (studentsRes.data ?? []) as StudentStat[];
  const payments = (paymentsRes.data ?? []) as PaymentStat[];
  const quotes = (quotesRes.data ?? []) as QuoteStat[];

  // ─── 학생 통계 ───────────────────────────────────
  const total = students.length;
  const newThisMonth = students.filter((s) => new Date(s.created_at) >= month).length;
  const medicalCount = students.filter((s) => s.is_medical).length;

  const leadDist = new Map<string, number>();
  for (const s of students) {
    const k = s.lead_status ?? "lead";
    leadDist.set(k, (leadDist.get(k) ?? 0) + 1);
  }

  const stageDist = new Map<number, number>();
  for (const s of students) {
    stageDist.set(s.current_stage, (stageDist.get(s.current_stage) ?? 0) + 1);
  }

  // ─── 결제 통계 (이번 달) ─────────────────────────
  const paysMonth = payments.filter((p) => new Date(p.created_at) >= month);
  const revenueMonth = paysMonth
    .filter((p) => p.status === "confirmed")
    .reduce((a, p) => a + (p.amount_krw ?? 0), 0);
  const paysPending = payments.filter((p) => p.status === "pending").length;
  const paysRefundedMonth = paysMonth.filter((p) => p.status === "refunded").length;

  // ─── 견적 통계 (이번 달) ─────────────────────────
  const quotesMonth = quotes.filter((q) => new Date(q.created_at) >= month);
  const quotesDraft = quotes.filter((q) => q.status === "draft").length;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          관리자 · 운영 통계
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          📈 통계
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          학생 · 결제 · 견적 · Stage 분포 한눈에. (아침 대시보드는{" "}
          <Link href="/admin" className="underline">/admin</Link>)
        </p>
      </header>

      {/* 학생 통계 */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">📊 학생</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="총 학생 수" value={total.toString()} />
          <Stat label="이번 달 신규" value={newThisMonth.toString()} highlight={newThisMonth > 0} />
          <Stat label="의대 트랙" value={medicalCount.toString()} />
          <Stat label="진행 단계" value={`${leadDist.get("lead") ?? 0} → ${leadDist.get("pr") ?? 0}`} sub="리드 → PR" />
        </div>
      </section>

      {/* Lead Status 분포 */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          🛤️ Lead Status 분포
        </h2>
        <div className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {Object.entries(LEAD_LABEL).map(([k, label]) => {
              const n = leadDist.get(k) ?? 0;
              const pct = total > 0 ? Math.round((n / total) * 100) : 0;
              return (
                <Link
                  key={k}
                  href={`/admin/students?view=kanban&lead_status=${k}`}
                  className="flex flex-1 min-w-[100px] flex-col items-center gap-1 rounded-xl border border-cream-300 bg-cream-100/40 px-3 py-3 hover:bg-cream-200"
                >
                  <span className="text-[10px] font-semibold text-ink-500">{label}</span>
                  <span className="font-display text-xl font-bold text-navy-900">{n}</span>
                  <span className="text-[10px] text-ink-500">{pct}%</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stage 분포 */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          🎯 Stage 12 분포
        </h2>
        <div className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
          <ul className="space-y-1.5">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((stage) => {
              const n = stageDist.get(stage) ?? 0;
              const pct = total > 0 ? Math.round((n / total) * 100) : 0;
              return (
                <li key={stage} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-semibold text-navy-700">
                    Stage {stage}
                  </span>
                  <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-cream-200">
                    <div
                      className="h-5 rounded-full bg-navy-900 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-xs font-semibold text-navy-900">
                    {n}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 결제 통계 */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">💰 결제 (이번 달)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="이번 달 확정 수익" value={`₩${revenueMonth.toLocaleString("ko-KR")}`} />
          <Stat label="대기 (전체)" value={paysPending.toString()} highlight={paysPending > 0} />
          <Stat label="이번 달 환불" value={paysRefundedMonth.toString()} />
          <Stat label="이번 달 등록" value={paysMonth.length.toString()} />
        </div>
      </section>

      {/* 견적 통계 */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">💵 견적서 (이번 달)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="이번 달 발급" value={quotesMonth.length.toString()} />
          <Stat label="draft (대기 / 전체)" value={quotesDraft.toString()} highlight={quotesDraft > 0} />
          <Stat
            label="이번 달 평균 견적"
            value={
              quotesMonth.length === 0
                ? "—"
                : `₩${Math.round(
                    quotesMonth.reduce((a, q) => a + (q.total_krw ?? 0), 0) / quotesMonth.length,
                  ).toLocaleString("ko-KR")}`
            }
          />
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-gold-600/30 bg-gold-100/40" : "border-cream-300 bg-white"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold text-navy-900">{value}</p>
      {sub && <p className="text-[10px] text-ink-500">{sub}</p>}
    </div>
  );
}
