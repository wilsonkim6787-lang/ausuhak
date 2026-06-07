"use client";

import { useState } from "react";
import {
  PHASES,
  currentPhaseIndex,
  phaseIsComplete,
  type Phase,
  type SubstepStatus,
} from "@/lib/progress";
import {
  updateSubstepStatusAction,
  uploadSubstepDocAction,
  deleteSubstepDocAction,
  getStudentDocDownloadUrl,
} from "./progressActions";

export type AdminDocItem = {
  id: string;
  doc_type: string;
  original_filename: string | null;
  hasFile: boolean;
  isStaff: boolean;
};

const STATUS_OPTIONS: [SubstepStatus, string][] = [
  ["pending", "예정"],
  ["in_progress", "진행중"],
  ["done", "완료"],
];

const ACCEPT_MIME =
  "application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.jpg,.jpeg,.png,.docx";

// admin/담당직원 — 5 phase × sub-step 상태 제어 + staff 서류 업로드 + 학생 서류 조회.
// BLOCK 4: 완료 phase 접힘(✓) / 현재 phase 펼침 / 미래 phase 회색.
export default function ProgressControl({
  studentId,
  statusMap,
  docsBySubstep,
}: {
  studentId: string;
  statusMap: Record<string, SubstepStatus>;
  docsBySubstep: Record<string, AdminDocItem[]>;
}) {
  const curPhaseIdx = currentPhaseIndex(statusMap);
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set([PHASES[curPhaseIdx]?.key].filter(Boolean) as string[]),
  );
  const toggle = (key: string) =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-base font-bold text-navy-900">진행 단계</h2>
        <span className="text-xs text-ink-500">
          상태 변경 시 학생 화면·단계 자동 반영
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {PHASES.map((phase, i) => (
          <PhaseBlock
            key={phase.key}
            phase={phase}
            index={i}
            complete={phaseIsComplete(phase, statusMap)}
            isCurrent={i === curPhaseIdx}
            isFuture={i > curPhaseIdx}
            open={openKeys.has(phase.key)}
            onToggle={() => toggle(phase.key)}
          >
            <ul className="flex flex-col divide-y divide-cream-200 rounded-xl border border-cream-300">
              {phase.substeps.map((sub) => {
                const docs = docsBySubstep[sub.key] ?? [];
                const staffDoc = docs.find((d) => d.isStaff && d.hasFile);
                const studentDocs = docs.filter((d) => !d.isStaff && d.hasFile);

                return (
                  <li key={sub.key} className="flex flex-col gap-2 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-navy-900">{sub.label}</span>
                      <form action={updateSubstepStatusAction}>
                        <input type="hidden" name="student_id" value={studentId} />
                        <input type="hidden" name="substep_key" value={sub.key} />
                        <select
                          name="status"
                          defaultValue={statusMap[sub.key] ?? "pending"}
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                          className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs text-navy-900"
                        >
                          {STATUS_OPTIONS.map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </form>
                    </div>

                    {/* staff 제공 서류 슬롯 */}
                    {sub.staffDoc && (
                      <div className="ml-1 flex flex-col gap-1.5">
                        {staffDoc ? (
                          <div className="flex items-center gap-2 rounded-md border border-navy-900/15 bg-navy-900/5 px-2.5 py-1.5 text-[11px]">
                            <span className="rounded-full bg-navy-900 px-1.5 py-0.5 font-bold text-white">
                              제공됨
                            </span>
                            <span className="truncate text-navy-800">
                              {staffDoc.original_filename ?? sub.staffDoc.label}
                            </span>
                            <span className="ml-auto flex items-center gap-2">
                              <DownloadBtn studentId={studentId} doc={staffDoc} />
                              <DeleteDocForm studentId={studentId} docId={staffDoc.id} />
                            </span>
                          </div>
                        ) : (
                          <form
                            action={uploadSubstepDocAction}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <input type="hidden" name="student_id" value={studentId} />
                            <input type="hidden" name="substep_key" value={sub.key} />
                            <input type="hidden" name="doc_type" value={sub.staffDoc.docType} />
                            <span className="text-[11px] text-ink-500">
                              {sub.staffDoc.label} 올리기:
                            </span>
                            <input
                              type="file"
                              name="file"
                              accept={ACCEPT_MIME}
                              required
                              className="text-[11px] file:mr-2 file:rounded file:border-0 file:bg-navy-900 file:px-2 file:py-1 file:text-[11px] file:font-semibold file:text-gold-400"
                            />
                            <button
                              type="submit"
                              className="rounded-md bg-gold-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-gold-500"
                            >
                              올리기
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* 학생 제출 서류 (조회·다운로드) */}
                    {studentDocs.length > 0 && (
                      <div className="ml-1 flex flex-col gap-1.5">
                        {studentDocs.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center gap-2 rounded-md border border-gold-400/40 bg-gold-100/50 px-2.5 py-1.5 text-[11px]"
                          >
                            <span className="rounded-full bg-gold-500 px-1.5 py-0.5 font-bold text-white">
                              학생 제출
                            </span>
                            <span className="truncate text-navy-800">
                              {d.original_filename ?? d.doc_type}
                            </span>
                            <span className="ml-auto">
                              <DownloadBtn studentId={studentId} doc={d} />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </PhaseBlock>
        ))}
      </div>
    </section>
  );
}

function PhaseBlock({
  phase,
  index,
  complete,
  isCurrent,
  isFuture,
  open,
  onToggle,
  children,
}: {
  phase: Phase;
  index: number;
  complete: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={isFuture && !open ? "opacity-55" : ""}>
      <button
        type="button"
        onClick={onToggle}
        className="mb-2 flex w-full items-center gap-2 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
          {index + 1}. {phase.label}
        </span>
        {complete ? (
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
            ✓ 완료
          </span>
        ) : isCurrent ? (
          <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-white">
            진행 중
          </span>
        ) : (
          <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium text-ink-500">
            예정
          </span>
        )}
        <span className="ml-auto text-[11px] text-ink-500">{open ? "▴ 접기" : "▾ 펼치기"}</span>
      </button>
      {open && children}
    </div>
  );
}

function DownloadBtn({
  studentId,
  doc,
}: {
  studentId: string;
  doc: AdminDocItem;
}) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    setLoading(true);
    try {
      const res = await getStudentDocDownloadUrl(studentId, doc.id);
      if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className="font-semibold text-navy-700 hover:text-gold-600 disabled:opacity-60"
    >
      {loading ? "여는 중…" : "다운로드 ↓"}
    </button>
  );
}

function DeleteDocForm({ studentId, docId }: { studentId: string; docId: string }) {
  return (
    <form
      action={deleteSubstepDocAction}
      onSubmit={(e) => {
        if (!confirm("이 서류를 삭제할까요? 되돌릴 수 없습니다.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="student_id" value={studentId} />
      <input type="hidden" name="doc_id" value={docId} />
      <button type="submit" className="text-error hover:underline">
        삭제
      </button>
    </form>
  );
}
