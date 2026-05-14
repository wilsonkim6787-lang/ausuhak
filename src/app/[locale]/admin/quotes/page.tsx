import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { buttonStyles } from "@/components/ui/Button";

type SP = { status?: string };

type QuoteRow = {
  id: string;
  student_id: string;
  status: string | null;
  quote_type: "consultation" | "enrollment" | null;
  total_aud: number | null;
  total_krw: number | null;
  selected_schools: { name: string }[] | null;
  created_at: string;
  updated_at: string;
  students?: { name: string | null } | null;
};

export default async function QuotesListPage({
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
    .from("quotes")
    .select(
      "id, student_id, status, quote_type, total_aud, total_krw, selected_schools, created_at, updated_at, students(name)",
    )
    .order("updated_at", { ascending: false })
    .limit(200);

  if (sp.status && sp.status !== "all") {
    query = query.eq("status", sp.status);
  }

  const { data, error } = await query;
  const quotes = (data ?? []) as unknown as QuoteRow[];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            관리자 · Phase 1
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
            💵 견적서
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            총 {quotes.length}건 표시{sp.status ? ` (status=${sp.status})` : ""}
          </p>
        </div>
        <Link href="/admin/quotes/new" className={`${buttonStyles()} self-start`}>
          + 신규 견적서 작성
        </Link>
      </header>

      {/* Status 필터 */}
      <div className="flex flex-wrap gap-2">
        {["all", "draft", "sent", "accepted", "expired"].map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/quotes" : `/admin/quotes?status=${s}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              (sp.status ?? "all") === s
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-cream-300 bg-white text-navy-700 hover:bg-cream-200"
            }`}
          >
            {s === "all" ? "전체" : s}
          </Link>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          로드 실패: {error.message}
        </div>
      )}

      {quotes.length === 0 ? (
        <EmptyState hasFilter={!!sp.status} />
      ) : (
        <ul className="flex flex-col gap-2">
          {quotes.map((q) => (
            <li key={q.id}>
              <QuoteCard quote={q} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QuoteCard({ quote: q }: { quote: QuoteRow }) {
  const studentName = q.students?.name?.trim() || "이름 미입력";
  const schoolNames = (q.selected_schools ?? []).map((s) => s.name).join(" / ");
  const krw = q.total_krw != null ? `₩${q.total_krw.toLocaleString("ko-KR")}` : "—";
  const aud = q.total_aud != null ? `AUD $${q.total_aud.toLocaleString("en-AU")}` : "—";

  return (
    <Link
      href={`/admin/quotes/${q.id}`}
      className="block rounded-xl border border-cream-300 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-bold text-navy-900">{studentName}</span>
          <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium text-navy-700">
            {q.quote_type === "enrollment" ? "💸 수속" : "📊 상담"}
          </span>
          <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium text-navy-700">
            {q.status ?? "draft"}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-navy-900">{krw}</div>
          <div className="text-[11px] text-ink-500">{aud}</div>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-ink-500">
        {schoolNames || "학교 없음"} ·{" "}
        {new Date(q.updated_at).toLocaleDateString("ko-KR")}
      </p>
    </Link>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center">
      <p className="text-4xl">📝</p>
      <p className="mt-3 font-display text-lg font-bold text-navy-900">
        견적서가 없습니다
      </p>
      <p className="mt-1 text-sm text-ink-500">
        {hasFilter
          ? "이 상태의 견적서가 없습니다. 필터를 바꿔보세요."
          : "Step 1.6 ⑤ 견적서 = Phase 1 마지막 필수 기능입니다."}
      </p>
      {!hasFilter && (
        <Link href="/admin/quotes/new" className={`${buttonStyles()} mt-5`}>
          + 첫 견적서 작성
        </Link>
      )}
    </div>
  );
}
