"use client";

// 30초 진단 폼 (PART F-3 / 6변수 입력 → /api/diagnose → /diagnose/result/[uuid])
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const EDUCATION = ["검정고시", "고졸", "대학재학", "대졸", "워홀러"] as const;
const ENGLISH = ["없음", "4.0-5.0", "5.5", "6.0", "6.5", "7.0+"] as const;
const REGION = ["시드니", "멜번", "브리즈번", "골드코스트", "퍼스", "애들레이드", "호바트", "캔버라", "추천받기"] as const;
const MAJOR = ["간호", "IT", "비즈니스", "공학", "요리·호텔", "유아교육", "디자인", "Trade", "의료", "미정"] as const;
const BUDGET = ["$25-35K", "$35-50K", "$50-65K", "$65-80K", "$80K+"] as const;

type FormData = {
  age: string;
  education: typeof EDUCATION[number] | "";
  english_level: typeof ENGLISH[number] | "";
  preferred_region: typeof REGION[number] | "";
  major: typeof MAJOR[number] | "";
  budget_range: typeof BUDGET[number] | "";
};

const STEP_LABELS = ["만 나이", "최종 학력", "영어 수준 (IELTS)", "선호 지역", "전공 분야", "예산 (연간 학비)"];

export default function DiagnoseForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<FormData>({
    age: "", education: "", english_level: "", preferred_region: "", major: "", budget_range: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canNext = (() => {
    switch (step) {
      case 0: { const a = parseInt(data.age, 10); return Number.isFinite(a) && a >= 14 && a <= 70; }
      case 1: return data.education !== "";
      case 2: return data.english_level !== "";
      case 3: return data.preferred_region !== "";
      case 4: return data.major !== "";
      case 5: return data.budget_range !== "";
    }
  })();

  function next() { if (step < 5) setStep((s) => (s + 1) as Step); }
  function prev() { if (step > 0) setStep((s) => (s - 1) as Step); }

  async function submit() {
    setError(null);
    const payload = {
      age: parseInt(data.age, 10),
      education: data.education,
      english_level: data.english_level,
      preferred_region: data.preferred_region,
      major: data.major,
      budget_range: data.budget_range,
    };
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.uuid) {
        setError(json.error ?? "진단 처리 중 오류가 발생했습니다.");
        return;
      }
      startTransition(() => {
        router.push(`/diagnose/result/${encodeURIComponent(json.uuid)}`);
      });
    } catch {
      setError("네트워크 오류. 다시 시도해주세요.");
    }
  }

  return (
    <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-md sm:p-8">
      {/* Progress */}
      <div className="mb-6 flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`h-1 w-full rounded-full transition-colors ${
                i <= step ? "bg-gold-600" : "bg-cream-300"
              }`}
            />
            <span className={`hidden text-[10px] sm:block ${i === step ? "font-semibold text-navy-900" : "text-ink-500"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-2 text-xs font-bold tracking-wider text-gold-600">
        STEP {step + 1} / 6
      </div>
      <h3 className="mb-5 font-display text-xl font-semibold text-navy-900 sm:text-2xl">
        {STEP_LABELS[step]}
      </h3>

      {/* Step body */}
      <div className="min-h-[140px]">
        {step === 0 && (
          <input
            type="number"
            min={14}
            max={70}
            value={data.age}
            onChange={(e) => setData({ ...data, age: e.target.value })}
            placeholder="예: 23"
            className="w-full rounded-xl border-2 border-cream-300 bg-cream-100 px-4 py-3 text-lg text-navy-900 outline-none transition focus:border-gold-600"
          />
        )}
        {step === 1 && (
          <OptionGrid options={EDUCATION} value={data.education} onChange={(v) => setData({ ...data, education: v })} />
        )}
        {step === 2 && (
          <OptionGrid options={ENGLISH} value={data.english_level} onChange={(v) => setData({ ...data, english_level: v })} />
        )}
        {step === 3 && (
          <OptionGrid options={REGION} value={data.preferred_region} onChange={(v) => setData({ ...data, preferred_region: v })} />
        )}
        {step === 4 && (
          <OptionGrid options={MAJOR} value={data.major} onChange={(v) => setData({ ...data, major: v })} />
        )}
        {step === 5 && (
          <OptionGrid options={BUDGET} value={data.budget_range} onChange={(v) => setData({ ...data, budget_range: v })} />
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={prev}
          disabled={step === 0 || pending}
          className="rounded-xl border border-cream-300 px-5 py-2.5 text-sm font-medium text-ink-700 transition hover:border-navy-800 hover:text-navy-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← 이전
        </button>
        {step < 5 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className="rounded-xl bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음 →
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canNext || pending}
            className="rounded-xl bg-gold-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "진단 중..." : "🎯 결과 보기"}
          </button>
        )}
      </div>
    </div>
  );
}

function OptionGrid<T extends string>({ options, value, onChange }: {
  options: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-xl border-2 px-3 py-3 text-sm font-medium transition ${
            value === opt
              ? "border-gold-600 bg-gold-100 text-navy-900"
              : "border-cream-300 bg-white text-ink-700 hover:border-navy-800/40"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
