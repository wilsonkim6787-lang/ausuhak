"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  addApplicationAction,
  updateApplicationStatusAction,
  deleteApplicationAction,
  type ActionState,
} from "../actions";

type Application = {
  id: string;
  school_id: string | null;
  program: string | null;
  status: string | null;
  applied_at: string | null;
  offer_received_at: string | null;
  notes: string | null;
  created_at: string;
  schools: { name: string | null; city: string | null; state: string | null } | null;
};

type SchoolOpt = { id: string; name: string; type: string | null; city: string | null };

const STATUSES: [string, string][] = [
  ["preparing", "preparing"],
  ["applied", "applied"],
  ["offer_received", "offer_received ⭐"],
  ["accepted", "accepted"],
  ["rejected", "rejected"],
  ["withdrawn", "withdrawn"],
];

const initial: ActionState = {};

export default function ApplicationsPanel({
  studentId,
  applications,
  schools,
}: {
  studentId: string;
  applications: Application[];
  schools: SchoolOpt[];
}) {
  const [state, formAction, pending] = useActionState(addApplicationAction, initial);
  const [schoolFilter, setSchoolFilter] = useState("");

  const filteredSchools = schoolFilter.trim()
    ? schools.filter((s) =>
        s.name.toLowerCase().includes(schoolFilter.toLowerCase()) ||
        (s.city ?? "").toLowerCase().includes(schoolFilter.toLowerCase()),
      ).slice(0, 50)
    : schools.slice(0, 50);

  return (
    <div className="flex flex-col gap-5">
      {/* + 신규 학교 지원 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">+ 학교 지원 추가</h2>
        <form action={formAction} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="student_id" value={studentId} />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">학교 검색 (학교명 / 도시)</span>
            <input
              type="search"
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              placeholder="UTS / Sydney / Diploma ..."
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">학교 (검색 결과 최대 50개)</span>
            <select
              name="school_id"
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
            >
              <option value="">— 선택 안 함 (프로그램만 입력 가능) —</option>
              {filteredSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.city ? `(${s.city})` : ""} · {s.type ?? ""}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">프로그램·전공</span>
              <input
                type="text"
                name="program"
                placeholder="Master of Nursing"
                className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">상태</span>
              <select
                name="status"
                defaultValue="preparing"
                className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
              >
                {STATUSES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">지원일 (옵션)</span>
              <input
                type="date"
                name="applied_at"
                className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
              />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-semibold text-navy-700">메모</span>
              <input
                type="text"
                name="notes"
                placeholder="Wilson 내부 메모"
                className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
              />
            </label>
          </div>

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
              {pending ? "추가 중…" : "+ 지원 추가"}
            </Button>
          </div>
        </form>
      </section>

      {/* 지원 리스트 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          학교 지원 현황 ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="mt-4 rounded-xl border-2 border-dashed border-cream-300 p-6 text-center text-sm text-ink-500">
            아직 지원한 학교가 없습니다. 위에서 추가하세요.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {applications.map((a) => (
              <li key={a.id} className="rounded-xl border border-cream-300 bg-cream-100/50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-display text-sm font-bold text-navy-900">
                      {a.schools?.name ?? "(학교 미선택)"}
                      {a.schools?.city && <span className="ml-2 text-[11px] text-ink-500">{a.schools.city}</span>}
                    </p>
                    {a.program && (
                      <p className="text-xs text-ink-700">{a.program}</p>
                    )}
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div className="mt-2 text-[11px] text-ink-500">
                  {a.applied_at && <>지원: {new Date(a.applied_at).toLocaleDateString("ko-KR")} </>}
                  {a.offer_received_at && (
                    <span className="ml-2 rounded bg-gold-100 px-1.5 text-gold-600">
                      ⭐ Offer: {new Date(a.offer_received_at).toLocaleDateString("ko-KR")}
                    </span>
                  )}
                </div>

                {a.notes && <p className="mt-1 text-xs text-navy-700">{a.notes}</p>}

                {/* 액션 (status 변경 + 삭제) */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <form action={updateApplicationStatusAction} className="flex items-center gap-1">
                    <input type="hidden" name="application_id" value={a.id} />
                    <input type="hidden" name="student_id" value={studentId} />
                    <select
                      name="status"
                      defaultValue={a.status ?? "preparing"}
                      className="rounded-md border border-cream-300 bg-white px-2 py-1 text-[11px] text-navy-900"
                    >
                      {STATUSES.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-md bg-navy-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-navy-800"
                    >
                      상태 변경
                    </button>
                  </form>
                  <form action={deleteApplicationAction}>
                    <input type="hidden" name="application_id" value={a.id} />
                    <input type="hidden" name="student_id" value={studentId} />
                    <button
                      type="submit"
                      className="text-[11px] text-ink-500 underline hover:text-error"
                      aria-label="지원 삭제"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const c =
    status === "offer_received" ? "bg-gold-100 text-gold-600" :
    status === "accepted"       ? "bg-success/15 text-success" :
    status === "rejected"       ? "bg-error/15 text-error" :
    status === "withdrawn"      ? "bg-ink-300/30 text-ink-500" :
    status === "applied"        ? "bg-navy-900 text-white" :
                                  "bg-cream-200 text-navy-700";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${c}`}>
      {status ?? "preparing"}
    </span>
  );
}
