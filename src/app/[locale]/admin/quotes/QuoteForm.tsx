"use client";

import { useActionState, useMemo, useState, useEffect, useRef } from "react";
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

const LIVING_DEFAULTS: Record<string, number> = {
  "시드니": 1700, "멜번": 1500, "브리즈번": 1400, "골드코스트": 1300,
  "퍼스": 1400, "애들레이드": 1300, "호바트": 1200, "캔버라": 1500,
};

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
  ["", "— 미선택 —", ""],
  ["none",       "숙소 없음",   "0"],
  ["homestay",   "홈스테이",    "주당 $300-400 (참고)"],
  ["dormitory",  "학교 기숙사", "주당 $250-500 (참고)"],
  ["sharehouse", "쉐어하우스",  "주당 $200-350 (참고)"],
];

const PICKUP_OPTIONS: [string, string, string][] = [
  ["", "— 미선택 —", ""],
  ["none",    "픽업 없음",   "0"],
  ["school",  "학교 픽업",   "1회 $150-200"],
  ["private", "사설 픽업",   "Wilson 합의가"],
];

// 단계 종류 (단계 쌓기 — 어학연수→컬리지→대학→직접 추가)
const STEP_TYPES: { type: string; hint: string }[] = [
  { type: "어학연수", hint: "ELICOS · 어학원" },
  { type: "컬리지",   hint: "Foundation · Diploma · Pathway" },
  { type: "대학",     hint: "Bachelor · Master" },
  { type: "직접 추가", hint: "기타 과정" },
];

function emptySchool(stepType?: string): SelectedSchool {
  return {
    step_type: stepType,
    school_name: "", program: "",
    duration_text: "",
    payment_cycle: null,
    tuition_aud: 0, scholarship_aud: 0, promotion_aud: 0,
    scholarship_note: null, promotion_note: null,
  };
}

function fmtAud(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-AU");
}
function fmtKrw(n: number): string {
  return "₩" + Math.round(n).toLocaleString("ko-KR");
}

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
  };
}) {
  const action = mode === "new" ? createQuoteAction : updateQuoteAction;
  const [state, formAction, pending] = useActionState(action, initial);

  const [quoteType, setQuoteType] = useState<"consultation" | "enrollment">(
    defaults?.quote_type ?? "consultation",
  );

  const [studentId, setStudentId] = useState(
    defaults?.student_id ?? initialStudentId ?? "",
  );

  const selectedStudent = students.find((s) => s.id === studentId);
  const inferredRegion =
    defaults?.items.region ??
    selectedStudent?.preferred_region ??
    "시드니";

  // 동적 단계 쌓기 — defaults 가 있으면 그대로 / 없으면 빈 배열로 시작
  const startSchools: SelectedSchool[] =
    defaults?.schools && defaults.schools.length > 0
      ? defaults.schools
      : [];
  const [schoolRows, setSchoolRows] = useState<SelectedSchool[]>(startSchools);

  const [region, setRegion] = useState<string>(inferredRegion);
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

  const [previewMode, setPreviewMode] = useState(false);

  // ─── Helpers ───────────────────────────────────
  function updateSchool(idx: number, patch: Partial<SelectedSchool>) {
    setSchoolRows((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }
  function addSchool(stepType: string) {
    setSchoolRows((prev) => [...prev, emptySchool(stepType)]);
  }
  function removeSchool(idx: number) {
    setSchoolRows((prev) => prev.filter((_, i) => i !== idx));
  }
  function moveSchool(idx: number, dir: -1 | 1) {
    setSchoolRows((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const n = [...prev];
      [n[idx], n[j]] = [n[j], n[idx]];
      return n;
    });
  }

  function changeRegion(r: string) {
    setRegion(r);
    if (LIVING_DEFAULTS[r] != null) setLiving(LIVING_DEFAULTS[r]);
  }
  function changeFx(v: number) {
    setFx(v);
    setFxDate(new Date().toISOString().slice(0, 10));
  }

  // ─── 1년 추정 계산 ───────────────────────────────
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
        step_type: s.step_type ?? "",
        name: s.school_name,
        durationText: s.duration_text,
        tuitionActual,
        audSubtotal: Math.round(audSubtotal),
        krwTotal,
        payment_cycle: s.payment_cycle,
      };
    });

  const totalSchoolsAud = totals.reduce((a, t) => a + t.tuitionActual, 0);
  const totalAud = totalSchoolsAud + (totals.length > 0 ? commonYearlyAud : 0);
  const totalKrw = totals.length > 0
    ? Math.round(totalAud * fx + krwAdditions)
    : 0;

  // ─── 카카오 텍스트 (학생 view 톤 / INTERNAL 메모 제외) ───
  const kakaoText = useMemo(() => {
    const L: string[] = [];
    L.push("【호주 유학 예상 견적서】");
    if (selectedStudent?.name) L.push(`${selectedStudent.name} 님`);
    L.push(`기준일 ${fxDate} · 1 AUD ≈ ${fx.toLocaleString("ko-KR")}원 · 견적 유효 7일`);
    L.push("");
    if (totals.length > 0) {
      L.push("■ 학업 경로");
      totals.forEach((t, i) => {
        const label = t.step_type ? `${t.step_type} · ${t.name}` : t.name;
        const dur = t.durationText ? ` (${t.durationText})` : "";
        L.push(`${i + 1}. ${label}${dur}`);
        L.push(`   실제 학비 ${fmtAud(t.tuitionActual)}`);
        L.push(`   1년 추정 ${fmtAud(t.audSubtotal)} (${fmtKrw(t.krwTotal)})`);
      });
      L.push("");
    }
    L.push("■ 1년 기준 공통 비용 (AUD)");
    L.push(`· 생활비 ${fmtAud(living)}/월 × 12 = ${fmtAud(livingYearly)}`);
    L.push(`· OSHC 연 ${fmtAud(oshc)}`);
    if (accom > 0) L.push(`· 숙소 주당 ${fmtAud(accom)} × 52 = ${fmtAud(accomYearly)}`);
    L.push(`· 학생비자 ${fmtAud(visa)} · 정착비 ${fmtAud(settle)}`);
    if (pickup > 0) L.push(`· 픽업 ${fmtAud(pickup)}`);
    L.push("");
    L.push("■ 한국 결제 (KRW)");
    L.push(`· 항공권 ${fmtKrw(airfare)}`);
    L.push(`· 1:1 화상 상담비 ${fmtKrw(consult)} (진학 시 100% 차감)`);
    if (processing > 0) L.push(`· 수속비 ${fmtKrw(processing)} (사전 안내)`);
    L.push("");
    if (totals.length > 0) {
      L.push(`■ 1년 추정 총액 (학교별)`);
      totals.forEach((t) => {
        L.push(`· ${t.name}: ${fmtKrw(t.krwTotal)}`);
      });
    }
    if (note.trim()) {
      L.push("");
      L.push("■ 메모");
      note.trim().split("\n").forEach((line) => L.push(line ? `· ${line}` : ""));
    }
    L.push("");
    L.push("환율과 학교 일정에 따라 변동될 수 있습니다.");
    L.push("자세한 상담은 카카오톡으로 이어서 도와드리겠습니다.");
    return L.join("\n");
  }, [
    selectedStudent?.name, fxDate, fx, totals, living, livingYearly,
    oshc, accom, accomYearly, visa, settle, pickup, airfare, consult,
    processing, note,
  ]);

  const [kakaoCopied, setKakaoCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function copyKakao() {
    navigator.clipboard.writeText(kakaoText).then(
      () => {
        setKakaoCopied(true);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setKakaoCopied(false), 2000);
      },
      () => alert("복사 실패 — 텍스트를 직접 선택해 복사하세요."),
    );
  }
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  if (previewMode) {
    return (
      <PreviewView
        student={selectedStudent}
        totals={totals}
        living={living}
        livingYearly={livingYearly}
        oshc={oshc}
        accom={accom} accomYearly={accomYearly} accomType={accomType}
        pickup={pickup} pickupType={pickupType}
        visa={visa} settle={settle}
        airfare={airfare} consult={consult} processing={processing}
        fx={fx} fxDate={fxDate}
        note={note}
        totalAud={totalAud}
        totalKrw={totalKrw}
        onBack={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 pb-32">
      {quoteId && <input type="hidden" name="quote_id" value={quoteId} />}
      <input type="hidden" name="quote_type" value={quoteType} />
      <input type="hidden" name="schools_json" value={JSON.stringify(schoolRows)} />

      {/* sticky 계산 결과 + 미리보기 토글 */}
      <div className="sticky top-0 z-20 -mx-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold-400/50 bg-gold-100/90 px-4 py-3 shadow-md backdrop-blur">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-700">
            1년 추정 총액 (학교 {totals.length}개)
          </span>
          <span className="font-display text-xl font-bold text-navy-900">
            {fmtKrw(totalKrw)}{" "}
            <span className="text-sm font-normal text-ink-500">
              (AUD ${totalAud.toLocaleString("en-AU")})
            </span>
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className="rounded-full border border-navy-900 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 hover:bg-cream-100"
          >
            👁️ 학생 미리보기
          </button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "저장 중…" : mode === "new" ? "💾 견적서 생성" : "💾 저장"}
          </Button>
        </div>
      </div>

      {/* 견적서 종류 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">견적서 종류</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <TypeRadio value="consultation" label="📊 상담 견적서" hint="1:1 상담 직후 · 학교 결정 전 · 5년 큰 그림" current={quoteType} onChange={setQuoteType} />
          <TypeRadio value="enrollment" label="💸 수속 견적서" hint="학교 결정 후 · 수속 시작 · 입금 일정" current={quoteType} onChange={setQuoteType} />
        </div>
        {quoteType === "enrollment" && (
          <div className="mt-3 rounded-lg border border-gold-400/40 bg-gold-100/50 p-3 text-xs text-navy-700">
            ⚠️ 수속 견적서 UI (계좌·입금 일정 등)는 Phase 2 에서. 지금은 종류만 저장.
          </div>
        )}
      </section>

      {/* 학생 선택 (검색 가능 combobox) */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">학생</h2>
        <StudentCombobox
          students={students}
          studentId={studentId}
          onChange={setStudentId}
        />
        <input type="hidden" name="student_id" value={studentId} />
      </section>

      {/* 학업 경로 (단계 쌓기) */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-navy-900">
            학업 경로 ({schoolRows.length}단계)
          </h2>
          <div className="flex flex-wrap gap-2">
            {STEP_TYPES.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => addSchool(t.type)}
                title={t.hint}
                className="rounded-full border border-navy-900 bg-white px-3 py-1 text-xs font-semibold text-navy-900 hover:bg-navy-900 hover:text-white"
              >
                + {t.type}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-xs text-ink-500">
          학생 경로에 맞춰 단계 추가. ↑↓ 으로 순서 변경. 자동완성 X / Wilson 100% 수기.
        </p>

        {schoolRows.length === 0 ? (
          <div className="mt-4 rounded-xl border-2 border-dashed border-cream-300 p-6 text-center text-sm text-ink-500">
            위에서 단계 추가 (예: 어학연수 → 컬리지 → 대학)
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {schoolRows.map((s, i) => {
              const actual = s.tuition_aud - s.scholarship_aud - s.promotion_aud;
              return (
                <fieldset key={i} className="rounded-xl border border-cream-300 bg-cream-100/50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {i + 1}
                    </span>
                    {s.step_type && (
                      <span className="text-xs font-semibold text-navy-700">
                        {s.step_type}
                      </span>
                    )}
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={() => moveSchool(i, -1)}
                      disabled={i === 0}
                      className="rounded border border-cream-300 bg-white px-2 py-0.5 text-xs text-navy-700 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSchool(i, 1)}
                      disabled={i === schoolRows.length - 1}
                      className="rounded border border-cream-300 bg-white px-2 py-0.5 text-xs text-navy-700 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSchool(i)}
                      className="rounded border border-error/30 bg-white px-2 py-0.5 text-xs text-error hover:bg-error/10"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <InputLabel label="학교명" value={s.school_name}
                      onChange={(v) => updateSchool(i, { school_name: v })}
                      placeholder="예: UTS Insearch" />
                    <InputLabel label="프로그램·전공" value={s.program}
                      onChange={(v) => updateSchool(i, { program: v })}
                      placeholder="예: Master of Nursing" />
                    <InputLabel label="기간" value={s.duration_text}
                      onChange={(v) => updateSchool(i, { duration_text: v })}
                      placeholder="24주 · 1.5년 · 1학기" />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <InputLabel label="학비 (AUD)" type="number" value={String(s.tuition_aud || "")}
                      onChange={(v) => updateSchool(i, { tuition_aud: parseFloat(v) || 0 })}
                      placeholder="35000" />
                    <InputLabel label="장학금 (AUD)" type="number" value={String(s.scholarship_aud || "")}
                      onChange={(v) => updateSchool(i, { scholarship_aud: parseFloat(v) || 0 })}
                      placeholder="0" />
                    <InputLabel label="프로모션 할인 (AUD)" type="number" value={String(s.promotion_aud || "")}
                      onChange={(v) => updateSchool(i, { promotion_aud: parseFloat(v) || 0 })}
                      placeholder="0" />
                  </div>

                  <div className="mt-3 rounded-lg bg-white px-3 py-2 text-sm">
                    <span className="text-xs font-semibold text-navy-700">실제 학비</span>
                    <span className="ml-2 font-display font-bold text-navy-900">
                      {fmtAud(actual)}
                    </span>
                    <span className="ml-2 text-[11px] text-ink-500">
                      = {s.tuition_aud.toLocaleString("en-AU")} − {s.scholarship_aud.toLocaleString("en-AU")} − {s.promotion_aud.toLocaleString("en-AU")}
                    </span>
                  </div>

                  {(s.scholarship_aud > 0 || s.promotion_aud > 0) && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {s.scholarship_aud > 0 && (
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-error">
                            ⚠️ 장학금 사유 (Wilson INTERNAL)
                          </span>
                          <textarea rows={2} value={s.scholarship_note ?? ""}
                            onChange={(e) => updateSchool(i, { scholarship_note: e.target.value || null })}
                            placeholder="장학금 근거·조건 내부 메모"
                            className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm outline-none focus:border-error" />
                        </label>
                      )}
                      {s.promotion_aud > 0 && (
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-error">
                            ⚠️ 프로모션 사유 (Wilson INTERNAL)
                          </span>
                          <textarea rows={2} value={s.promotion_note ?? ""}
                            onChange={(e) => updateSchool(i, { promotion_note: e.target.value || null })}
                            placeholder="프로모션 출처·기한 내부 메모"
                            className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm outline-none focus:border-error" />
                        </label>
                      )}
                    </div>
                  )}

                  <label className="mt-3 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-navy-700">결제 주기 (학생 안내용 / 선택)</span>
                    <select
                      value={s.payment_cycle ?? ""}
                      onChange={(e) => updateSchool(i, { payment_cycle: e.target.value || null })}
                      className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500 sm:max-w-md"
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
                </fieldset>
              );
            })}
          </div>
        )}
      </section>

      {/* AUD 항목 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">AUD 항목 (호주 현지)</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">지역</span>
            <select name="region" value={region} onChange={(e) => changeRegion(e.target.value)}
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500">
              {Object.keys(LIVING_DEFAULTS).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <NumField label="생활비 (AUD/월)" name="living_monthly" value={living} setValue={setLiving}
            hint={`× 12 = ${fmtAud(living * 12)}/년`} />
          <NumField label="OSHC (AUD/년)" name="oshc" value={oshc} setValue={setOshc} />
          <NumField label="학생비자 500 (AUD, 1회)" name="visa" value={visa} setValue={setVisa} />
          <NumField label="정착비 (AUD, 1회)" name="settlement" value={settle} setValue={setSettle} />
        </div>

        <div className="mt-5 rounded-xl border border-cream-300 bg-cream-100/50 p-4">
          <h3 className="text-sm font-semibold text-navy-900">🏠 숙소비</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">타입</span>
              <select name="accommodation_type" value={accomType} onChange={(e) => setAccomType(e.target.value)}
                className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500">
                {ACCOMMODATION_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <NumField label="주당 (AUD)" name="accommodation" value={accom} setValue={setAccom}
              hint={ACCOMMODATION_OPTIONS.find(([v]) => v === accomType)?.[2] || "유형 선택 후 입력"} />
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-cream-300 bg-cream-100/50 p-4">
          <h3 className="text-sm font-semibold text-navy-900">🚐 픽업비</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">옵션</span>
              <select name="pickup_type" value={pickupType} onChange={(e) => setPickupType(e.target.value)}
                className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500">
                {PICKUP_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <NumField label="1회 (AUD)" name="pickup" value={pickup} setValue={setPickup}
              hint={PICKUP_OPTIONS.find(([v]) => v === pickupType)?.[2] || "유형 선택 후 입력"} />
          </div>
        </div>
      </section>

      {/* KRW 항목 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">KRW 항목 (한국 결제)</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <NumField label="항공권 왕복 (KRW)" name="airfare_krw" value={airfare} setValue={setAirfare} />
          <NumField label="1:1 화상 상담비 (KRW)" name="consultation_fee" value={consult} setValue={setConsult} hint="진학 시 100% 차감 안내" />
          <NumField label="수속비 (KRW)" name="processing_fee_krw" value={processing} setValue={setProcessing} hint="기본 0 / 별도 발생 시" />
        </div>
        {processing > 0 && (
          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-error">
              ⚠️ 수속비 INTERNAL 메모 (Wilson만 / 학생 노출 X)
            </span>
            <textarea name="processing_fee_reason" rows={2} value={processingReason}
              onChange={(e) => setProcessingReason(e.target.value)}
              placeholder="내부 메모. 학생에겐 '사전 안내' 표현만."
              className="rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm outline-none focus:border-error" />
          </label>
        )}
      </section>

      {/* 환율 + 메모 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">환율 & 메모</h2>
        <p className="mt-1 text-xs text-ink-500">
          학생 PDF 상단: <strong>환율 기준일 {fxDate} · 1 AUD = {fx.toLocaleString("ko-KR")}원 · 견적 유효 7일</strong>
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumField label="환율 (KRW/AUD)" name="exchange_rate" value={fx} setValue={changeFx}
            step="1" hint="입력 시 오늘 자동 기록" />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">환율 기준일</span>
            <input type="date" name="exchange_rate_date" value={fxDate}
              onChange={(e) => setFxDate(e.target.value)}
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500" />
          </label>
        </div>
        <label className="mt-5 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">비고 / 메모 (학생에게 보일 수 있음)</span>
          <textarea name="note" rows={2} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="환율 변동 안내·할인·메모"
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500" />
        </label>
      </section>

      {/* 카카오 텍스트 */}
      {totals.length > 0 && (
        <section className="rounded-2xl border border-gold-400/40 bg-gold-100/30 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-navy-900">
              💬 카카오 전송용 텍스트 (학생 노출 안전)
            </h2>
            <button type="button" onClick={copyKakao}
              className="rounded-full bg-navy-900 px-4 py-1.5 text-xs font-semibold text-gold-400 hover:bg-navy-700">
              {kakaoCopied ? "✓ 복사됨" : "📋 클립보드 복사"}
            </button>
          </div>
          <pre className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-cream-300 bg-white px-4 py-3 text-xs leading-relaxed text-navy-900">
            {kakaoText}
          </pre>
        </section>
      )}

      {/* 상태 표시 */}
      <div className="flex items-center gap-3 rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
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
      </div>
    </form>
  );
}

// ─── 학생 검색 combobox ─────────────────────────────────────
function StudentCombobox({
  students,
  studentId,
  onChange,
}: {
  students: StudentOption[];
  studentId: string;
  onChange: (id: string) => void;
}) {
  const selected = students.find((s) => s.id === studentId);
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selected) setQuery(selected.name);
  }, [selected]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students.slice(0, 30);
    return students
      .filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q),
      )
      .slice(0, 30);
  }, [students, query]);

  return (
    <div ref={wrapRef} className="relative mt-4">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="이름·요약으로 검색 (예: 김학생 / 검정고시 간호)"
        className="w-full rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
      />
      {selected && !open && (
        <p className="mt-1 text-xs text-ink-500">
          ✓ 선택됨: {selected.name} {selected.summary && `(${selected.summary})`}
        </p>
      )}
      {open && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-cream-300 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-ink-500">검색 결과 없음</li>
          ) : (
            filtered.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(s.id);
                    setQuery(s.name);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-cream-100 ${
                    s.id === studentId ? "bg-gold-100/60" : ""
                  }`}
                >
                  <div className="font-semibold text-navy-900">{s.name}</div>
                  {s.summary && <div className="text-[11px] text-ink-500">{s.summary}</div>}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// ─── 학생 미리보기 (toggle / INTERNAL 메모 마스킹) ─────────────
function PreviewView({
  student,
  totals,
  living,
  livingYearly,
  oshc,
  accom, accomYearly, accomType,
  pickup, pickupType,
  visa, settle,
  airfare, consult, processing,
  fx, fxDate,
  note,
  totalAud,
  totalKrw,
  onBack,
}: {
  student?: StudentOption;
  totals: {
    step_type: string;
    name: string;
    durationText: string;
    tuitionActual: number;
    audSubtotal: number;
    krwTotal: number;
    payment_cycle: string | null;
  }[];
  living: number;
  livingYearly: number;
  oshc: number;
  accom: number;
  accomYearly: number;
  accomType: string;
  pickup: number;
  pickupType: string;
  visa: number;
  settle: number;
  airfare: number;
  consult: number;
  processing: number;
  fx: number;
  fxDate: string;
  note: string;
  totalAud: number;
  totalKrw: number;
  onBack: () => void;
}) {
  const accomLabel = ACCOMMODATION_OPTIONS.find(([v]) => v === accomType)?.[1] ?? "";
  const pickupLabel = PICKUP_OPTIONS.find(([v]) => v === pickupType)?.[1] ?? "";

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-0 z-20 -mx-2 flex items-center justify-between gap-3 rounded-2xl border border-navy-900 bg-navy-900 px-4 py-3 text-white shadow-md">
        <span className="text-sm font-semibold">👁️ 학생 미리보기 모드 (INTERNAL 메모 마스킹됨)</span>
        <button type="button" onClick={onBack}
          className="rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-navy-900 hover:bg-gold-300">
          ← 편집으로 돌아가기
        </button>
      </div>

      <div className="rounded-2xl border border-cream-300 bg-white p-8 shadow-sm">
        <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-navy-900 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">ausuhak.com</p>
            <h1 className="font-display text-2xl font-bold text-navy-900">호주 유학 예상 견적서</h1>
          </div>
          <div className="text-right text-xs text-ink-500">
            <p>환율 기준일 {fxDate} · 1 AUD = {fx.toLocaleString("ko-KR")}원</p>
            <p>견적 유효 7일 · Wilson Kim · QEAC E240</p>
          </div>
        </header>

        {student && (
          <div className="mt-4 text-sm text-navy-900">
            <strong>{student.name} 님</strong>
            {student.summary && <span className="ml-2 text-xs text-ink-500">({student.summary})</span>}
          </div>
        )}

        {totals.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy-700">학업 경로</h2>
            <div className="mt-3 flex flex-wrap items-stretch gap-2">
              {totals.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="rounded-xl border border-cream-300 bg-cream-100/40 p-3 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-navy-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-ink-500">{t.step_type}</span>
                    </div>
                    <div className="mt-1 text-sm font-bold text-navy-900">{t.name}</div>
                    {t.durationText && <div className="text-[11px] text-ink-500">{t.durationText}</div>}
                    <div className="mt-2 text-sm font-bold text-navy-900">
                      {fmtAud(t.audSubtotal)}
                    </div>
                    <div className="text-[11px] text-ink-500">{fmtKrw(t.krwTotal)}</div>
                  </div>
                  {i < totals.length - 1 && <span className="text-lg text-ink-300">→</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-700">비용 내역</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b-2 border-cream-300 text-xs text-ink-500">
                <th className="py-2 text-left font-semibold">항목</th>
                <th className="py-2 text-right font-semibold">AUD</th>
                <th className="py-2 text-right font-semibold">KRW</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((t, i) => (
                <tr key={i} className="border-b border-cream-200">
                  <td className="py-2 text-navy-900">
                    {t.step_type ? `${t.step_type} · ` : ""}{t.name}
                    {t.durationText && <span className="ml-2 text-xs text-ink-500">({t.durationText})</span>}
                    <div className="text-[11px] text-ink-500">실제 학비 (장학금·프로모션 차감)</div>
                  </td>
                  <td className="py-2 text-right font-semibold text-navy-900">{fmtAud(t.tuitionActual)}</td>
                  <td className="py-2 text-right text-navy-900">{fmtKrw(Math.round(t.tuitionActual * fx))}</td>
                </tr>
              ))}
              <tr className="border-b border-cream-200">
                <td className="py-2 text-navy-900">생활비 (월 {fmtAud(living)} × 12)</td>
                <td className="py-2 text-right text-navy-900">{fmtAud(livingYearly)}</td>
                <td className="py-2 text-right text-navy-900">{fmtKrw(Math.round(livingYearly * fx))}</td>
              </tr>
              <tr className="border-b border-cream-200">
                <td className="py-2 text-navy-900">OSHC (연)</td>
                <td className="py-2 text-right text-navy-900">{fmtAud(oshc)}</td>
                <td className="py-2 text-right text-navy-900">{fmtKrw(Math.round(oshc * fx))}</td>
              </tr>
              {accom > 0 && (
                <tr className="border-b border-cream-200">
                  <td className="py-2 text-navy-900">숙소 ({accomLabel} 주당 {fmtAud(accom)} × 52)</td>
                  <td className="py-2 text-right text-navy-900">{fmtAud(accomYearly)}</td>
                  <td className="py-2 text-right text-navy-900">{fmtKrw(Math.round(accomYearly * fx))}</td>
                </tr>
              )}
              <tr className="border-b border-cream-200">
                <td className="py-2 text-navy-900">학생비자 500 (1회)</td>
                <td className="py-2 text-right text-navy-900">{fmtAud(visa)}</td>
                <td className="py-2 text-right text-navy-900">{fmtKrw(Math.round(visa * fx))}</td>
              </tr>
              <tr className="border-b border-cream-200">
                <td className="py-2 text-navy-900">정착비 (1회)</td>
                <td className="py-2 text-right text-navy-900">{fmtAud(settle)}</td>
                <td className="py-2 text-right text-navy-900">{fmtKrw(Math.round(settle * fx))}</td>
              </tr>
              {pickup > 0 && (
                <tr className="border-b border-cream-200">
                  <td className="py-2 text-navy-900">픽업 ({pickupLabel})</td>
                  <td className="py-2 text-right text-navy-900">{fmtAud(pickup)}</td>
                  <td className="py-2 text-right text-navy-900">{fmtKrw(Math.round(pickup * fx))}</td>
                </tr>
              )}
              <tr className="border-b border-cream-200">
                <td className="py-2 text-navy-900">항공권 왕복 (KRW)</td>
                <td className="py-2 text-right text-ink-400">—</td>
                <td className="py-2 text-right text-navy-900">{fmtKrw(airfare)}</td>
              </tr>
              <tr className="border-b border-cream-200">
                <td className="py-2 text-navy-900">
                  1:1 화상 상담비 (KRW)
                  <div className="text-[11px] text-ink-500">진학 시 100% 차감</div>
                </td>
                <td className="py-2 text-right text-ink-400">—</td>
                <td className="py-2 text-right text-navy-900">{fmtKrw(consult)}</td>
              </tr>
              {processing > 0 && (
                <tr className="border-b border-cream-200">
                  <td className="py-2 text-navy-900">
                    수속비 (KRW)
                    <div className="text-[11px] text-ink-500">사전 안내 항목</div>
                  </td>
                  <td className="py-2 text-right text-ink-400">—</td>
                  <td className="py-2 text-right text-navy-900">{fmtKrw(processing)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy-900 font-bold">
                <td className="py-3 text-navy-900">1년 추정 총액</td>
                <td className="py-3 text-right text-navy-900">{fmtAud(totalAud)}</td>
                <td className="py-3 text-right font-display text-lg text-navy-900">{fmtKrw(totalKrw)}</td>
              </tr>
            </tfoot>
          </table>
          <p className="mt-3 text-[11px] text-ink-500">
            환율과 학교 일정에 따라 변동될 수 있습니다.
          </p>
        </section>

        {note.trim() && (
          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy-700">메모</h2>
            <ul className="mt-2 list-inside list-disc text-sm text-navy-900">
              {note.trim().split("\n").filter(Boolean).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── 작은 인풋 헬퍼 ─────────────────────────────────────────
function InputLabel({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-navy-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500"
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
        className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
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
        <input type="radio" checked={active} onChange={() => onChange(value)} className="size-3.5 accent-gold-600" />
        <span className="font-semibold text-navy-900">{label}</span>
      </div>
      <span className="text-[11px] text-ink-500">{hint}</span>
    </label>
  );
}
