import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { buttonStyles } from "@/components/ui/Button";
import StudentAvatar from "@/components/admin/StudentAvatar";
import StudentFilters from "./StudentFilters";
import KanbanBoard, { type KanbanStudent } from "./kanban/KanbanBoard";
import {
  CARE_RULES,
  evaluateCareRules,
  type StudentForCare,
} from "@/lib/care/rules";

// 헬퍼 분리: react-hooks/purity 규칙은 컴포넌트 본문 안의 Date.now/new Date를 막음.
function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
}
function isoStartOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

type SP = {
  q?: string;
  stage?: string;
  lead_status?: string;
  is_medical?: string;
  filter?: string; // 대시보드에서 넘어오는 단축 필터
  view?: "list" | "kanban";
};

type StudentRow = {
  id: string;
  name: string | null;
  age_range: string | null;
  education: string | null;
  major: string | null;
  preferred_region: string | null;
  current_stage: number;
  lead_status: string | null;
  is_medical: boolean | null;
  wilson_alerts: string[] | null;
  kakao_id: string | null;
  source: string | null;
  photo_path: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export default async function StudentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SP>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const view: "list" | "kanban" = sp.view === "kanban" ? "kanban" : "list";

  const supabase = await createClient();
  let query = supabase
    .from("students")
    .select(
      "id, name, age_range, education, major, preferred_region, current_stage, lead_status, is_medical, wilson_alerts, kakao_id, source, photo_path, user_id, created_at, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(view === "kanban" ? 500 : 200);

  if (sp.q) {
    const q = `%${sp.q.replace(/[%_]/g, "")}%`;
    query = query.or(
      `name.ilike.${q},kakao_id.ilike.${q},email.ilike.${q},phone.ilike.${q}`,
    );
  }
  if (sp.stage && sp.stage !== "all") {
    query = query.eq("current_stage", parseInt(sp.stage, 10));
  }
  if (sp.lead_status && sp.lead_status !== "all") {
    query = query.eq("lead_status", sp.lead_status);
  }
  if (sp.is_medical === "true") {
    query = query.eq("is_medical", true);
  } else if (sp.is_medical === "false") {
    query = query.eq("is_medical", false);
  }

  if (sp.filter === "alerts") {
    query = query.not("wilson_alerts", "is", null);
  } else if (sp.filter === "stuck_14d") {
    query = query
      .lt("updated_at", isoDaysAgo(14))
      .not("lead_status", "in", "(pr,lead)");
  } else if (sp.filter === "new_today") {
    query = query.gte("created_at", isoStartOfToday());
  }

  const { data, error } = await query;
  const students = (data ?? []) as StudentRow[];

  // 마지막 메모 1줄 + 다음 deadline 1개 fetch
  const studentIds = students.map((s) => s.id);
  const [notesRes, deadlinesRes] = await Promise.all([
    studentIds.length === 0
      ? { data: [] as { student_id: string; content: string; created_at: string }[] }
      : supabase
          .from("student_notes")
          .select("student_id, content, created_at")
          .in("student_id", studentIds)
          .is("hidden_at", null)
          .order("created_at", { ascending: false })
          .limit(2000),
    studentIds.length === 0
      ? { data: [] as { student_id: string; deadline_type: string; deadline_date: string }[] }
      : supabase
          .from("critical_deadlines")
          .select("student_id, deadline_type, deadline_date")
          .in("student_id", studentIds)
          .neq("status", "completed")
          .gte("deadline_date", new Date().toISOString().slice(0, 10))
          .order("deadline_date", { ascending: true }),
  ]);

  const noteByStudent = new Map<string, string>();
  for (const n of notesRes.data ?? []) {
    if (!noteByStudent.has(n.student_id)) {
      noteByStudent.set(n.student_id, n.content.replace(/\s+/g, " ").slice(0, 60));
    }
  }
  const deadlineByStudent = new Map<string, { type: string; date: string }>();
  for (const d of deadlinesRes.data ?? []) {
    if (!deadlineByStudent.has(d.student_id)) {
      deadlineByStudent.set(d.student_id, {
        type: d.deadline_type,
        date: d.deadline_date,
      });
    }
  }

  // ─── 칸반 view 용 추가 데이터: care rule 평가 ──────────────
  const careHitsByStudent = new Map<
    string,
    { rule_id: string; title: string; emoji: string; days_since: number | null }[]
  >();

  if (view === "kanban" && studentIds.length > 0) {
    const userIds = students
      .map((s) => s.user_id)
      .filter((v): v is string => !!v);
    const [docsRes, visasRes, usersRes] = await Promise.all([
      supabase
        .from("documents")
        .select("student_id, created_at")
        .in("student_id", studentIds)
        .order("created_at", { ascending: false })
        .limit(5000),
      supabase
        .from("visa_cases")
        .select("student_id, submitted_at")
        .in("student_id", studentIds)
        .eq("status", "submitted")
        .not("submitted_at", "is", null),
      userIds.length === 0
        ? { data: [] as { id: string; last_login_at: string | null }[] }
        : supabase
            .from("users")
            .select("id, last_login_at")
            .in("id", userIds),
    ]);

    const latestDocByStudent = new Map<string, string>();
    for (const d of (docsRes.data ?? []) as { student_id: string; created_at: string }[]) {
      if (!latestDocByStudent.has(d.student_id)) {
        latestDocByStudent.set(d.student_id, d.created_at);
      }
    }
    const visaByStudent = new Map<string, string>();
    for (const v of (visasRes.data ?? []) as { student_id: string; submitted_at: string | null }[]) {
      if (v.submitted_at && !visaByStudent.has(v.student_id)) {
        visaByStudent.set(v.student_id, v.submitted_at);
      }
    }
    const lastLoginByUser = new Map<string, string | null>();
    for (const u of usersRes.data ?? []) {
      lastLoginByUser.set(u.id, u.last_login_at);
    }

    const studentsForCare: StudentForCare[] = students.map((s) => ({
      id: s.id,
      name: s.name,
      kakao_id: s.kakao_id,
      current_stage: s.current_stage,
      lead_status: s.lead_status,
      updated_at: s.updated_at,
      user_id: s.user_id,
      photo_path: s.photo_path,
      users: s.user_id ? { last_login_at: lastLoginByUser.get(s.user_id) ?? null } : null,
      latest_document_at: latestDocByStudent.get(s.id) ?? null,
      visa_submitted_at: visaByStudent.get(s.id) ?? null,
    }));

    const hits = evaluateCareRules(studentsForCare);
    for (const h of hits) {
      const rule = CARE_RULES.find((r) => r.id === h.rule_id);
      if (!rule) continue;
      const arr = careHitsByStudent.get(h.student_id) ?? [];
      arr.push({
        rule_id: h.rule_id,
        title: rule.title,
        emoji: rule.emoji,
        days_since: h.days_since,
      });
      careHitsByStudent.set(h.student_id, arr);
    }
  }

  // KanbanStudent enriched
  const kanbanStudents: KanbanStudent[] = students.map((s) => {
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
      last_note: note ?? null,
      next_deadline: dl ?? null,
      photo_path: s.photo_path,
      care_hits: careHitsByStudent.get(s.id) ?? [],
    };
  });

  // view 토글 link
  function buildViewLink(target: "list" | "kanban"): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k === "view" || !v) continue;
      params.set(k, String(v));
    }
    if (target === "kanban") params.set("view", "kanban");
    return params.toString()
      ? `/admin/students?${params.toString()}`
      : "/admin/students";
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            관리자 · Phase 1
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
            📊 학생 관리
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            총 {students.length}명{students.length === (view === "kanban" ? 500 : 200) ? ` (최대 ${view === "kanban" ? 500 : 200}건)` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start">
          {/* view 토글 */}
          <div className="flex overflow-hidden rounded-full border border-cream-300 bg-white">
            <Link
              href={buildViewLink("list")}
              className={`px-3 py-2 text-xs font-semibold transition ${
                view === "list"
                  ? "bg-navy-900 text-white"
                  : "text-navy-700 hover:bg-cream-100"
              }`}
            >
              📊 리스트
            </Link>
            <Link
              href={buildViewLink("kanban")}
              className={`px-3 py-2 text-xs font-semibold transition ${
                view === "kanban"
                  ? "bg-navy-900 text-white"
                  : "text-navy-700 hover:bg-cream-100"
              }`}
            >
              📋 칸반
            </Link>
          </div>
          <Link href="/admin/students/new" className={buttonStyles()}>
            + 신규 학생
          </Link>
        </div>
      </header>

      <StudentFilters initial={sp} />

      {error && (
        <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          로드 실패: {error.message}
        </div>
      )}

      {view === "kanban" ? (
        students.length === 0 ? (
          <EmptyState />
        ) : (
          <KanbanBoard students={kanbanStudents} />
        )
      ) : students.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-2">
          {students.map((s) => (
            <li key={s.id}>
              <StudentRowCard
                student={s}
                lastNote={noteByStudent.get(s.id) ?? null}
                nextDeadline={deadlineByStudent.get(s.id) ?? null}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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

function StudentRowCard({
  student: s,
  lastNote,
  nextDeadline,
}: {
  student: StudentRow;
  lastNote: string | null;
  nextDeadline: { type: string; date: string } | null;
}) {
  const summary = [s.age_range, s.education, s.major, s.preferred_region]
    .filter(Boolean)
    .join(" / ");
  const displayName = s.name?.trim() ? s.name : "이름 미입력";
  const hasAlerts = (s.wilson_alerts?.length ?? 0) > 0;
  const dlDays = nextDeadline ? daysUntil(nextDeadline.date) : null;
  const dlLabel = nextDeadline
    ? DEADLINE_LABEL[nextDeadline.type] ?? nextDeadline.type
    : null;

  return (
    <Link
      href={`/admin/students/${s.id}`}
      className="flex gap-3 rounded-xl border border-cream-300 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <StudentAvatar name={s.name} photoPath={s.photo_path} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`font-display text-base font-bold ${s.name ? "text-navy-900" : "text-ink-500"}`}>
              {displayName}
            </span>
            {s.is_medical && (
              <span className="rounded-full bg-error/15 px-2 py-0.5 text-[10px] font-semibold text-error">
                🩺 의대
              </span>
            )}
            {hasAlerts && (
              <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold text-gold-600">
                🚨 Alert {s.wilson_alerts!.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-[10px] font-semibold text-gold-500">
              Stage {s.current_stage}
            </span>
            <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[10px] font-medium text-navy-700">
              {s.lead_status ?? "lead"}
            </span>
          </div>
        </div>
        {summary && (
          <p className="mt-1.5 text-xs text-ink-500">{summary}</p>
        )}
        {(lastNote || nextDeadline) && (
          <div className="mt-2 flex flex-col gap-1">
            {lastNote && (
              <p className="text-xs text-ink-700 line-clamp-1">💬 {lastNote}</p>
            )}
            {nextDeadline && (
              <p
                className={`text-xs font-semibold ${
                  dlDays != null && dlDays <= 3
                    ? "text-error"
                    : dlDays != null && dlDays <= 7
                      ? "text-gold-600"
                      : "text-navy-700"
                }`}
              >
                ⏰ {dlLabel} · {nextDeadline.date}
                {dlDays != null && ` (D-${dlDays})`}
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center">
      <p className="text-4xl">📭</p>
      <p className="mt-3 font-display text-lg font-bold text-navy-900">
        학생이 없습니다
      </p>
      <p className="mt-1 text-sm text-ink-500">
        진단 폼을 통해 자동 생성되거나, 우측 상단 [+ 신규 학생]으로 직접 등록할 수 있어요.
      </p>
      <Link href="/admin/students/new" className={`${buttonStyles()} mt-5`}>
        + 첫 학생 등록하기
      </Link>
    </div>
  );
}
