"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateLeadStatusAction } from "./actions";

export type KanbanStudent = {
  id: string;
  name: string;
  lead_status: string;
  current_stage: number;
  is_medical: boolean;
  alert_count: number;
  summary: string;
  last_note: string | null;
  next_deadline: { type: string; date: string } | null;
};

// 메인 active 5컬럼.
const ACTIVE_COLUMNS: { key: string; label: string; emoji: string }[] = [
  { key: "lead",      label: "리드",     emoji: "🆕" },
  { key: "contacted", label: "연락 완료", emoji: "📞" },
  { key: "pro",       label: "상담 진행", emoji: "💬" },
  { key: "contract",  label: "계약",     emoji: "✍️" },
  { key: "visa",      label: "비자",     emoji: "📋" },
];

const COMPLETED_KEYS = ["onsite", "pr"];

// 학생용/내부용 변환은 admin 측이라 내부 키 그대로 보이는 게 더 명확.
const DEADLINE_LABEL: Record<string, string> = {
  offer_acceptance: "Offer 수락",
  tuition:          "학비 입금",
  visa:             "비자",
  coe:              "CoE",
  oshc:             "OSHC",
  isat_test:        "ISAT",
  mmi_interview:    "MMI",
  gamsat:           "GAMSAT",
  departure:        "출국",
};

function daysUntil(iso: string): number {
  const target = new Date(iso);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (24 * 3600 * 1000));
}

export default function KanbanBoard({ students }: { students: KanbanStudent[] }) {
  const [local, setLocal] = useState(students);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [, startTransition] = useTransition();

  const byStatus = (status: string) => local.filter((s) => s.lead_status === status);
  const completedStudents = local.filter((s) => COMPLETED_KEYS.includes(s.lead_status));

  function onDragStart(e: React.DragEvent<HTMLDivElement>, id: string) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }
  function onDragOver(e: React.DragEvent<HTMLDivElement>, col: string) {
    e.preventDefault();
    if (overCol !== col) setOverCol(col);
  }
  function onDragLeave() {
    setOverCol(null);
  }
  async function onDrop(e: React.DragEvent<HTMLDivElement>, newStatus: string) {
    e.preventDefault();
    setOverCol(null);
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    if (!id) return;

    const prevStudent = local.find((s) => s.id === id);
    if (!prevStudent || prevStudent.lead_status === newStatus) return;

    // optimistic
    setLocal((p) =>
      p.map((s) => (s.id === id ? { ...s, lead_status: newStatus } : s)),
    );

    startTransition(async () => {
      const res = await updateLeadStatusAction(id, newStatus);
      if (res.error) {
        // rollback
        setLocal((p) =>
          p.map((s) =>
            s.id === id ? { ...s, lead_status: prevStudent.lead_status } : s,
          ),
        );
        alert(`저장 실패: ${res.error}`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5 xl:gap-4">
        {ACTIVE_COLUMNS.map((col) => {
          const items = byStatus(col.key);
          const isOver = overCol === col.key;
          return (
            <div
              key={col.key}
              onDragOver={(e) => onDragOver(e, col.key)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, col.key)}
              className={`flex flex-col rounded-2xl border bg-cream-100/40 p-3 transition ${
                isOver ? "border-gold-500 bg-gold-100/40" : "border-cream-300"
              }`}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-navy-900">
                  {col.emoji} {col.label}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-navy-700">
                  {items.length}
                </span>
              </div>
              <ul className="flex flex-col gap-2 min-h-[80px]">
                {items.map((s) => (
                  <li key={s.id}>
                    <StudentCard
                      student={s}
                      onDragStart={(e) => onDragStart(e, s.id)}
                      dragging={draggingId === s.id}
                    />
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="rounded-lg border border-dashed border-cream-300 px-2 py-3 text-center text-[11px] text-ink-400">
                    카드 끌어다 놓기
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {/* 수속 완료 (onsite + pr) — 토글 펼침 */}
      <div className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowCompleted((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="text-sm font-semibold text-navy-900">
            ✈️ 수속 완료 (onsite + pr)
            <span className="ml-2 rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-white">
              {completedStudents.length}
            </span>
          </span>
          <span className="text-xs text-ink-500">{showCompleted ? "접기 ▲" : "펼치기 ▼"}</span>
        </button>

        {showCompleted && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {COMPLETED_KEYS.map((key) => {
              const items = byStatus(key);
              const isOver = overCol === key;
              const label = key === "onsite" ? "🛬 호주 도착" : "🇦🇺 영주권";
              return (
                <div
                  key={key}
                  onDragOver={(e) => onDragOver(e, key)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, key)}
                  className={`flex flex-col rounded-xl border bg-cream-100/40 p-3 transition ${
                    isOver ? "border-gold-500 bg-gold-100/40" : "border-cream-300"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-navy-900">{label}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-navy-700">
                      {items.length}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2 min-h-[60px]">
                    {items.map((s) => (
                      <li key={s.id}>
                        <StudentCard
                          student={s}
                          onDragStart={(e) => onDragStart(e, s.id)}
                          dragging={draggingId === s.id}
                        />
                      </li>
                    ))}
                    {items.length === 0 && (
                      <li className="rounded-lg border border-dashed border-cream-300 px-2 py-3 text-center text-[11px] text-ink-400">
                        카드 끌어다 놓기
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentCard({
  student,
  onDragStart,
  dragging,
}: {
  student: KanbanStudent;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  dragging: boolean;
}) {
  const dl = student.next_deadline;
  const dlDays = dl ? daysUntil(dl.date) : null;
  const dlLabel = dl ? DEADLINE_LABEL[dl.type] ?? dl.type : null;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`group relative rounded-xl border bg-white p-3 shadow-sm transition ${
        dragging ? "opacity-40" : "hover:shadow-md"
      }`}
    >
      <Link
        href={`/admin/students/${student.id}`}
        className="absolute inset-0 z-0"
        aria-label={`${student.name} 상세`}
      />
      <div className="relative z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-sm font-bold text-navy-900 truncate">
            {student.name}
          </span>
          <span className="rounded-full bg-navy-900 px-1.5 py-0.5 text-[9px] font-bold text-gold-400 shrink-0">
            S{student.current_stage}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {student.is_medical && (
            <span className="rounded-full bg-error/15 px-1.5 py-0.5 text-[9px] font-semibold text-error">
              🩺
            </span>
          )}
          {student.alert_count > 0 && (
            <span className="rounded-full bg-gold-100 px-1.5 py-0.5 text-[9px] font-semibold text-gold-600">
              🚨 {student.alert_count}
            </span>
          )}
          {student.summary && (
            <span className="text-[10px] text-ink-500 truncate">{student.summary}</span>
          )}
        </div>
        {student.last_note && (
          <p className="text-[11px] text-ink-700 line-clamp-2">
            💬 {student.last_note}
          </p>
        )}
        {dl && (
          <p
            className={`text-[11px] font-semibold ${
              dlDays != null && dlDays <= 3
                ? "text-error"
                : dlDays != null && dlDays <= 7
                  ? "text-gold-600"
                  : "text-navy-700"
            }`}
          >
            ⏰ {dlLabel} · {dl.date}
            {dlDays != null && ` (D-${dlDays})`}
          </p>
        )}
      </div>
    </div>
  );
}
