// Wilson admin 견적서 인쇄 페이지.
// - INTERNAL 메모 포함 (학생용 마스킹 X).
// - Ctrl+P / Cmd+P → "PDF로 저장" → 학생 카톡 발송.
// - 학생 마이페이지 보기 = /mypage/quote/[id]

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import QuotePrintView, { type QuotePrintData } from "@/components/quote/QuotePrintView";
import PrintButton from "@/components/quote/PrintButton";

export default async function AdminQuotePDFPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, student_id, quote_type, status, selected_schools, items, living_cost_aud_monthly, accommodation_aud, accommodation_type, pickup_aud, pickup_type, airfare_krw, processing_fee_krw, processing_fee_reason, exchange_rate_date, note, created_at, updated_at, students(name, major, preferred_region)",
    )
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const quote = data as unknown as QuotePrintData;

  return (
    <div className="min-h-screen bg-cream-100 py-6 print:bg-white print:py-0">
      {/* 인쇄 시 숨김 (액션 바) */}
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center gap-2 px-4 print:hidden">
        <Link
          href={`/admin/quotes/${id}`}
          className="rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition hover:bg-cream-200"
        >
          ← 편집으로
        </Link>
        <Link
          href={`/mypage/quote/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition hover:bg-cream-200"
        >
          🔍 학생 화면 미리보기
        </Link>
        <PrintButton />
        <p className="ml-auto text-[11px] text-ink-500">
          Ctrl/Cmd + P → &quot;PDF로 저장&quot; → 학생 카톡 발송
        </p>
      </div>

      <QuotePrintView quote={quote} mode="admin" />
    </div>
  );
}
