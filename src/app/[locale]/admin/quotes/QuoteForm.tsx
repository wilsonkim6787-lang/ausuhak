"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  createQuoteAction,
  updateQuoteAction,
  type QuoteActionState,
  type SelectedSchool,
  type QuoteItems,
} from "./actions";

export type StudentOption = {
  id: string;
  name: string;
  summary: string;
  preferred_region: string | null;
};

type Mode = "new" | "edit";

// 021: 월 단위 (AUD/월) — Wilson 2026-05-14 검증 기준값
// 학생/학부모 한국 생활비랑 비교 용이. 계산 = monthly × 12 × duration_years
const LIVING_DEFAULTS: Record<string, number> = {
  "시드니": 1700,
  "멜번": 1500,
  "브리즈번": 1400,
  "골드코스트": 1300,
  "퍼스": 1400,
  "애들레이드": 1300,
  "호바트": 1200,
  "캔버라": 1500,
};

// PART E-6 [7] 학교별 결제 주기 안내 (UI 표시만 / 계산 X)
const PAYMENT_CYCLE_HINTS: Record<string, string> = {
  lump_sum:   "💡 어학원은 학교에 일시불 입금 (CoE 발급용)",
  split_2_3:  "💡 Foundation/사립 직업학교는 2~3회 분할 결제 (학기·세션별)",
  semester:   "💡 학기당 1번 (연 2회) 결제 — 대학·TAFE·의대",
  quarterly:  "💡 조기유학은 분기별 (연 4회) 결제",
};

const CYCLE_OPTIONS: [string, string][] = [
  ["", "— 선택 안 함 —"],
  ["lump_sum",  "어학원 (일시불)"],
  ["split_2_3", "Foundation·사립 직업 (2~3회 분할)"],
  ["semester",  "대학·TAFE·의대 (학기당 / 연 2회)"],
  ["quarterly", "조기유학 (분기별 / 연 4회)"],
];

const ACCOMMODATION_OPTIONS: [string, string, string][] = [
  // value, label, hint
  ["", "— 미선택 —", ""],
  ["none",       "숙소 없음",             "0"],
  ["homestay",   "홈스테이",              "주당 $300-400 (참고)"],
  ["dormitory",  "학교 기숙사",            "주당 $250-500 (참고)"],
  ["sharehouse", "쉐어하우스",            "주당 $200-350 (참고)"],
];

const PICKUP_OPTIONS: [string, string, string][] = [
  ["", "— 미선택 —", ""],
  ["none",    "픽업 없음",   "0"],
  ["school",  "학교 픽업",   "1회 $150-200"],
  ["private", "사설 픽업",   "Wilson 합의가"],
];

const initial: QuoteActionState = {};

export default function QuoteForm({
  mode,
  students,
  initialStudentId,
  quoteId,
  defaults,
}: {
  mode: Mode;
  students: StudentOption[];
  initialStudentId?: string;
  quoteId?: string;
  defaults?: {
    student_id: string;
    quote_type: "consultation" | "enrollment";
    schools: SelectedSchool[];
    items: QuoteItems;
    living_cost_aud_monthly: number;  // 021
    accommodation_aud: number;
    accommodation_type: string | null;
    pickup_aud: number;
    pickup_type: string | null;
    airfare_krw: number;
    processing_fee_krw: number;
    processing_fee_reason: string | null;
    exchange_rate_date: string | null;
    note: string | null;
  };
}) {
  const action = mode === "new" ? createQuoteAction : updateQuoteAction;
  const [state, formAction, pending] = useActionState(action, initial);

  // ─── State ──────────────────────────────────────
  const [quoteType, setQuoteType] = useState<"consultation" | "enrollment">(
    defaults?.quote_type ?? "consultation",
  );

  const [studentId, setStudentId] = useState(
    defaults?.student_id ?? initialStudentId ?? students[0]?.id ?? "",
  );

  const startSchools: SelectedSchool[] = useMemo(() => {
    const arr: SelectedSchool[] = [];
    for (let i = 0; i < 3; i++) {
      arr.push(
        defaults?.schools[i] ?? {
          school_name: "", program: "",
          duration_text: "",
          payment_cycle: null,
          tuition_aud: 0,
          scholarship_aud: 0,
          promotion_aud: 0,
          scholarship_note: null,
          promotion_note: null,
        },
      );
    }
    return arr;
  }, [defaults]);
  const [schoolRows, setSchoolRows] = useState<SelectedSchool[]>(startSchools);

  const selectedStudent = students.find((s) => s.id === studentId);
  const inferredRegion =
    defaults?.items.region ??
    selectedStudent?.preferred_region ??
    "시드니";

  const [region, setRegion] = useState<string>(inferredRegion);
  // 021: living = 월 단위 (AUD/월)
  const [living, setLiving] = useState(
    defaults?.living_cost_aud_monthly ?? LIVING_DEFAULTS[inferredRegion] ?? 1500,
  );
  const [oshc, setOshc]   = useState(defaults?.items.oshc_per_year_aud ?? 700);
  const [visa, setVisa]   = useState(defaults?.items.visa_500_aud ?? 2000);
  const [settle, setSettle] = useState(defaults?.items.settlement_aud ?? 3000);

  const [accom, setAccom] = useState(defaults?.accommodation_aud ?? 0);
  const [accomType, setAccomType] = useState(defaults?.accommodation_type ?? "");
  const [pickup, setPickup] = useState(defaults?.pickup_aud ?? 0);
  const [pickupType, setPickupType] = useState(defaults?.pickup_type ?? "");

  const [airfare, setAirfare] = useState(defaults?.airfare_krw ?? 1800000);
  const [consult, setConsult] = useState(defaults?.items.consultation_fee_krw ?? 50000);
  const [processing, setProcessing] = useState(defaults?.processing_fee_krw ?? 0);
  const [processingReason, setProcessingReason] = useState(defaults?.processing_fee_reason ?? "");

  const today = new Date().toISOString().slice(0, 10);
  const [fx, setFx] = useState(defaults?.items.exchange_rate_krw_per_aud ?? 920);
  const [fxDate, setFxDate] = useState(defaults?.exchange_rate_date ?? today);

  const [note, setNote] = useState(defaults?.note ?? "");

  // ─── Helpers ───────────────────────────────────
  function updateSchool(idx: number, patch: Partial<SelectedSchool>) {
    setSchoolRows((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function changeRegion(r: string) {
    setRegion(r);
    if (LIVING_DEFAULTS[r] != null) setLiving(LIVING_DEFAULTS[r]);
  }

  // 환율 입력 시 = 오늘 날짜 자동 기록 (사양서 [4])
  function changeFx(v: number) {
    setFx(v);
    setFxDate(new Date().toISOString().slice(0, 10));
  }

  // 022: 학교별 1년 추정 (Wilson 100% 수기 / duration_text는 표시용 / 계산 X)
  // 학비 = Wilson 입력 그대로 (장학금·프로모션 차감) / 기타 항목 = 1년 기준
  const krwAdditions = airfare + consult + processing;
  const livingYearly = living * 12;
  const accomYearly = accom * 52;
  const oneTimeAud = visa + settle + pickup;
  const commonYearlyAud = livingYearly + oshc + accomYearly + oneTimeAud;

  const totals = schoolRows
    .filter((s) => s.school_name.trim())
    .map((s) => {
      const tuitionActual = s.tuition_aud - s.scholarship_aud - s.promotion_aud;
      const audSubtotal = tuitionActual + commonYearlyAud;
      const krwTotal = Math.round(audSubtotal * fx + krwAdditions);
      return {
        name: s.school_name,
        durationText: s.duration_text,
        tuitionEntered: s.tuition_aud,
        tuitionActual,
        audSubtotal: Math.round(audSubtotal),
        krwTotal,
        payment_cycle: s.payment_cycle,
      };
    });

  // ─── JSX ────────────────────────────────────────
  return (
    <form action={formAction} className="flex flex-col gap-5">
      {quoteId && <input type="hidden" name="quote_id" value={quoteId} />}

      {/* 견적서 종류 토글 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">견적서 종류</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <TypeRadio
            value="consultation"
            label="📊 상담 견적서"
            hint="1:1 상담 직후 / 학교 결정 전 / 5년 전체 큰 그림"
            current={quoteType}
            onChange={setQuoteType}
          />
          <TypeRadio
            value="enrollment"
            label="💸 수속 견적서"
            hint="학교 결정 후 / 수속 시작 시 / 입금 일정·계좌"
            current={quoteType}
            onChange={setQuoteType}
          />
        </div>
        <input type="hidden" name="quote_type" value={quoteType} />
        {quoteType === "enrollment" && (
          <div className="mt-3 rounded-lg border border-gold-400/40 bg-gold-100/50 p-3 text-xs text-navy-700">
            ⚠️ 수속 견적서 UI (계좌번호·입금 일정 등)는 Phase 2에서 추가됩니다. 지금은 종류만 저장돼요.
          </div>
        )}
      </section>

      {/* Step 1: 학생 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">Step 1. 학생 선택</h2>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">학생</span>
          <select
            name="student_id"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.summary && `(${s.summary})`}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Step 2: 학교 (1~3개) — 022: 100% Wilson 수기 입력 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          Step 2. 학교 1~3개 (빈 칸 = 미사용 / Wilson 100% 수기 입력)
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          자동완성 X. 학교명·프로그램·기간 모두 자유 텍스트. 학비에서 장학금·프로모션 빼면 실제 학비 자동 계산.
        </p>

        <div className="mt-4 flex flex-col gap-5">
          {schoolRows.map((s, i) => {
            const actual = s.tuition_aud - s.scholarship_aud - s.promotion_aud;
            return (
              <fieldset key={i} className="rounded-xl border border-cream-300 bg-cream-100/50 p-4">
                <legend className="rounded-full bg-navy-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  학교 {i + 1}
                </legend>

                {/* 기본 정보 (자유 텍스트) */}
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <InputLabel
                    label="학교명"
                    name={`school${i}_name`}
                    value={s.school_name}
                    onChange={(v) => updateSchool(i, { school_name: v })}
                    placeholder="예: UTS Insearch / 사립 X"
                  />
                  <InputLabel
                    label="프로그램·전공"
                    name={`school${i}_program`}
                    value={s.program}
                    onChange={(v) => updateSchool(i, { program: v })}
                    placeholder="예: Master of Nursing"
                  />
                  <InputLabel
                    label="기간"
                    name={`school${i}_duration_text`}
                    value={s.duration_text}
                    onChange={(v) => updateSchool(i, { duration_text: v })}
                    placeholder="24주 / 1.5년 / 1학기 등"
                  />
                </div>

                {/* 학비 + 장학금 + 프로모션 + 실제 학비 */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <InputLabel
                    label="학비 (AUD)"
                    name={`school${i}_tuition`}
                    type="number"
                    value={String(s.tuition_aud || "")}
                    onChange={(v) => updateSchool(i, { tuition_aud: parseFloat(v) || 0 })}
                    placeholder="예: 35000"
                  />
                  <InputLabel
                    label="장학금 (AUD)"
                    name={`school${i}_scholarship`}
                    type="number"
                    value={String(s.scholarship_aud || "")}
                    onChange={(v) => updateSchool(i, { scholarship_aud: parseFloat(v) || 0 })}
                    placeholder="0"
                  />
                  <InputLabel
                    label="프로모션 할인 (AUD)"
                    name={`school${i}_promotion`}
                    type="number"
                    value={String(s.promotion_aud || "")}
                    onChange={(v) => updateSchool(i, { promotion_aud: parseFloat(v) || 0 })}
                    placeholder="0"
                  />
                </div>

                {/* 실제 학비 (자동 계산) */}
                <div className="mt-3 rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="text-xs font-semibold text-navy-700">실제 학비</span>
                  <span className="ml-2 font-display font-bold text-navy-900">
                    AUD ${actual.toLocaleString("en-AU")}
                  </span>
                  <span className="ml-2 text-[11px] text-ink-500">
                    = {s.tuition_aud.toLocaleString("en-AU")} − {s.scholarship_aud.toLocaleString("en-AU")} − {s.promotion_aud.toLocaleString("en-AU")}
                  </span>
                </div>

                {/* INTERNAL 사유 메모 (학생 노출 X) */}
                {(s.scholarship_aud > 0 || s.promotion_aud > 0) && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {s.scholarship_aud > 0 && (
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-error">
                          ⚠️ 장학금 사유 (Wilson INTERNAL)
                        </span>
                        <textarea
                          name={`school${i}_scholarship_note`}
                          rows={2}
                          value={s.scholarship_note ?? ""}
                          onChange={(e) => updateSchool(i, { scholarship_note: e.target.value || null })}
                          placeholder="장학금 근거·조건 내부 메모"
                          className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-navy-900 outline-none focus:border-error"
                        />
                      </label>
                    )}
                    {s.promotion_aud > 0 && (
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-error">
                          ⚠️ 프로모션 사유 (Wilson INTERNAL)
                        </span>
                        <textarea
                          name={`school${i}_promotion_note`}
                          rows={2}
                          value={s.promotion_note ?? ""}
                          onChange={(e) => updateSchool(i, { promotion_note: e.target.value || null })}
                          placeholder="프로모션 출처·기한 내부 메모"
                          className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-navy-900 outline-none focus:border-error"
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* payment_cycle 수동 선택 (안내 문구용) */}
                <div className="mt-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-navy-700">학비 결제 주기 (학생 안내용 / 선택)</span>
                    <select
                      name={`school${i}_cycle`}
                      value={s.payment_cycle ?? ""}
                      onChange={(e) => updateSchool(i, { payment_cycle: e.target.value || null })}
                      className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500 sm:max-w-md"
                    >
                      {CYCLE_OPTIONS.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </label>
                  {s.payment_cycle && PAYMENT_CYCLE_HINTS[s.payment_cycle] && (
                    <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-navy-700">
                      {PAYMENT_CYCLE_HINTS[s.payment_cycle]}
                    </p>
                  )}
                </div>
              </fieldset>
            );
          })}
        </div>
      </section>

      {/* Step 3: AUD 항목 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          Step 3. AUD 항목 (호주 현지 비용)
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">지역</span>
            <select
              name="region"
              value={region}
              onChange={(e) => changeRegion(e.target.value)}
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
            >
              {Object.keys(LIVING_DEFAULTS).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <NumField
            label="생활비 (AUD/월)"
            name="living_monthly"
            value={living}
            setValue={setLiving}
            hint={`× 12 = AUD $${(living * 12).toLocaleString("en-AU")}/년 · 시드니~$1,700 · 멜번~$1,500 · 브리즈번~$1,400`}
          />
          <NumField label="OSHC (AUD/년)" name="oshc" value={oshc} setValue={setOshc} />
          <NumField label="학생비자 500 (AUD, 1회)" name="visa" value={visa} setValue={setVisa} />
          <NumField label="정착비 (AUD, 1회)" name="settlement" value={settle} setValue={setSettle} />
        </div>

        {/* 숙소비 */}
        <div className="mt-5 rounded-xl border border-cream-300 bg-cream-100/50 p-4">
          <h3 className="text-sm font-semibold text-navy-900">🏠 숙소비 (AUD)</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">타입</span>
              <select
                name="accommodation_type"
                value={accomType}
                onChange={(e) => setAccomType(e.target.value)}
                className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
              >
                {ACCOMMODATION_OPTIONS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
            <NumField
              label="주당 비용 (AUD)"
              name="accommodation"
              value={accom}
              setValue={setAccom}
              hint={ACCOMMODATION_OPTIONS.find(([v]) => v === accomType)?.[2] || "유형 선택 후 입력"}
            />
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">학생 PDF 표시</span>
              <span className="rounded-lg bg-white px-3 py-2 text-xs text-ink-500">
                {accomType && accom > 0
                  ? `숙소: $${accom}/주 (${ACCOMMODATION_OPTIONS.find(([v]) => v === accomType)?.[1] ?? ""})`
                  : "표시 안 함"}
              </span>
            </div>
          </div>
        </div>

        {/* 픽업비 */}
        <div className="mt-3 rounded-xl border border-cream-300 bg-cream-100/50 p-4">
          <h3 className="text-sm font-semibold text-navy-900">🚐 픽업비 (AUD)</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">옵션</span>
              <select
                name="pickup_type"
                value={pickupType}
                onChange={(e) => setPickupType(e.target.value)}
                className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
              >
                {PICKUP_OPTIONS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
            <NumField
              label="1회 비용 (AUD)"
              name="pickup"
              value={pickup}
              setValue={setPickup}
              hint={PICKUP_OPTIONS.find(([v]) => v === pickupType)?.[2] || "유형 선택 후 입력"}
            />
          </div>
        </div>
      </section>

      {/* Step 4: KRW 항목 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          Step 4. KRW 항목 (한국 결제)
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <NumField label="항공권 왕복 (KRW)" name="airfare_krw" value={airfare} setValue={setAirfare} />
          <NumField label="1:1 화상 상담비 (KRW)" name="consultation_fee" value={consult} setValue={setConsult} hint="진학 시 100% 차감 안내" />
          <NumField label="수속비 (KRW)" name="processing_fee_krw" value={processing} setValue={setProcessing} hint="기본 0 / 별도 발생 시" />
        </div>

        {processing > 0 && (
          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-error">
              ⚠️ 수속비 INTERNAL 메모 (Wilson만 / 학생 PDF 노출 X)
            </span>
            <textarea
              name="processing_fee_reason"
              rows={2}
              value={processingReason}
              onChange={(e) => setProcessingReason(e.target.value)}
              placeholder="내부 메모. 학생에겐 '사전 안내' 표현만 사용."
              className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-navy-900 outline-none focus:border-error"
            />
          </label>
        )}
      </section>

      {/* Step 5: 환율 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          Step 5. 환율 (Wilson 수동 입력)
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          학생 PDF 상단에 자동 표시: <strong>환율 기준일 {fxDate} / 1 AUD = {fx.toLocaleString("ko-KR")} KRW / 견적 유효 7일</strong>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumField
            label="환율 (KRW/AUD)"
            name="exchange_rate"
            value={fx}
            setValue={changeFx}
            step="1"
            hint="입력 시 오늘 날짜 자동 기록"
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">환율 기준일</span>
            <input
              type="date"
              name="exchange_rate_date"
              value={fxDate}
              onChange={(e) => setFxDate(e.target.value)}
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
            />
          </label>
        </div>

        <label className="mt-5 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">비고 / 메모</span>
          <textarea
            name="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="환율 변동 안내·할인·메모 (학생에게 보일 수 있음)"
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
          />
        </label>
      </section>

      {/* Step 6: 자동 계산 결과 — 022: 학교별 1년 추정 */}
      <section className="rounded-2xl border border-gold-400/40 bg-gold-100/40 p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          Step 6. 자동 계산 결과 (1년 기준 추정 / KRW 메인)
        </h2>
        {totals.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">학교를 입력하면 자동 계산됩니다.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {totals.map((t, i) => (
              <li key={i} className="rounded-lg bg-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="font-display text-sm font-bold text-navy-900">
                      {t.name}
                    </span>
                    {t.durationText && (
                      <span className="ml-2 text-[11px] text-ink-500">({t.durationText})</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-navy-900">
                      ₩{t.krwTotal.toLocaleString("ko-KR")}
                    </div>
                    <div className="text-[11px] text-ink-500">
                      AUD ${t.audSubtotal.toLocaleString("en-AU")} + ₩{krwAdditions.toLocaleString("ko-KR")} 한국 결제
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-navy-700">
                  실제 학비 AUD ${t.tuitionActual.toLocaleString("en-AU")} + 기타 1년 기준
                </div>
                {t.payment_cycle && PAYMENT_CYCLE_HINTS[t.payment_cycle] && (
                  <p className="mt-2 text-[11px] text-navy-700">
                    {PAYMENT_CYCLE_HINTS[t.payment_cycle]}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-ink-500">
          💡 표시값 = 학교별 학비 (실제) + 기타 항목 <strong>1년 기준</strong>. 다년치 큰 그림은 학비를 다년 합계로 입력하거나 비고 메모에 별도 기재.
        </p>
      </section>

      {/* 저장 */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-cream-300 bg-white p-4 shadow-md">
        <div className="text-xs">
          {state.error && (
            <span className="rounded-lg bg-error/10 px-2.5 py-1 text-error">{state.error}</span>
          )}
          {state.ok && !pending && (
            <span className="rounded-lg bg-success/10 px-2.5 py-1 text-success">✓ 저장됨</span>
          )}
          {!state.error && !state.ok && (
            <span className="text-ink-500">저장 = draft. PDF 발송은 Phase 2.</span>
          )}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중…" : mode === "new" ? "💾 견적서 생성" : "💾 견적서 저장"}
        </Button>
      </div>
    </form>
  );
}

// ─── 작은 인풋 헬퍼들 ────────────────────────────────
function InputLabel({
  label, name, value, onChange, placeholder, type = "text", step,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; step?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-navy-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
      />
    </label>
  );
}

function NumField({
  label, name, value, setValue, hint, step = "1",
}: {
  label: string; name: string; value: number; setValue: (n: number) => void;
  hint?: string; step?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-navy-700">{label}</span>
      <input
        type="number"
        name={name}
        value={value || ""}
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
        step={step}
        className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
      />
      {hint && <span className="text-[10px] text-ink-500">{hint}</span>}
    </label>
  );
}

function TypeRadio({
  value, label, hint, current, onChange,
}: {
  value: "consultation" | "enrollment";
  label: string; hint: string;
  current: string;
  onChange: (v: "consultation" | "enrollment") => void;
}) {
  const active = current === value;
  return (
    <label
      className={`flex flex-1 cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3 text-sm transition ${
        active
          ? "border-gold-500 bg-gold-100"
          : "border-cream-300 bg-white text-navy-700 hover:bg-cream-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <input
          type="radio"
          checked={active}
          onChange={() => onChange(value)}
          className="size-3.5 accent-gold-600"
        />
        <span className="font-semibold text-navy-900">{label}</span>
      </div>
      <span className="text-[11px] text-ink-500">{hint}</span>
    </label>
  );
}
