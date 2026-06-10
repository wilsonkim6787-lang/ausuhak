"use client";

import { useActionState } from "react";
import { applyStaffGradeAction, type PermActionState } from "../actions";
import { STAFF_GRADES } from "@/lib/staff/grades";

const initial: PermActionState = {};

export default function GradeButtons({
  staffId,
  currentGrade,
}: {
  staffId: string;
  currentGrade: string | null; // 현재 등급 key, 또는 null(커스텀/권한없음)
}) {
  const [state, formAction, pending] = useActionState(applyStaffGradeAction, initial);

  return (
    <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-bold text-navy-900">🏅 등급 빠른 지정</h2>
        <p className="text-xs text-ink-500">
          등급을 누르면 권한이 한 번에 적용됩니다. 아래에서 개별 조정도 가능해요.
        </p>
      </div>

      <form action={formAction} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input type="hidden" name="staff_id" value={staffId} />
        {STAFF_GRADES.map((g) => {
          const active = currentGrade === g.key;
          return (
            <button
              key={g.key}
              type="submit"
              name="grade"
              value={g.key}
              disabled={pending}
              className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition disabled:opacity-50 ${
                active
                  ? "border-gold-600 bg-gold-100"
                  : "border-cream-300 bg-cream-100/40 hover:border-gold-600/50 hover:bg-cream-100"
              }`}
            >
              <span className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                {active && <span className="text-gold-600">✓</span>}
                {g.label}
                <span className="rounded-full bg-navy-900 px-1.5 py-0.5 text-[10px] font-semibold text-gold-400">
                  {g.perms.length}
                </span>
              </span>
              <span className="text-[11px] leading-snug text-ink-500">{g.desc}</span>
            </button>
          );
        })}
      </form>

      <div className="mt-3 text-xs">
        {state.error && (
          <span className="rounded-lg bg-error/10 px-2.5 py-1 text-error">{state.error}</span>
        )}
        {state.ok && !pending && (
          <span className="rounded-lg bg-success/10 px-2.5 py-1 text-success">✓ 등급 적용됨</span>
        )}
        {!state.error && !state.ok && currentGrade === null && (
          <span className="text-ink-500">현재 등급과 일치하지 않는 커스텀 권한입니다.</span>
        )}
      </div>
    </section>
  );
}
