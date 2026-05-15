// 학생 견적서 상세 + 인쇄 페이지.
// - RLS quotes_self_select (student_id IN ...) 가 본인 견적서만 보장.
// - INTERNAL 메모(장학금/프로모션/수속비 사유)는 mode='student'로 숨김.
// - Ctrl+P → PDF 저장 가능.

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import QuotePrintView, { type QuotePrintData } from "@/components/quote/QuotePrintView";
import PrintButton from "@/components/quote/PrintButton";

export default async function MypageQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { student } = await requireStudent();
  if (!student.id) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, student_id, quote_type, status, selected_schools, items, living_cost_aud_monthly, accommodation_aud, accommodation_type, pickup_aud, pickup_type, airfare_krw, processing_fee_krw, processing_fee_reason, exchange_rate_date, note, created_at, updated_at, students(name, major, preferred_region)",
    )
    .eq("id", id)
    .eq("student_id", student.id) // 본인 견적서만
    .single();

  if (error || !data) notFound();

  const quote = data as unknown as QuotePrintData;

  return (
    <div className="-mx-4 -my-6 min-h-screen bg-cream-100 py-6 sm:-mx-6 sm:-my-8 sm:py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center gap-2 px-4 print:hidden">
        <Link
          href="/mypage/quote"
          className="rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition hover:bg-cream-200"
        >
          ← 견적서 목록
        </Link>
        <PrintButton />
        <p className="ml-auto text-[11px] text-ink-500">
          Ctrl/Cmd + P → &quot;PDF로 저장&quot;
        </p>
      </div>

      <QuotePrintView quote={quote} mode="student" />
    </div>
  );
}
