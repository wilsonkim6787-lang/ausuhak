"use client";

import { updateLeadStatusAction } from "./progressActions";

const LEAD_STATUSES: [string, string][] = [
  ["lead", "Lead — 카톡 첫 접촉"],
  ["contacted", "Contacted — 6변수 수집·1차 상담"],
  ["pro", "PRO — PRO 결제 완료"],
  ["contract", "Contract — 학교 계약"],
  ["visa", "Visa — 비자 진행 중"],
  ["onsite", "Onsite — 호주 도착·학업"],
  ["pr", "PR — 영주권 취득 ⭐"],
];

// Lead Status (CRM 7단계) — Stage 는 sub-step 에서 자동 산출, Lead 만 수동.
export default function LeadStatusForm({
  studentId,
  leadStatus,
}: {
  studentId: string;
  leadStatus: string | null;
}) {
  return (
    <form
      action={updateLeadStatusAction}
      className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="student_id" value={studentId} />
      <h2 className="font-display text-base font-bold text-navy-900">
        Lead Status (CRM 7단계)
      </h2>
      <p className="mt-1 text-xs text-ink-500">
        영업·CRM 큰 단계. (Stage 는 위 sub-step 상태에서 자동 계산됩니다.)
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {LEAD_STATUSES.map(([v, l]) => (
          <label
            key={v}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm transition hover:bg-cream-100 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-100"
          >
            <input
              type="radio"
              name="lead_status"
              value={v}
              defaultChecked={(leadStatus ?? "lead") === v}
              className="size-4 accent-gold-600"
            />
            <span className="text-navy-700">{l}</span>
          </label>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Lead 저장
        </button>
      </div>
    </form>
  );
}
