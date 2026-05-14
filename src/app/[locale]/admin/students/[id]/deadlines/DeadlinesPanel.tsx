"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import {
  addDeadlineAction,
  completeDeadlineAction,
  deleteDeadlineAction,
  type ActionState,
} from "../actions";

export type DeadlineRow = {
  id: string;
  deadline_type: string;
  deadline_date: string;
  status: string | null;
  note: string | null;
  created_at: string;
};

// PART D-3 deadline_type 9개
const TYPES: [string, string][] = [
  ["offer_acceptance", "Offer 수락 마감"],
  ["tuition",          "학비 송금"],
  ["coe",              "CoE 발급"],
  ["visa",             "비자 신청"],
  ["oshc",             "OSHC 가입"],
  ["isat_test",        "ISAT 시험 (의대)"],
  ["mmi_interview",    "MMI 인터뷰 (의대)"],
  ["gamsat",           "GAMSAT 시험"],
  ["departure",        "출국"],
];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(TYPES);

const initial: ActionState = {};

// 날짜 계산 (KST 기준 D-N)
function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / (24 * 3600 * 1000));
}

function bucketOf(d: DeadlineRow): "completed" | "past" | "d1" | "d7" | "upcoming" {
  if (d.status === "completed") return "completed";
  const n = daysUntil(d.deadline_date);
  if (n < 0) return "past";
  if (n <= 1) return "d1";
  if (n <= 7) return "d7";
  return "upcoming";
}

export default function DeadlinesPanel({
  studentId,
  deadlines,
}: {
  studentId: string;
  deadlines: DeadlineRow[];
}) {
  const [state, formAction, pending] = useActionState(addDeadlineAction, initial);

  const buckets: Record<string, DeadlineRow[]> = {
    d1: [], d7: [], upcoming: [], past: [], completed: [],
  };
  deadlines.forEach((d) => buckets[bucketOf(d)].push(d));

  return (
    <div className="flex flex-col gap-5">
      {/* + 마감일 추가 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">+ 마감일 추가</h2>
        <form action={formAction} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="student_id" value={studentId} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">유형</span>
              <select
                name="deadline_type"
                required
                className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
              >
                <option value="">— 선택 —</option>
                {TYPES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">날짜</span>
              <input
                type="date"
                name="deadline_date"
                required
                className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">메모</span>
            <input
              type="text"
              name="note"
              placeholder="예: UniSA Offer 수락 마감"
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
            />
          </label>
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
              {pending ? "추가 중…" : "+ 추가"}
            </Button>
          </div>
        </form>
      </section>

      {/* 그룹별 표시 */}
      <Group label="🔴 D-1 (긴급)" rows={buckets.d1} studentId={studentId} variant="urgent" />
      <Group label="🟡 D-7 (이번 주)" rows={buckets.d7} studentId={studentId} variant="warn" />
      <Group label="⚪ 향후 예정" rows={buckets.upcoming} studentId={studentId} variant="info" />
      {buckets.past.length > 0 && (
        <Group label="⏰ 지난 마감 (미처리)" rows={buckets.past} studentId={studentId} variant="urgent" />
      )}
      {buckets.completed.length > 0 && (
        <Group label="✅ 완료" rows={buckets.completed} studentId={studentId} variant="done" />
      )}
    </div>
  );
}

function Group({
  label, rows, studentId, variant,
}: {
  label: string;
  rows: DeadlineRow[];
  studentId: string;
  variant: "urgent" | "warn" | "info" | "done";
}) {
  if (rows.length === 0) return null;
  const borderCls =
    variant === "urgent" ? "border-error/30 bg-error/5" :
    variant === "warn"   ? "border-gold-400/40 bg-gold-100/40" :
    variant === "done"   ? "border-cream-300 bg-cream-100/50 opacity-70" :
                           "border-cream-300 bg-white";
  return (
    <section className={`rounded-2xl border ${borderCls} p-5 shadow-sm`}>
      <h3 className="font-display text-sm font-bold text-navy-900">
        {label} ({rows.length})
      </h3>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map((d) => {
          const n = daysUntil(d.deadline_date);
          const dayLabel = n === 0 ? "D-day" : n > 0 ? `D-${n}` : `D+${Math.abs(n)}`;
          return (
            <li key={d.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-white px-3 py-2">
              <div>
                <span className="font-semibold text-navy-900">
                  {TYPE_LABEL[d.deadline_type] ?? d.deadline_type}
                </span>
                <span className="ml-2 text-[11px] text-ink-500">
                  {new Date(d.deadline_date).toLocaleDateString("ko-KR")}
                </span>
                <span className="ml-2 rounded bg-navy-900 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {dayLabel}
                </span>
                {d.note && <span className="ml-2 text-xs text-ink-700">— {d.note}</span>}
              </div>
              <div className="flex items-center gap-2">
                {d.status !== "completed" && (
                  <form action={completeDeadlineAction}>
                    <input type="hidden" name="deadline_id" value={d.id} />
                    <input type="hidden" name="student_id" value={studentId} />
                    <button
                      type="submit"
                      className="rounded-md bg-success px-2 py-1 text-[11px] font-semibold text-white hover:opacity-90"
                    >
                      완료
                    </button>
                  </form>
                )}
                <form action={deleteDeadlineAction}>
                  <input type="hidden" name="deadline_id" value={d.id} />
                  <input type="hidden" name="student_id" value={studentId} />
                  <button
                    type="submit"
                    className="text-[11px] text-ink-500 underline hover:text-error"
                  >
                    삭제
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
