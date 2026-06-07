"use client";

import { useActionState } from "react";
import { applyStageCommand, type CommandState } from "./actions";

// 구조화 입력 명령창: 학생 선택 + 단계 선택 → 반영 + 발송 대기.
export default function CommandBar({
  students,
  actions,
}: {
  students: { id: string; name: string }[];
  actions: { stage_key: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    applyStageCommand,
    {} as CommandState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border-l-4 border-gold-500 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-[11px] font-semibold text-ink-500">학생</span>
          <select
            name="student_id"
            required
            defaultValue=""
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900"
          >
            <option value="" disabled>
              학생 선택
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-[11px] font-semibold text-ink-500">단계</span>
          <select
            name="stage_key"
            required
            defaultValue=""
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900"
          >
            <option value="" disabled>
              단계 선택
            </option>
            {actions.map((a) => (
              <option key={a.stage_key} value={a.stage_key}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-navy-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
        >
          {pending ? "반영 중…" : "반영 + 발송 대기"}
        </button>
      </div>

      {state.ok && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
          ✓ {state.ok}
        </p>
      )}
      {state.error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm font-medium text-error">
          {state.error}
        </p>
      )}
      <p className="text-[11px] text-ink-500">
        단계를 반영하면 학생 마이페이지에 즉시 표시되고, 카톡 문구가 아래 “발송 대기”에 쌓입니다.
        (알림톡 자동 발송은 사업자등록 후 활성화)
      </p>
    </form>
  );
}
