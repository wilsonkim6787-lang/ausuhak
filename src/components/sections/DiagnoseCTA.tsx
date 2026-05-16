"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type FieldKey = "major" | "region" | "edu" | "english" | "budget" | "goal";

interface FieldOption {
  value: string;
  label: string;
}

interface FieldDef {
  key: FieldKey;
  icon: string;
  labelKey:
    | "fieldMajor"
    | "fieldRegion"
    | "fieldEdu"
    | "fieldEnglish"
    | "fieldBudget"
    | "fieldGoal";
  hintKey?: "fieldEduHint" | "fieldEnglishHint" | "fieldGoalHint";
  options: FieldOption[];
}

const FIELDS: FieldDef[] = [
  {
    key: "major",
    icon: "\u{1F4DA}",
    labelKey: "fieldMajor",
    options: [
      { value: "nursing", label: "간호" },
      { value: "business", label: "경영" },
      { value: "it", label: "IT" },
      { value: "cooking", label: "요리" },
      { value: "hotel", label: "호텔경영" },
      { value: "medicine", label: "의대" },
      { value: "pharmacy", label: "약대" },
      { value: "other", label: "기타·잘 모르겠어요" },
    ],
  },
  {
    key: "region",
    icon: "\u{1F4CD}",
    labelKey: "fieldRegion",
    options: [
      { value: "nsw", label: "NSW (시드니)" },
      { value: "vic", label: "VIC (멜번)" },
      { value: "qld", label: "QLD (브리즈번)" },
      { value: "goldcoast", label: "골드코스트" },
      { value: "sa", label: "SA (애들레이드)" },
      { value: "wa", label: "WA (퍼스)" },
      { value: "tas", label: "TAS (호바트)" },
      { value: "any", label: "상관없음" },
    ],
  },
  {
    key: "edu",
    icon: "\u{1F393}",
    labelKey: "fieldEdu",
    hintKey: "fieldEduHint",
    options: [
      { value: "high", label: "고졸 (또는 졸업 예정)" },
      { value: "ged", label: "검정고시 (또는 자퇴 예정)" },
      { value: "uni-current", label: "대학 재학·휴학" },
      { value: "uni-grad", label: "대학 졸업" },
      { value: "master", label: "석사 이상" },
    ],
  },
  {
    key: "english",
    icon: "\u{1F4CA}",
    labelKey: "fieldEnglish",
    hintKey: "fieldEnglishHint",
    options: [
      { value: "none", label: "영어 점수 없음" },
      { value: "5.0", label: "IELTS 5.0~5.5" },
      { value: "6.0", label: "IELTS 6.0" },
      { value: "6.5", label: "IELTS 6.5" },
      { value: "7.0", label: "IELTS 7.0 이상" },
    ],
  },
  {
    key: "budget",
    icon: "\u{1F4B0}",
    labelKey: "fieldBudget",
    options: [
      { value: "save", label: "절약 ($25K~$30K)" },
      { value: "mid", label: "보통 ($30K~$40K)" },
      { value: "high", label: "여유 ($40K~$55K)" },
      { value: "premium", label: "충분 ($55K~$75K)" },
      { value: "vip", label: "VIP ($75K 이상 / 상관없음)" },
    ],
  },
  {
    key: "goal",
    icon: "\u{1F3AF}",
    labelKey: "fieldGoal",
    hintKey: "fieldGoalHint",
    options: [
      { value: "pr", label: "영주권(PR) 취득" },
      { value: "grad", label: "명문대 졸업" },
      { value: "med", label: "의대·전문직" },
      { value: "it-eng", label: "IT·공학" },
      { value: "work", label: "호주 취업" },
      { value: "any", label: "잘 모르겠어요" },
    ],
  },
];

type ConcernKey =
  | "concern1"
  | "concern2"
  | "concern3"
  | "concern4"
  | "concern5"
  | "concern6"
  | "concern7"
  | "concern8"
  | "concern9"
  | "concern10";

const CONCERNS: { icon: string; key: ConcernKey }[] = [
  { icon: "\u{1F4DA}", key: "concern1" },
  { icon: "\u{1F4DD}", key: "concern2" },
  { icon: "\u{1F4B0}", key: "concern3" },
  { icon: "\u{1FA7A}", key: "concern4" },
  { icon: "\u{1F3E5}", key: "concern5" },
  { icon: "\u{2B50}", key: "concern6" },
  { icon: "\u{1F6C2}", key: "concern7" },
  { icon: "\u{1F393}", key: "concern8" },
  { icon: "\u{1F504}", key: "concern9" },
  { icon: "\u{1F6EB}", key: "concern10" },
];

export default function DiagnoseCTA() {
  const t = useTranslations("DiagnoseCTA");
  const router = useRouter();
  const [values, setValues] = useState<Partial<Record<FieldKey, string>>>({});
  const [step, setStep] = useState(0); // 모바일 wizard 현재 단계 (0 ~ FIELDS.length)

  const filled = FIELDS.filter((f) => values[f.key]).length;
  const progress = (filled / FIELDS.length) * 100;
  const totalSteps = FIELDS.length;

  const buildQs = () =>
    new URLSearchParams(
      Object.entries(values)
        .filter(([, v]) => v)
        .map(([k, v]) => [k, v!]),
    ).toString();

  const onSubmit = () => {
    const qs = buildQs();
    router.push(qs ? `/diagnose?${qs}` : "/diagnose");
  };

  // 모바일 wizard: 옵션 선택 시 값 저장 + 다음 step
  const onPick = (key: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const onBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const onSkip = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const currentField = step < totalSteps ? FIELDS[step] : null;
  const isComplete = step >= totalSteps;

  return (
    <section id="diagnose" className="bg-navy-900 text-cream-100">
      <div className="container mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">
            {t("eyebrow")}
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-cream-100 sm:text-5xl">
            {t("titleLine1")}
            <br />
            <span className="italic text-gold-500">{t("titleLine2")}</span>
            <span aria-hidden>.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cream-200 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-12">
          {/* 좌측: 공감 패널 */}
          <aside className="rounded-3xl border border-cream-100/15 bg-navy-800/40 p-7 backdrop-blur-sm sm:p-9">
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
              {t("concernHeading")}
            </p>
            <ul className="mt-6 space-y-3.5">
              {CONCERNS.map((c) => (
                <li key={c.key} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-base"
                  >
                    {c.icon}
                  </span>
                  <span className="pt-1 text-sm leading-relaxed text-cream-100 sm:text-[15px]">
                    {t(c.key)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-7 border-t border-cream-100/15 pt-5 text-xs leading-relaxed text-cream-200/80 sm:text-sm">
              {t("concernNote")}
            </p>
          </aside>

          {/* 우측: 진단 폼 (모바일 wizard + sm+ grid) */}
          <div className="rounded-3xl bg-white p-6 text-ink-900 shadow-xl sm:p-9">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-gold-600 text-base font-bold text-white">
                1
              </span>
              <span className="text-sm font-semibold text-navy-900 sm:text-base">
                {t("stepHeader")}
              </span>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold text-navy-900 sm:text-2xl">
              {t("stepTitle")}
            </h3>

            <div className="mt-5 flex items-center gap-3">
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200"
                role="progressbar"
                aria-valuenow={filled}
                aria-valuemin={0}
                aria-valuemax={totalSteps}
              >
                <div
                  className="h-full rounded-full bg-gold-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-bold tabular-nums text-navy-900">
                {filled} / {totalSteps}
              </span>
            </div>

            {/* ─── 모바일 wizard (sm 미만) ─── */}
            <div className="sm:hidden">
              {!isComplete && currentField && (
                <div className="mt-7">
                  <p className="text-xs font-semibold text-gold-600">
                    {step + 1} / {totalSteps}
                  </p>
                  <label className="mt-2 flex items-center gap-2 text-base font-bold text-navy-900">
                    <span aria-hidden>{currentField.icon}</span>
                    {t(currentField.labelKey)}
                  </label>
                  {currentField.hintKey && (
                    <p className="mt-1.5 text-xs text-ink-500">
                      {t(currentField.hintKey)}
                    </p>
                  )}
                  <p className="mt-1 text-[10px] text-ink-500">
                    {t("wizardSelectHint")}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {currentField.options.map((opt) => {
                      const selected = values[currentField.key] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onPick(currentField.key, opt.value)}
                          className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition active:scale-[0.98] ${
                            selected
                              ? "border-gold-600 bg-gold-600/10 text-navy-900"
                              : "border-cream-300 bg-cream-100 text-navy-900 hover:border-gold-500"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={onBack}
                      disabled={step === 0}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-700 disabled:opacity-30"
                    >
                      ← {t("wizardBack")}
                    </button>
                    <button
                      type="button"
                      onClick={onSkip}
                      className="text-xs text-ink-500 underline"
                    >
                      {t("wizardSkip")}
                    </button>
                  </div>
                </div>
              )}

              {isComplete && (
                <div className="mt-7 rounded-2xl border-2 border-gold-600 bg-gold-600/5 p-5 text-center">
                  <p className="text-sm font-bold text-navy-900">
                    🎉 입력 끝났습니다
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {filled} / {totalSteps} 항목 — 7장 리포트로 보여드릴게요
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="mt-3 text-[11px] text-navy-700 underline"
                  >
                    ↩ 다시 보기·수정
                  </button>
                </div>
              )}
            </div>

            {/* ─── PC grid (sm 이상) ─── */}
            <div className="mt-7 hidden gap-5 sm:grid sm:grid-cols-2">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label
                    htmlFor={`dx-${f.key}`}
                    className="flex items-center gap-2 text-sm font-semibold text-navy-900"
                  >
                    <span aria-hidden>{f.icon}</span>
                    {t(f.labelKey)}
                  </label>
                  <select
                    id={`dx-${f.key}`}
                    value={values[f.key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [f.key]: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-navy-900 transition focus:border-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-600/30"
                  >
                    <option value="">{t("selectPlaceholder")}</option>
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {f.hintKey && (
                    <p className="mt-1.5 text-xs text-ink-500">
                      {t(f.hintKey)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onSubmit}
              className="mt-9 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
            >
              {t("ctaPrimary")} <span aria-hidden>→</span>
            </button>
            <p className="mt-3 text-center text-xs text-ink-500">
              {t("ctaSubtext")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
