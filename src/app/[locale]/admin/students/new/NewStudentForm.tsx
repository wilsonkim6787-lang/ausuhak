"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  createStudentAction,
  type CreateStudentState,
} from "../actions";

const EDUCATIONS = ["검정고시", "고졸", "대학재학", "대졸", "워홀러"];
const ENGLISHES = ["없음", "4.0-5.0", "5.5", "6.0", "6.5", "7.0+"];
const REGIONS = ["시드니", "멜번", "브리즈번", "골드코스트", "퍼스", "애들레이드", "호바트", "캔버라", "추천받기"];
const MAJORS = ["간호", "IT", "비즈니스", "공학", "요리·호텔", "유아교육", "디자인", "Trade", "의료", "미정"];
const BUDGETS = ["$25-35K", "$35-50K", "$50-65K", "$65-80K", "$80K+"];
const SOURCES: [string, string][] = [
  ["kakao_direct", "카카오 직접"],
  ["web_diagnose", "웹 진단"],
  ["medical_page", "의대 페이지"],
  ["partner_referral", "파트너 추천"],
];
const MEDICAL_PATHWAYS: [string, string][] = [
  ["direct", "Direct (의대 직진)"],
  ["undergrad", "학부 졸업 → 의대"],
  ["graduate", "대학원 → 의대"],
  ["converter", "전공 전환"],
  ["transfer", "편입"],
];

const initial: CreateStudentState = {};

export default function NewStudentForm() {
  const [state, formAction, pending] = useActionState(createStudentAction, initial);
  const [isMedical, setIsMedical] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* 연락처 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">연락처</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field name="name" label="이름" required placeholder="예: 김민지" />
          <Field name="kakao_id" label="카카오 ID / 이름" placeholder="채널 user_id 또는 메모" />
          <Field name="phone" label="전화" placeholder="010-1234-5678" />
          <Field name="email" label="이메일" type="email" placeholder="student@example.com" />
        </div>
      </section>

      {/* 6변수 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          6변수 (FAQ 매칭 키)
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          비워두면 진단 단계에서 추후 자동 채워짐. 알려진 정보만 입력해도 OK.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field name="age" label="나이" type="number" placeholder="예: 27" />
          <Select name="education" label="학력" options={EDUCATIONS} />
          <Select name="english_level" label="영어 (IELTS)" options={ENGLISHES} />
          <Select name="preferred_region" label="선호 지역" options={REGIONS} />
          <Select name="major" label="전공" options={MAJORS} />
          <Select name="budget_range" label="예산" options={BUDGETS} />
        </div>
      </section>

      {/* 의대 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">의대 여부</h2>
        <label className="mt-3 flex items-center gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            name="is_medical"
            checked={isMedical}
            onChange={(e) => setIsMedical(e.target.checked)}
            className="size-4 rounded border-cream-300"
          />
          🩺 이 학생은 의대 학생입니다 (Wilson 직접 응대)
        </label>

        {isMedical && (
          <div className="mt-4 sm:max-w-sm">
            <SelectKV
              name="medical_pathway"
              label="의대 진입 경로"
              options={MEDICAL_PATHWAYS}
            />
          </div>
        )}
      </section>

      {/* 진입 경로 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">진입 경로</h2>
        <div className="mt-4 sm:max-w-sm">
          <SelectKV name="source" label="어떤 경로로 알게 됐는지" options={SOURCES} defaultValue="kakao_direct" />
        </div>
      </section>

      {/* 액션 */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-cream-300 bg-white p-4 shadow-md">
        <div className="text-xs">
          {state.error && (
            <span className="rounded-lg bg-error/10 px-2.5 py-1 text-error">
              {state.error}
            </span>
          )}
          {!state.error && (
            <span className="text-ink-500">저장하면 학생 상세 페이지로 이동합니다.</span>
          )}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중…" : "💾 등록"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  required = false,
  placeholder,
  type = "text",
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: "text" | "email" | "number" | "tel";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-navy-700">
        {label} {required && <span className="text-error">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-navy-700">{label}</span>
      <select
        name={name}
        defaultValue=""
        className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
      >
        <option value="">— 선택 안 함 —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function SelectKV({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  options: [string, string][];
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-navy-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
      >
        {!defaultValue && <option value="">— 선택 안 함 —</option>}
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
