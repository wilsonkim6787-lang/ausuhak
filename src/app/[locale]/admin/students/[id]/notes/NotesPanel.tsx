"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { addNoteAction, hideNoteAction, type ActionState } from "../actions";

type Note = {
  id: string;
  visibility: "shared_with_assigned" | "wilson_only";
  content: string;
  tags: string[] | null;
  created_at: string;
  hidden_at: string | null;
  author_id: string | null;
};

const initial: ActionState = {};

export default function NotesPanel({
  studentId,
  notes,
}: {
  studentId: string;
  notes: Note[];
}) {
  const [state, formAction, pending] = useActionState(addNoteAction, initial);
  const [visibility, setVisibility] = useState<"shared_with_assigned" | "wilson_only">(
    "shared_with_assigned",
  );

  const shared = notes.filter((n) => n.visibility === "shared_with_assigned");
  const wilsonOnly = notes.filter((n) => n.visibility === "wilson_only");

  return (
    <div className="flex flex-col gap-5">
      {/* 새 메모 작성 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">+ 새 메모</h2>
        <form action={formAction} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="student_id" value={studentId} />

          <div className="flex flex-wrap gap-2">
            <VisibilityRadio
              value="shared_with_assigned"
              label="🟡 공유 메모 (Wilson + 담당 직원)"
              current={visibility}
              onChange={setVisibility}
            />
            <VisibilityRadio
              value="wilson_only"
              label="🔴 Wilson 전용 (직원 절대 X)"
              current={visibility}
              onChange={setVisibility}
            />
          </div>

          <textarea
            name="content"
            required
            rows={4}
            placeholder={
              visibility === "wilson_only"
                ? "직원에게도 보이지 않습니다. 가족 갈등·Failure Pattern 의심 등 민감 정보."
                : "공유 메모 — 담당 직원도 보입니다. 상담 요약·다음 액션·위험 신호."
            }
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
          />

          <input
            type="text"
            name="tags"
            placeholder="태그 (쉼표로 구분): 상담, 위험, 가족, 성격, 기타"
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-xs text-navy-900 outline-none focus:border-gold-500"
          />

          <div className="flex items-center justify-between">
            <div className="text-xs">
              {state.error && (
                <span className="rounded-lg bg-error/10 px-2.5 py-1 text-error">{state.error}</span>
              )}
              {state.ok && !pending && (
                <span className="rounded-lg bg-success/10 px-2.5 py-1 text-success">✓ 추가됨</span>
              )}
            </div>
            <Button type="submit" disabled={pending} size="sm">
              {pending ? "저장 중…" : "메모 추가"}
            </Button>
          </div>
        </form>
      </section>

      {/* 🟡 공유 메모 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          🟡 공유 메모 ({shared.length})
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Wilson + 담당 직원이 볼 수 있는 메모. 상담 요약·위험 신호·다음 액션.
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {shared.length === 0 ? (
            <EmptyNote label="공유 메모 없음" />
          ) : (
            shared.map((n) => (
              <NoteItem key={n.id} note={n} studentId={studentId} accent="yellow" />
            ))
          )}
        </ul>
      </section>

      {/* 🔴 Wilson 전용 */}
      <section className="rounded-2xl border border-error/30 bg-error/5 p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          🔴 Wilson 전용 메모 ({wilsonOnly.length})
        </h2>
        <p className="mt-1 text-xs text-error">
          ⚠️ 직원에게 절대 노출되지 않습니다 (RLS 차단). 활동 로그 기록 대상 (Phase 3).
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {wilsonOnly.length === 0 ? (
            <EmptyNote label="Wilson 전용 메모 없음" />
          ) : (
            wilsonOnly.map((n) => (
              <NoteItem key={n.id} note={n} studentId={studentId} accent="red" />
            ))
          )}
        </ul>
      </section>
    </div>
  );
}

function VisibilityRadio({
  value, label, current, onChange,
}: {
  value: "shared_with_assigned" | "wilson_only";
  label: string;
  current: string;
  onChange: (v: "shared_with_assigned" | "wilson_only") => void;
}) {
  const active = current === value;
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? value === "wilson_only"
            ? "border-error bg-error/10 font-semibold text-error"
            : "border-gold-500 bg-gold-100 font-semibold text-navy-900"
          : "border-cream-300 bg-white text-navy-700 hover:bg-cream-100"
      }`}
    >
      <input
        type="radio"
        name="visibility"
        value={value}
        checked={active}
        onChange={() => onChange(value)}
        className="size-3 accent-gold-600"
      />
      {label}
    </label>
  );
}

function NoteItem({
  note: n,
  studentId,
  accent,
}: {
  note: Note;
  studentId: string;
  accent: "yellow" | "red";
}) {
  const accentClass = accent === "red"
    ? "border-error/30 bg-white"
    : "border-gold-400/40 bg-cream-100/50";

  return (
    <li className={`rounded-xl border p-4 ${accentClass}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] text-ink-500">
          {new Date(n.created_at).toLocaleString("ko-KR")}
        </span>
        <form action={hideNoteAction}>
          <input type="hidden" name="note_id" value={n.id} />
          <input type="hidden" name="student_id" value={studentId} />
          <button
            type="submit"
            className="text-[11px] text-ink-500 underline hover:text-error"
            aria-label="메모 숨기기"
          >
            숨김
          </button>
        </form>
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm text-navy-900">{n.content}</p>
      {n.tags && n.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {n.tags.map((t) => (
            <span key={t} className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] text-navy-700">
              #{t}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

function EmptyNote({ label }: { label: string }) {
  return (
    <li className="rounded-xl border-2 border-dashed border-cream-300 p-4 text-center text-xs text-ink-500">
      {label}
    </li>
  );
}
