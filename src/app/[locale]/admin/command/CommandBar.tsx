"use client";

import { useActionState } from "react";
import { applyTextCommand, applyStageCommand, type CommandState } from "./actions";

// 명령어 한 줄 입력(기본) + 드롭다운(인식 실패 시 fallback).
export default function CommandBar({
  students,
  actions,
}: {
  students: { id: string; name: string }[];
  actions: { stage_key: string; label: string }[];
}) {
  const [textState, textAction, textPending] = useActionState(
    applyTextCommand,
    {} as CommandState,
  );
  const [pickState, pickAction, pickPending] = useActionState(
    applyStageCommand,
    {} as CommandState,
  );

  const state = textState.ok || textState.error ? textState : pickState;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-l-4 border-gold-500 bg-white p-5 shadow-sm">
      {/* 명령어 한 줄 입력 */}
      <form action={textAction} className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold text-ink-500">명령어</label>
        <div className="flex gap-2">
          <input
            type="text"
            name="command"
            autoComplete="off"
            placeholder="예: 김민지 비자 신청 / 김민지 견적서 발송"
            className="flex-1 rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm text-navy-900 outline-none focus:border-gold-500"
          />
          <button
            type="submit"
            disabled={textPending}
            className="shrink-0 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:opacity-60"
          >
            {textPending ? "반영 중…" : "반영"}
          </button>
        </div>
        <p className="text-[11px] text-ink-500">
          학생 이름 + 단계를 한 줄로 치면 자동으로 인식·반영합니다. 마이페이지에 즉시 표시.
        </p>
      </form>

      {/* 결과 */}
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

      {/* fallback: 드롭다운 직접 선택 */}
      <details className="rounded-lg border border-cream-200">
        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-ink-500">
          인식이 안 되면 직접 선택 ▾
        </summary>
        <form action={pickAction} className="flex flex-wrap items-end gap-2 border-t border-cream-200 p-3">
          <select
            name="student_id"
            required
            defaultValue=""
            className="flex-1 rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900"
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
          <select
            name="stage_key"
            required
            defaultValue=""
            className="flex-1 rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900"
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
          <button
            type="submit"
            disabled={pickPending}
            className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-900 disabled:opacity-60"
          >
            {pickPending ? "반영 중…" : "반영"}
          </button>
        </form>
      </details>
    </div>
  );
}
