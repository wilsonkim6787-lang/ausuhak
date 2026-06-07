"use client";

import { useState } from "react";
import {
  PHASES,
  phaseIsComplete,
  currentPhaseIndex,
  type SubstepStatus,
} from "@/lib/progress";
import { getMyDocumentDownloadUrl } from "@/app/[locale]/mypage/actions";

export type DocItem = {
  id: string;
  doc_type: string;
  original_filename: string | null;
  hasFile: boolean;
  isStaff: boolean;
};

// 5 phase 아코디언. 완료=접힘 / 현재=펼침(기본) / 예정=접힘·회색. 헤더 탭 = 토글.
export default function PhaseAccordion({
  statusMap,
  docsBySubstep,
}: {
  statusMap: Record<string, SubstepStatus>;
  docsBySubstep: Record<string, DocItem[]>;
}) {
  const curIdx = currentPhaseIndex(statusMap);
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set([PHASES[curIdx]?.key].filter(Boolean) as string[]),
  );

  const toggle = (key: string) =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      {PHASES.map((phase, i) => {
        const complete = phaseIsComplete(phase, statusMap);
        const current = i === curIdx;
        const future = i > curIdx && !complete;
        const open = openKeys.has(phase.key);

        return (
          <section
            key={phase.key}
            className={`overflow-hidden rounded-2xl border shadow-sm ${
              current
                ? "border-navy-900/20 bg-white"
                : complete
                  ? "border-cream-300 bg-white"
                  : "border-cream-300 bg-cream-100/60"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(phase.key)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <span
                className={
                  current
                    ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white"
                    : complete
                      ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-white"
                      : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-200 text-xs font-semibold text-ink-400"
                }
              >
                {complete ? "✓" : i + 1}
              </span>

              <span className="flex flex-1 items-baseline gap-2">
                <span
                  className={`font-display text-base font-bold ${
                    future ? "text-ink-400" : "text-navy-900"
                  }`}
                >
                  {phase.label}
                </span>
                {complete && (
                  <span className="text-xs font-semibold text-gold-600">완료</span>
                )}
                {current && (
                  <span className="text-xs font-semibold text-navy-700">진행 중</span>
                )}
                {future && <span className="text-xs text-ink-400">예정</span>}
              </span>

              <span className="shrink-0 text-ink-400">{open ? "⌃" : "⌄"}</span>
            </button>

            {open && (
              <ul className="flex flex-col gap-2.5 border-t border-cream-200 px-4 py-4">
                {phase.substeps.map((sub) => {
                  const st = statusMap[sub.key] ?? "pending";
                  const docs = docsBySubstep[sub.key] ?? [];
                  const staffDocs = docs.filter((d) => d.isStaff && d.hasFile);
                  const studentDocs = docs.filter((d) => !d.isStaff && d.hasFile);

                  return (
                    <li key={sub.key} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2.5">
                        <StatusIcon status={st} />
                        <span
                          className={`text-sm ${
                            st === "done"
                              ? "text-navy-700"
                              : st === "in_progress"
                                ? "font-semibold text-navy-900"
                                : "text-ink-400"
                          }`}
                        >
                          {sub.label}
                        </span>
                        {st === "in_progress" && (
                          <span className="text-[11px] font-semibold text-gold-600">
                            진행 중
                          </span>
                        )}
                      </div>

                      {/* 첨부 영역 (sub-step 별) */}
                      {(sub.staffDoc || sub.collectsStudentDocs) && (
                        <div className="ml-7 flex flex-col gap-1.5">
                          {/* staff 제공 서류 ("받음") */}
                          {sub.staffDoc &&
                            (staffDocs.length > 0 ? (
                              staffDocs.map((d) => (
                                <DownloadRow key={d.id} doc={d} />
                              ))
                            ) : (
                              <p className="rounded-lg border border-dashed border-cream-300 bg-cream-100/50 px-3 py-1.5 text-[11px] text-ink-400">
                                {sub.staffDoc.label} — 승인 시 여기에 첨부됩니다
                              </p>
                            ))}

                          {/* 학생 제출 서류 ("올림") */}
                          {sub.collectsStudentDocs &&
                            studentDocs.map((d) => (
                              <div
                                key={d.id}
                                className="flex items-center gap-2 rounded-lg border border-gold-400/40 bg-gold-100/60 px-3 py-1.5 text-[11px]"
                              >
                                <span className="rounded-full bg-gold-500 px-1.5 py-0.5 font-bold text-white">
                                  올림
                                </span>
                                <span className="truncate text-navy-800">
                                  {d.original_filename ?? "파일"}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StatusIcon({ status }: { status: SubstepStatus }) {
  if (status === "done") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-[11px] font-bold text-white">
        ✓
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gold-500 bg-white">
        <span className="h-2 w-2 rounded-full bg-gold-500" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-cream-100">
      <span className="h-1.5 w-1.5 rounded-full bg-cream-300" />
    </span>
  );
}

function DownloadRow({ doc }: { doc: DocItem }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await getMyDocumentDownloadUrl(doc.id);
      if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-navy-900/15 bg-navy-900/5 px-3 py-1.5 text-[11px] transition hover:bg-navy-900/10 disabled:opacity-60"
    >
      <span className="rounded-full bg-navy-900 px-1.5 py-0.5 font-bold text-white">받음</span>
      <span className="truncate text-navy-800">{doc.original_filename ?? "파일"}</span>
      <span className="ml-auto font-semibold text-navy-700">
        {loading ? "여는 중…" : "다운로드 ↓"}
      </span>
    </button>
  );
}
