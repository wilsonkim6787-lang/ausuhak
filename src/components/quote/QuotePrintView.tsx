// 견적서 인쇄용 뷰 — Wilson admin / 학생 mypage 둘 다 사용.
// admin = mode='admin' → INTERNAL 메모 + 학생용 마스크 X
// 학생 = mode='student' → INTERNAL 메모 / 수익 정보 / 자체 메모 숨김

import {
  computeSchoolTotals,
  fmtAud,
  fmtKrw,
  paymentCycleHint,
  type QuoteCalcInput,
} from "@/lib/quote/calc";
import type { SelectedSchool, QuoteItems } from "@/app/[locale]/admin/quotes/actions";

export type QuotePrintData = {
  id: string;
  quote_type: "consultation" | "enrollment" | null;
  status: string | null;
  selected_schools: SelectedSchool[];
  items: QuoteItems;
  living_cost_aud_monthly: number;
  accommodation_aud: number;
  accommodation_type: string | null;
  pickup_aud: number;
  pickup_type: string | null;
  airfare_krw: number;
  processing_fee_krw: number;
  processing_fee_reason: string | null;
  exchange_rate_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  students?: { name: string | null; major: string | null; preferred_region: string | null } | null;
};

export default function QuotePrintView({
  quote,
  mode,
}: {
  quote: QuotePrintData;
  mode: "admin" | "student";
}) {
  const studentName = quote.students?.name?.trim() || "(이름 미입력)";
  const fx = quote.items.exchange_rate_krw_per_aud || 920;
  const liveYearly = quote.living_cost_aud_monthly * 12;
  const calcInput: QuoteCalcInput = {
    schools: quote.selected_schools,
    items: quote.items,
    living_cost_aud_monthly: quote.living_cost_aud_monthly,
    accommodation_aud: quote.accommodation_aud,
    pickup_aud: quote.pickup_aud,
    airfare_krw: quote.airfare_krw,
    processing_fee_krw: quote.processing_fee_krw,
  };

  return (
    <article className="mx-auto max-w-3xl bg-white p-8 text-navy-900 print:p-0 print:shadow-none sm:rounded-2xl sm:shadow-sm">
      {/* 헤더 */}
      <header className="border-b border-cream-300 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-navy-900">
              ausuhak<span className="italic text-gold-600">.com</span>
            </p>
            <p className="mt-0.5 text-xs text-ink-500">호주 유학 — Wilson Kim · QEAC E240 · 19년 경력</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
              {quote.quote_type === "enrollment" ? "수속 견적서" : "상담 견적서"}
            </p>
            <p className="mt-1 text-[11px] text-ink-500">
              발행일: {new Date(quote.created_at).toLocaleDateString("ko-KR")}
            </p>
            {quote.exchange_rate_date && (
              <p className="text-[11px] text-ink-500">
                환율 기준일: {quote.exchange_rate_date}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
          <span className="font-display text-lg font-bold text-navy-900">
            👤 {studentName}
          </span>
          {quote.students?.major && (
            <span className="text-ink-700">· {quote.students.major}</span>
          )}
          {quote.students?.preferred_region && (
            <span className="text-ink-700">· {quote.students.preferred_region}</span>
          )}
        </div>

        <p className="mt-3 rounded-lg bg-cream-100 px-3 py-2 text-[11px] text-ink-700">
          💱 1 AUD = ₩{fx.toLocaleString("ko-KR")} · 견적 유효 7일 · 1년 기준 추정
          {mode === "student" && " · 정확한 견적은 1:1 카톡 상담 확정"}
        </p>
      </header>

      {/* 학교별 카드 */}
      <section className="mt-5 space-y-4">
        <h2 className="font-display text-base font-bold text-navy-900">📚 학교별 1년 총액</h2>

        {quote.selected_schools.length === 0 && (
          <p className="rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-warning">
            선택된 학교가 없습니다.
          </p>
        )}

        {quote.selected_schools.map((s, idx) => {
          const totals = computeSchoolTotals(s, calcInput);
          const cycleHint = paymentCycleHint(s.payment_cycle);
          return (
            <div
              key={idx}
              className="rounded-2xl border border-cream-300 p-4 print:break-inside-avoid"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-cream-200 pb-2">
                <div>
                  <p className="font-display text-base font-semibold text-navy-900">
                    {idx + 1}. {s.school_name}
                  </p>
                  <p className="text-xs text-ink-700">
                    {s.program} · {s.duration_text}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-navy-900">
                    {fmtKrw(totals.totalKrw)}
                  </p>
                  <p className="text-[11px] text-ink-500">{fmtAud(totals.totalAud)}</p>
                </div>
              </div>

              {/* 학비 라인 */}
              <dl className="mt-3 space-y-1.5 text-xs">
                <Row label="학비 (실 부담)" value={fmtAud(totals.tuitionActual)}>
                  {(s.scholarship_aud > 0 || s.promotion_aud > 0) && (
                    <span className="text-[11px] text-ink-500">
                      학비 {fmtAud(s.tuition_aud)}
                      {s.scholarship_aud > 0 && ` − 장학금 ${fmtAud(s.scholarship_aud)}`}
                      {s.promotion_aud > 0 && ` − 프로모션 ${fmtAud(s.promotion_aud)}`}
                    </span>
                  )}
                </Row>
                {cycleHint && (
                  <p className="rounded bg-gold-100 px-2 py-1 text-[11px] text-navy-700">
                    💡 {cycleHint}
                  </p>
                )}
                {mode === "admin" && (s.scholarship_note || s.promotion_note) && (
                  <p className="rounded border-l-2 border-error/40 bg-error/5 px-2 py-1 text-[11px] text-error">
                    ⚠️ INTERNAL: {s.scholarship_note || s.promotion_note}
                  </p>
                )}
              </dl>
            </div>
          );
        })}
      </section>

      {/* AUD 공통 항목 */}
      <section className="mt-6">
        <h2 className="font-display text-base font-bold text-navy-900">
          💰 공통 항목 (AUD · 1년)
        </h2>
        <dl className="mt-2 divide-y divide-cream-200 rounded-2xl border border-cream-300">
          <Row label={`생활비 (${quote.items.region ?? "지역 미선택"})`} value={fmtAud(liveYearly)}>
            <span className="text-[11px] text-ink-500">
              월 {fmtAud(quote.living_cost_aud_monthly)} × 12
            </span>
          </Row>
          {quote.accommodation_aud > 0 && (
            <Row
              label={`숙소 (${quote.accommodation_type ?? "-"})`}
              value={fmtAud(quote.accommodation_aud * 52)}
            >
              <span className="text-[11px] text-ink-500">
                주 {fmtAud(quote.accommodation_aud)} × 52
              </span>
            </Row>
          )}
          <Row label="학생비자 500" value={fmtAud(quote.items.visa_500_aud)} />
          <Row label="OSHC (의료보험)" value={fmtAud(quote.items.oshc_per_year_aud)}>
            <span className="text-[11px] text-ink-500">연간</span>
          </Row>
          <Row label="정착비 (보증금/교재/가구)" value={fmtAud(quote.items.settlement_aud)} />
          {quote.pickup_aud > 0 && (
            <Row label={`픽업 (${quote.pickup_type ?? "-"})`} value={fmtAud(quote.pickup_aud)} />
          )}
        </dl>
      </section>

      {/* KRW 공통 항목 */}
      <section className="mt-6">
        <h2 className="font-display text-base font-bold text-navy-900">💴 공통 항목 (KRW)</h2>
        <dl className="mt-2 divide-y divide-cream-200 rounded-2xl border border-cream-300">
          {quote.airfare_krw > 0 && (
            <Row label="항공권 (왕복)" value={fmtKrw(quote.airfare_krw)} />
          )}
          {quote.items.consultation_fee_krw > 0 && (
            <Row
              label="1:1 화상 상담비"
              value={fmtKrw(quote.items.consultation_fee_krw)}
            />
          )}
          {quote.processing_fee_krw > 0 && (
            <Row label="수속비" value={fmtKrw(quote.processing_fee_krw)}>
              {mode === "admin" && quote.processing_fee_reason && (
                <span className="text-[11px] text-ink-500">{quote.processing_fee_reason}</span>
              )}
            </Row>
          )}
        </dl>
      </section>

      {/* 메모 */}
      {quote.note && (
        <section className="mt-6">
          <h2 className="font-display text-base font-bold text-navy-900">📝 안내 사항</h2>
          <p className="mt-2 whitespace-pre-line rounded-2xl border border-cream-300 bg-cream-100/40 p-4 text-xs leading-relaxed text-ink-700">
            {quote.note}
          </p>
        </section>
      )}

      {/* 푸터 */}
      <footer className="mt-8 border-t border-cream-300 pt-4 text-[11px] leading-relaxed text-ink-500">
        <p>
          본 견적서는 1년 기준 추정치이며, 환율·학비·정책 변동에 따라 변경될 수 있습니다.
          학교 결제 주기·환불 정책·비자 조건은 카톡 채널에서 최종 확정합니다.
        </p>
        <p className="mt-1">
          🌐 ausuhak.com · 💬 카톡 채널 pf.kakao.com/_GadTX · 영업 평일 10:00~18:00 KST
        </p>
        {mode === "admin" && (
          <p className="mt-2 text-error">
            ⚠️ Wilson 전용 보기 — INTERNAL 메모 포함. 학생 발송 전에 학생 마이페이지 보기로 한 번 더 확인.
          </p>
        )}
      </footer>
    </article>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-4 py-2.5 text-sm">
      <div className="min-w-0">
        <p className="font-medium text-navy-900">{label}</p>
        {children}
      </div>
      <p className="shrink-0 font-semibold text-navy-900">{value}</p>
    </div>
  );
}
