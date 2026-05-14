import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import QuoteForm, { type StudentOption } from "../QuoteForm";
import type { SelectedSchool, QuoteItems } from "../actions";

type QuoteFull = {
  id: string;
  student_id: string;
  quote_type: "consultation" | "enrollment" | null;
  selected_schools: SelectedSchool[] | null;
  items: QuoteItems | null;
  living_cost_aud_monthly: number | null;  // 021
  airfare_krw: number | null;
  processing_fee_krw: number | null;
  processing_fee_reason: string | null;
  accommodation_aud: number | null;
  accommodation_type: string | null;
  pickup_aud: number | null;
  pickup_type: string | null;
  exchange_rate_date: string | null;
  note: string | null;
  status: string | null;
  total_aud: number | null;
  total_krw: number | null;
  created_at: string;
  updated_at: string;
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  // 022: schools 마스터 참조 제거 (Wilson 100% 수기 입력)
  const [quoteRes, studentsRes] = await Promise.all([
    supabase
      .from("quotes")
      .select(
        "id, student_id, quote_type, selected_schools, items, living_cost_aud_monthly, airfare_krw, processing_fee_krw, processing_fee_reason, accommodation_aud, accommodation_type, pickup_aud, pickup_type, exchange_rate_date, note, status, total_aud, total_krw, created_at, updated_at",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("students")
      .select("id, name, age_range, major, preferred_region")
      .order("updated_at", { ascending: false })
      .limit(500),
  ]);

  if (quoteRes.error || !quoteRes.data) notFound();

  const quote = quoteRes.data as QuoteFull;
  const students: StudentOption[] = (studentsRes.data ?? []).map((s) => ({
    id: s.id,
    name: s.name?.trim() || "이름 미입력",
    summary: [s.age_range, s.major, s.preferred_region].filter(Boolean).join(" / "),
    preferred_region: s.preferred_region as string | null,
  }));

  const items: QuoteItems = quote.items ?? {
    region: null,
    oshc_per_year_aud: 700,
    visa_500_aud: 2000,
    settlement_aud: 3000,
    consultation_fee_krw: 50000,
    exchange_rate_krw_per_aud: 920,
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link href="/admin/quotes" className="text-xs font-semibold text-navy-700 hover:text-gold-600">
          ← 견적서 목록으로
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <h1 className="font-display text-3xl font-bold text-navy-900">견적서</h1>
          <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-navy-700">
            {quote.quote_type === "enrollment" ? "💸 수속" : "📊 상담"}
          </span>
          <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-navy-700">
            {quote.status ?? "draft"}
          </span>
        </div>
        <p className="mt-2 text-sm text-ink-500">
          최근 수정: {new Date(quote.updated_at).toLocaleString("ko-KR")}
        </p>
      </header>

      <QuoteForm
        mode="edit"
        quoteId={quote.id}
        students={students}
        defaults={{
          student_id: quote.student_id,
          quote_type: quote.quote_type ?? "consultation",
          schools: quote.selected_schools ?? [],
          items,
          living_cost_aud_monthly: Number(quote.living_cost_aud_monthly ?? 0),
          accommodation_aud: Number(quote.accommodation_aud ?? 0),
          accommodation_type: quote.accommodation_type,
          pickup_aud: Number(quote.pickup_aud ?? 0),
          pickup_type: quote.pickup_type,
          airfare_krw: Number(quote.airfare_krw ?? 0),
          processing_fee_krw: Number(quote.processing_fee_krw ?? 0),
          processing_fee_reason: quote.processing_fee_reason,
          exchange_rate_date: quote.exchange_rate_date,
          note: quote.note,
        }}
      />
    </div>
  );
}
