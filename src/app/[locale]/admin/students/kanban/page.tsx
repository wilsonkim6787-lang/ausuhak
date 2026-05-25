// /admin/students/kanban — Wilson 칸반 보드.
// 메인 5컬럼 (lead/contacted/pro/contract/visa) + 끝 컬럼 "수속 완료" (onsite+pr).
// 드래그 = lead_status 변경 / logActivity update_student 자동.
// admin/layout 이 super_admin 가드.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import KanbanBoard, { type KanbanStudent } from "./KanbanBoard";

type SP = { q?: string; medical?: string; alerts?: string; stuck?: string };

type StudentRow = {
  id: string;
  name: string | null;
  current_stage: number;
  lead_status: string | null;
  is_medical: boolean | null;
  wilson_alerts: string[] | null;
  kakao_id: string | null;
  age_range: string | null;
  major: string | null;
  photo_path: string | null;
  updated_at: string;
};

type NoteRow = { student_id: string; content: string; created_at: string };
type DeadlineRow = { student_id: string; deadline_type: string; deadline_date: string };

function daysAgoIso(n: number): string {
  return new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();
}

export default async function KanbanPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SP>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();

  let studentQuery = supabase
    .from("students")
    .select(
      "id, name, current_stage, lead_status, is_medical, wilson_alerts, kakao_id, age_range, major, photo_path, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(500);

  if (sp.q) {
    const q = `%${sp.q.replace(/[%_]/g, "")}%`;
    studentQuery = studentQuery.ilike("name", q);
  }
  if (sp.medical === "true") studentQuery = studentQuery.eq("is_medical", true);
  if (sp.alerts === "true") studentQuery = studentQuery.not("wilson_alerts", "is", null);
  if (sp.stuck === "true") {
    studentQuery = studentQuery.lt("updated_at", daysAgoIso(14));
  }

  const { data: studentsData, error } = await studentQuery;
  const students = ((studentsData ?? []) as StudentRow[]).filter(
    (s) => s.lead_status !== null,
  );

  // 메모 — 최근 hidden_at IS NULL
  const studentIds = students.map((s) => s.id);
  const [notesRes, deadlinesRes] = await Promise.all([
    studentIds.length === 0
      ? { data: [] as NoteRow[] }
      : supabase
          .from("student_notes")
          .select("student_id, content, created_at")
          .in("student_id", studentIds)
          .is("hidden_at", null)
          .order("created_at", { ascending: false })
          .limit(2000),
    studentIds.length === 0
      ? { data: [] as DeadlineRow[] }
      : supabase
          .from("critical_deadlines")
          .select("student_id, deadline_type, deadline_date")
          .in("student_id", studentIds)
          .neq("status", "completed")
          .gte("deadline_date", new Date().toISOString().slice(0, 10))
          .order("deadline_date", { ascending: true }),
  ]);

  const notes = (notesRes.data ?? []) as NoteRow[];
  const deadlines = (deadlinesRes.data ?? []) as DeadlineRow[];

  // group: 학생당 최근 메모 1줄 / 가장 가까운 deadline 1개
  const noteByStudent = new Map<string, NoteRow>();
  for (const n of notes) {
    if (!noteByStudent.has(n.student_id)) noteByStudent.set(n.student_id, n);
  }
  const deadlineByStudent = new Map<string, DeadlineRow>();
  for (const d of deadlines) {
    if (!deadlineByStudent.has(d.student_id)) deadlineByStudent.set(d.student_id, d);
  }

  const enriched: KanbanStudent[] = students.map((s) => {
    const note = noteByStudent.get(s.id);
    const dl = deadlineByStudent.get(s.id);
    return {
      id: s.id,
      name: s.name?.trim() || "이름 미입력",
      lead_status: s.lead_status ?? "lead",
      current_stage: s.current_stage,
      is_medical: !!s.is_medical,
      alert_count: s.wilson_alerts?.length ?? 0,
      summary: [s.age_range, s.major].filter(Boolean).join(" / "),
      last_note: note?.content?.replace(/\s+/g, " ").slice(0, 60) ?? null,
      next_deadline: dl
        ? { type: dl.deadline_type, date: dl.deadline_date }
        : null,
      photo_path: s.photo_path,
    };
  });

  // 카운트
  const activeCount = enriched.filter((s) =>
    ["lead", "contacted", "pro", "contract", "visa"].includes(s.lead_status),
  ).length;
  const completedCount = enriched.filter((s) =>
    ["onsite", "pr"].includes(s.lead_status),
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            관리자 · 칸반
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
            📋 학생 칸반
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            진행 중 {activeCount}명 · 수속 완료 {completedCount}명
            {students.length === 500 ? " (최대 500건)" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/students"
            className="rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-cream-100"
          >
            📊 리스트 뷰
          </Link>
          <Link
            href="/admin/students/new"
            className="rounded-full bg-gold-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gold-500"
          >
            + 신규 학생
          </Link>
        </div>
      </header>

      <KanbanFilters initial={sp} />

      {error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          로드 실패: {error.message}
        </p>
      )}

      <KanbanBoard students={enriched} />
    </div>
  );
}

function KanbanFilters({ initial }: { initial: SP }) {
  const chip = (key: keyof SP, value: string, label: string) => {
    const active = initial[key] === value;
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(initial)) {
      if (k !== key && v) next.set(k, v);
    }
    if (!active) next.set(key, value);
    const href = `/admin/students/kanban${next.toString() ? `?${next.toString()}` : ""}`;
    return (
      <Link
        key={`${key}-${value}`}
        href={href}
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
          active
            ? "border-navy-900 bg-navy-900 text-white"
            : "border-cream-300 bg-white text-navy-700 hover:bg-cream-100"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
      <form action="/admin/students/kanban" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={initial.q ?? ""}
          placeholder="이름·카카오·이메일·전화 검색"
          className="flex-1 rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
        />
        {Object.entries(initial).map(([k, v]) =>
          k !== "q" && v ? <input key={k} type="hidden" name={k} value={v} /> : null,
        )}
        <button
          type="submit"
          className="rounded-lg bg-navy-900 px-4 text-xs font-semibold text-white hover:bg-navy-700"
        >
          검색
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {chip("medical", "true", "🩺 의대만")}
        {chip("alerts", "true", "🚨 Alert 있는 학생만")}
        {chip("stuck", "true", "⏱️ 14일+ 정체")}
      </div>
    </div>
  );
}
