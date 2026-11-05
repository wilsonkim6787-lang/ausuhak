import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SERVICES, phaseColor } from "@/lib/crm/flows";
import { addDays, shortDate, todayKST, weekdayKo, whenKo, ymdParts } from "@/lib/crm/admin-util";
import { addNote, completeTask, deleteNote, toggleNotePin } from "@/lib/crm/admin-actions";
import { ActionForm, AutoCheck, Submit } from "@/components/admin/client";

type Task = { kind: "step" | "doc"; id: string; due: string; title: string; student: string; studentId: string; where: string; tag: string; color: string; bg: string };

export default async function AdminHome() {
  const { sb } = await requireAdmin();
  const today = todayKST();
  const week = addDays(today, 7);
  const monthStart = today.slice(0, 8) + "01";

  const [stuQ, caseQ, stepQ, docQ, noteQ, consultQ, msgQ] = await Promise.all([
    sb.from("crm_students").select("id, name_ko, family_id, status, created_at"),
    sb.from("crm_cases").select("id, student_id, service, title, status"),
    sb.from("crm_steps").select("id, case_id, phase, label, state, due_date").in("state", ["todo", "doing"]).not("due_date", "is", null).order("due_date").limit(60),
    sb.from("crm_documents").select("id, student_id, label, state, due_date").eq("direction", "from_family").in("state", ["requested", "redo"]).not("due_date", "is", null).order("due_date").limit(40),
    sb.from("crm_notes").select("id, body, pinned, created_at").is("student_id", null).order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(30),
    sb.from("consult_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    sb.from("crm_messages").select("id, family_id, author_id, body, created_at").eq("from_admin", false).eq("read_by_admin", false).order("created_at", { ascending: false }).limit(40),
  ]);

  const students = (stuQ.data ?? []) as { id: string; name_ko: string; family_id: string; status: string; created_at: string }[];
  const cases = (caseQ.data ?? []) as { id: string; student_id: string; service: string; title: string; status: string }[];
  const stuById = new Map(students.map((s) => [s.id, s]));
  const caseById = new Map(cases.map((c) => [c.id, c]));

  const tasks: Task[] = [];
  for (const s of (stepQ.data ?? []) as { id: string; case_id: string; phase: string; label: string; due_date: string }[]) {
    const c = caseById.get(s.case_id);
    if (!c || c.status !== "active") continue;
    const st = stuById.get(c.student_id);
    if (!st) continue;
    const color = phaseColor(c.service, s.phase);
    tasks.push({ kind: "step", id: s.id, due: s.due_date, title: s.label, student: st.name_ko, studentId: st.id, where: c.title, tag: s.phase || "단계", color, bg: color + "1A" });
  }
  for (const d of (docQ.data ?? []) as { id: string; student_id: string; label: string; state: string; due_date: string }[]) {
    const st = stuById.get(d.student_id);
    if (!st) continue;
    tasks.push({ kind: "doc", id: d.id, due: d.due_date, title: `${d.label} 받기`, student: st.name_ko, studentId: st.id, where: d.state === "redo" ? "다시 요청한 서류" : "요청한 서류", tag: "서류", color: "#8A5A1F", bg: "#FBF1E3" });
  }
  tasks.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
  const shownTasks = tasks.slice(0, 30);
  const dueSoon = tasks.filter((t) => t.due <= week);

  const activeStudents = students.filter((s) => s.status === "active");
  const newThisMonth = activeStudents.filter((s) => s.created_at.slice(0, 10) >= monthStart).length;

  const perService = SERVICES.map((sv) => {
    const ids = new Set(cases.filter((c) => c.service === sv.key && c.status === "active").map((c) => c.student_id));
    return { ...sv, n: ids.size };
  });
  const maxN = Math.max(1, ...perService.map((p) => p.n));

  // Unread messages, newest per family.
  const msgs = (msgQ.data ?? []) as { id: string; family_id: string; author_id: string | null; body: string; created_at: string }[];
  const authorIds = [...new Set(msgs.map((m) => m.author_id).filter((x): x is string => !!x))];
  const { data: authors } = authorIds.length
    ? await sb.from("crm_profiles").select("id, name, role, relation").in("id", authorIds)
    : { data: [] as { id: string; name: string; role: string; relation: string | null }[] };
  const authorById = new Map(((authors ?? []) as { id: string; name: string; role: string; relation: string | null }[]).map((a) => [a.id, a]));
  const firstStudentOfFamily = new Map<string, { id: string; name_ko: string }>();
  for (const s of students) if (!firstStudentOfFamily.has(s.family_id)) firstStudentOfFamily.set(s.family_id, s);
  const seenFam = new Set<string>();
  const threads = msgs.filter((m) => (seenFam.has(m.family_id) ? false : (seenFam.add(m.family_id), true)));
  let parents = 0;
  let kids = 0;
  for (const m of msgs) {
    const a = m.author_id ? authorById.get(m.author_id) : undefined;
    if (a?.role === "parent") parents++;
    else kids++;
  }
  function fromLabel(m: (typeof msgs)[number]) {
    const a = m.author_id ? authorById.get(m.author_id) : undefined;
    const st = firstStudentOfFamily.get(m.family_id);
    if (a?.role === "parent") return `${st?.name_ko ?? a.name} ${a.relation || "보호자"}`;
    return a?.name || st?.name_ko || "가족";
  }

  const notes = (noteQ.data ?? []) as { id: string; body: string; pinned: boolean; created_at: string }[];
  const { m, d } = ymdParts(today);

  return (
    <>
      <header className="ad-head">
        <div>
          <span className="ad-sub">{m}월 {d}일 {weekdayKo(today)}</span>
          <h1 className="ad-h1">오늘 할 일</h1>
        </div>
        <div className="ad-row">
          <form action="/admin/students" method="get" className="ad-search" role="search">
            <span>찾기</span>
            <input type="search" name="q" placeholder="학생 이름, 학교, 연락처" aria-label="학생 찾기" />
          </form>
          <Link href="/admin/students?add=1#add" className="ad-btn">학생 추가</Link>
        </div>
      </header>

      <section aria-label="요약" className="ad-stats">
        <Link href="/admin/students" className="ad-stat">
          <span>진행 중인 학생</span>
          <strong>{activeStudents.length}명</strong>
          <span style={{ color: "#1F6B5C" }}>이번 달 새로 시작 {newThisMonth}명</span>
        </Link>
        <a href="#deadlines" className="ad-stat">
          <span>7일 안 마감</span>
          <strong style={{ color: dueSoon.length ? "#9B2C3E" : undefined }}>{dueSoon.length}건</strong>
          <span>{tasks[0] ? `가장 가까운 마감 ${shortDate(tasks[0].due)}` : "잡힌 마감 없음"}</span>
        </a>
        <Link href="/admin/consults" className="ad-stat">
          <span>새 상담 신청</span>
          <strong>{consultQ.count ?? 0}건</strong>
          <span>24시간 안에 답장</span>
        </Link>
        <a href="#messages" className="ad-stat">
          <span>답장 기다리는 메시지</span>
          <strong>{msgs.length}건</strong>
          <span>학부모 {parents} · 학생 {kids}</span>
        </a>
      </section>

      <div className="ad-cols">
        <section id="deadlines" className="ad-card ad-grow" style={{ gap: 14 }}>
          <div className="ad-between">
            <h2 className="ad-h2">마감과 할 일</h2>
            <span className="ad-sub">끝낸 일은 체크하면 학생 기록에 남습니다</span>
          </div>
          <div>
            {shownTasks.length === 0 ? (
              <p className="ad-empty">마감일이 잡힌 할 일이 없습니다. 학생 화면의 단계에서 마감일을 넣으면 여기에 모입니다.</p>
            ) : (
              shownTasks.map((t) => {
                const urgent = t.due <= week;
                return (
                  <form key={t.kind + t.id} action={completeTask} className="ad-task">
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="kind" value={t.kind} />
                    <AutoCheck label={`${t.title} 완료`} />
                    <span className="ad-task-due" style={{ color: urgent ? "#9B2C3E" : "#4A5568" }}>
                      {t.due < today ? `지남 ${shortDate(t.due)}` : shortDate(t.due)}
                    </span>
                    <span className="ad-task-body">
                      <Link href={`/admin/students/${t.studentId}`}>{t.title}</Link>
                      <span className="ad-small ad-muted">{t.student} · {t.where}</span>
                    </span>
                    <span className="ad-badge wide" style={{ color: t.color, background: t.bg }}>{t.tag}</span>
                  </form>
                );
              })
            )}
          </div>
        </section>

        <div className="ad-side">
          <section aria-label="내 메모장" className="ad-memo">
            <div className="ad-between">
              <h2 className="ad-h2">내 메모장</h2>
              <span className="ad-memo-tag">학생·학부모에게 안 보임</span>
            </div>
            <ActionForm action={addNote} resetOnOk className="ad-form">
              <label className="full">새 메모
                <textarea name="body" rows={3} maxLength={4000} placeholder="예: 이번 주 UTS 담당자에게 2027 간호 정원 다시 묻기" />
              </label>
              <label className="ad-check"><input type="checkbox" name="pinned" />위에 고정</label>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><Submit>저장</Submit></div>
            </ActionForm>
            {notes.map((n) => (
              <div key={n.id} className="ad-memo-item">
                <span className="ad-pre">{n.body}</span>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }} className="ad-tiny">
                  <span>{n.pinned ? "고정 · " : ""}{whenKo(n.created_at)}</span>
                  <span style={{ display: "flex", gap: 12 }}>
                    <form action={toggleNotePin}>
                      <input type="hidden" name="id" value={n.id} />
                      <input type="hidden" name="pinned" value={n.pinned ? "0" : "1"} />
                      <button type="submit" className="ad-linkbtn gray">{n.pinned ? "고정 풀기" : "고정"}</button>
                    </form>
                    <form action={deleteNote}>
                      <input type="hidden" name="id" value={n.id} />
                      <Submit className="ad-linkbtn gray" confirm="이 메모를 지울까요?">지우기</Submit>
                    </form>
                  </span>
                </span>
              </div>
            ))}
          </section>

          <section className="ad-card">
            <h2 className="ad-h2">서비스별 학생</h2>
            {perService.map((p) => (
              <Link key={p.key} href={`/admin/students?svc=${p.key}`} className="ad-plain" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <b>{p.label}</b>
                  <span className="ad-muted">{p.n}명</span>
                </span>
                <span className="ad-bar"><span style={{ width: `${Math.round((p.n / maxN) * 100)}%`, background: p.color }} /></span>
              </Link>
            ))}
          </section>

          <section id="messages" className="ad-card" style={{ gap: 4 }}>
            <h2 className="ad-h2" style={{ marginBottom: 8 }}>답장 기다리는 메시지</h2>
            {threads.length === 0 ? <p className="ad-empty">답장할 메시지가 없습니다.</p> : null}
            {threads.slice(0, 8).map((m) => {
              const st = firstStudentOfFamily.get(m.family_id);
              return (
                <Link
                  key={m.id}
                  href={st ? `/admin/students/${st.id}?tab=msgs#tabs` : "/admin/students"}
                  className="ad-plain"
                  style={{ display: "flex", flexDirection: "column", gap: 3, padding: "12px 0", borderTop: "1px solid #EEF2F7" }}
                >
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14 }}>
                    <b>{fromLabel(m)}</b>
                    <span className="ad-muted ad-small">{whenKo(m.created_at)}</span>
                  </span>
                  <span style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.55 }}>
                    {m.body.length > 120 ? m.body.slice(0, 120) + "…" : m.body}
                  </span>
                </Link>
              );
            })}
          </section>
        </div>
      </div>
    </>
  );
}
