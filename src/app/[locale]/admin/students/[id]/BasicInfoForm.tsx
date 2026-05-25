"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateStudentBasicAction, type ActionState } from "./actions";

type Student = {
  id: string;
  name: string | null;
  kakao_id: string | null;
  phone: string | null;
  email: string | null;
  age: number | null;
  age_range: string | null;
  education: string | null;
  english_level: string | null;
  preferred_region: string | null;
  major: string | null;
  budget_range: string | null;
  is_medical: boolean | null;
  medical_pathway: string | null;
  source: string | null;
  anonymous_id: string | null;
  diagnose_uuid: string | null;
  scenario_matched: string | null;
  partner_ref: string | null;
  created_at: string;
  updated_at: string;
};

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
  ["direct", "Direct (의대 본 과정)"],
  ["undergrad", "학부 졸업 → 의대"],
  ["graduate", "대학원 → 의대"],
  ["converter", "전공 전환"],
  ["transfer", "편입"],
];

const initial: ActionState = {};

export default function BasicInfoForm({ student }: { student: Student }) {
  const [state, formAction, pending] = useActionState(updateStudentBasicAction, initial);
  const [isMedical, setIsMedical] = useState(!!student.is_medical);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="student_id" value={student.id} />

        {/* 연락처 */}
        <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-navy-900">연락처</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field name="name" label="이름" required defaultValue={student.name} />
            <Field name="kakao_id" label="카카오 ID" defaultValue={student.kakao_id} />
            <Field name="phone" label="전화" defaultValue={student.phone} />
            <Field name="email" label="이메일" type="email" defaultValue={student.email} />
          </div>
        </section>

        {/* 프로필 (전 "6변수 / FAQ 매칭 키") */}
        <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-navy-900">프로필</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field name="age" label="나이" type="number" defaultValue={student.age != null ? String(student.age) : null} />
            <Select name="education" label="학력" options={EDUCATIONS} defaultValue={student.education} />
            <Select name="english_level" label="영어 (IELTS)" options={ENGLISHES} defaultValue={student.english_level} />
            <Select name="preferred_region" label="선호 지역" options={REGIONS} defaultValue={student.preferred_region} />
            <Select name="major" label="전공" options={MAJORS} defaultValue={student.major} />
            <Select name="budget_range" label="예산" options={BUDGETS} defaultValue={student.budget_range} />
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
                defaultValue={student.medical_pathway}
              />
            </div>
          )}
        </section>

        {/* 진입 경로 */}
        <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-navy-900">진입 경로</h2>
          <div className="mt-4 sm:max-w-sm">
            <SelectKV name="source" label="알게 된 경로" options={SOURCES} defaultValue={student.source} />
          </div>
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
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "저장 중…" : "💾 기본 정보 저장"}
          </Button>
        </div>
      </form>

      {/* sidebar: 자동 매칭·시스템 정보 (읽기 전용) */}
      <aside className="flex flex-col gap-3 lg:sticky lg:top-4 lg:self-start">
        <section className="rounded-2xl border border-cream-300 bg-cream-100/60 p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">
            시스템 정보
          </h3>
          <dl className="mt-3 flex flex-col gap-2 text-xs">
            <SideRow k="자동 매칭 시나리오" v={student.scenario_matched} />
            <SideRow k="진단 결과 UUID" v={student.diagnose_uuid} />
            <SideRow k="익명 ID" v={student.anonymous_id} />
            <SideRow k="파트너 추천" v={student.partner_ref} />
            <SideRow k="등록일" v={new Date(student.created_at).toLocaleString("ko-KR")} />
            <SideRow k="최근 수정" v={new Date(student.updated_at).toLocaleString("ko-KR")} />
          </dl>
        </section>
      </aside>
    </div>
  );
}

function SideRow({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">{k}</dt>
      <dd className="break-all text-navy-900">
        {v?.trim() ? v : <span className="text-ink-300">—</span>}
      </dd>
    </div>
  );
}

function Field({
  name, label, required, defaultValue, type = "text",
}: {
  name: string; label: string; required?: boolean; defaultValue: string | null; type?: "text" | "email" | "number" | "tel";
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
        defaultValue={defaultValue ?? ""}
        className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
      />
    </label>
  );
}

function Select({
  name, label, options, defaultValue,
}: {
  name: string; label: string; options: string[]; defaultValue: string | null;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-navy-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
      >
        <option value="">— 선택 안 함 —</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function SelectKV({
  name, label, options, defaultValue,
}: {
  name: string; label: string; options: [string, string][]; defaultValue: string | null;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-navy-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
      >
        <option value="">— 선택 안 함 —</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

