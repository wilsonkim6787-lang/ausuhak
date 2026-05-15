// 견적서 계산 헬퍼 (PART E-6 v3 / 022).
// admin actions.ts 의 계산 로직과 동일 → admin PDF / 학생 마이페이지 PDF 둘 다 동일하게 표시.

import type { SelectedSchool, QuoteItems } from "@/app/[locale]/admin/quotes/actions";

export type SchoolTotals = {
  tuitionActual: number;   // 학비 - 장학금 - 프로모션
  totalAud: number;        // 1년 추정 (학교별)
  totalKrw: number;        // 1년 추정 (학교별 + KRW 추가)
};

export type QuoteCalcInput = {
  schools: SelectedSchool[];
  items: QuoteItems;
  living_cost_aud_monthly: number;
  accommodation_aud: number;
  pickup_aud: number;
  airfare_krw: number;
  processing_fee_krw: number;
};

// 학교 1개당 1년 기준 총액. duration_text는 표시용이라 계산 X.
export function computeSchoolTotals(
  school: SelectedSchool,
  q: QuoteCalcInput,
): SchoolTotals {
  const fx = q.items.exchange_rate_krw_per_aud || 920;
  const tuitionActual = school.tuition_aud - school.scholarship_aud - school.promotion_aud;
  const livingYearly = q.living_cost_aud_monthly * 12;
  const accomYearly = q.accommodation_aud * 52;
  const oneTimeAud =
    (q.items.visa_500_aud || 0) +
    (q.items.settlement_aud || 0) +
    (q.pickup_aud || 0);
  const schoolTotalAud =
    tuitionActual + livingYearly + (q.items.oshc_per_year_aud || 0) + accomYearly + oneTimeAud;
  const krwAdditions =
    (q.airfare_krw || 0) +
    (q.items.consultation_fee_krw || 0) +
    (q.processing_fee_krw || 0);

  return {
    tuitionActual,
    totalAud: Math.round(schoolTotalAud),
    totalKrw: Math.round(schoolTotalAud * fx + krwAdditions),
  };
}

export function fmtAud(n: number | null | undefined): string {
  if (n == null) return "-";
  return "A$" + n.toLocaleString("en-AU");
}
export function fmtKrw(n: number | null | undefined): string {
  if (n == null) return "-";
  return "₩" + n.toLocaleString("ko-KR");
}

// PART E-6 [7] 학비 결제 주기 안내 문구
export function paymentCycleHint(cycle: string | null | undefined): string | null {
  switch (cycle) {
    case "lump_sum":
      return "어학원은 학교에 일시불 입금 (CoE 발급용)";
    case "split_2_3":
      return "분할 결제 (2~3회)";
    case "semester":
      return "학기당 1번 (연 2회) 결제";
    case "quarterly":
      return "분기별 (연 4회) 결제";
    default:
      return null;
  }
}
