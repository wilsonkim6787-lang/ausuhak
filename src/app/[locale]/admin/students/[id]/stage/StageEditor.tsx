"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateStudentStageAction, type ActionState } from "../actions";

// PART B-1: Stage 12단계 (의대도 동일).
const STAGES: { n: number; label: string; hint: string }[] = [
  { n: 1,  label: "카톡 1차 상담 30분",        hint: "신규 Lead → 6변수 자동 수집" },
  { n: 2,  label: "결제 (PRO ₩50,000)",        hint: "Wilson 입금 확인 → confirmed" },
  { n: 3,  label: "1:1 상담 + 견적서",          hint: "Zoom or 오프라인 / 학교 1~3개 견적" },
  { n: 4,  label: "학교 선정 + 다중 지원",       hint: "3~5개 동시 application 권장" },
  { n: 5,  label: "영어 준비",                  hint: "IELTS / ELICOS / PTE" },
  { n: 6,  label: "학생 서류 수집",             hint: "여권 / 학력 / GS / 재정" },
  { n: 7,  label: "학교 지원 (Application)",    hint: "공식 제출 → applied" },
  { n: 8,  label: "Offer Letter ⭐",            hint: "수락·거절 결정 + CoE 발급" },
  { n: 9,  label: "학비 송금 + CoE",            hint: "1차 학비 + COE 발급 완료" },
  { n: 10, label: "학생비자 500 신청",          hint: "GS + 재정 → DHA 제출" },
  { n: 11, label: "출국 준비",                  hint: "항공권 / 보험 / 정착지" },
  { n: 12, label: "호주 도착 + 학업",           hint: "OSHC / 통장 / 첫 학기" },
];

const LEAD_STATUSES: [string, string][] = [
  ["lead",      "Lead — 카톡 첫 접촉"],
  ["contacted", "Contacted — 6변수 수집·1차 상담"],
  ["pro",       "PRO — PRO 결제 완료"],
  ["contract",  "Contract — 학교 계약"],
  ["visa",      "Visa — 비자 진행 중"],
  ["onsite",    "Onsite — 호주 도착·학업"],
  ["pr",        "PR — 영주권 취득 ⭐"],
];

const initial: ActionState = {};

export default function StageEditor({
  studentId,
  currentStage,
  leadStatus,
  graduatedAt,
  updatedAt,
}: {
  studentId: string;
  currentStage: number;
  leadStatus: string | null;
  graduatedAt: string | null;
  updatedAt: string;
}) {
  const [state, formAction, pending] = useActionState(updateStudentStageAction, initial);
  const [stage, setStage] = useState(currentStage);
  const [lead, setLead] = useState(leadStatus ?? "lead");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="student_id" value={studentId} />

      {/* Stage 12 시각화 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-base font-bold text-navy-900">
            Stage 진행 (현재 = {stage})
          </h2>
          <span className="text-xs text-ink-500">
            최근 수정: {new Date(updatedAt).toLocaleString("ko-KR")}
          </span>
        </div>

        <ol className="mt-5 flex flex-col gap-2">
          {STAGES.map((s) => {
            const done = s.n < stage;
            const active = s.n === stage;
            return (
              <li key={s.n}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    active
                      ? "border-gold-500 bg-gold-100"
                      : done
                        ? "border-cream-300 bg-cream-100/50 text-ink-500"
                        : "border-cream-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="current_stage"
                    value={s.n}
                    checked={stage === s.n}
                    onChange={() => setStage(s.n)}
                    className="mt-1 size-4 accent-gold-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-display text-sm font-bold ${active ? "text-gold-600" : "text-navy-900"}`}>
                        {done ? "✅" : active ? "▶️" : "⬜"} {s.n}. {s.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-ink-500">{s.hint}</p>
                  </div>
                </label>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Lead Status */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          Lead Status (CRM 7단계)
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Stage는 액션 단위, Lead Status는 영업·CRM 큰 단계 (둘 다 별도 관리).
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {LEAD_STATUSES.map(([v, l]) => (
            <label
              key={v}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                lead === v ? "border-gold-500 bg-gold-100" : "border-cream-300 bg-white hover:bg-cream-100"
              }`}
            >
              <input
                type="radio"
                name="lead_status"
                value={v}
                checked={lead === v}
                onChange={() => setLead(v)}
                className="size-4 accent-gold-600"
              />
              <span className={lead === v ? "font-semibold text-navy-900" : "text-navy-700"}>{l}</span>
            </label>
          ))}
        </div>
      </section>

      {graduatedAt && (
        <section className="rounded-2xl border border-gold-400/40 bg-gold-100 p-4 text-sm">
          🎓 졸업 완료: {new Date(graduatedAt).toLocaleString("ko-KR")}
        </section>
      )}

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
          {pending ? "저장 중…" : "💾 Stage 저장"}
        </Button>
      </div>
    </form>
  );
}
