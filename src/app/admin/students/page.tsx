import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { FLOWS, SERVICES, serviceOf, type Service } from "@/lib/crm/flows";
import { EDUCATION, STUDENT_STATUS, addDays, ageOn, caseProgress, shortDate, todayKST, whenKo, type StepLite } from "@/lib/crm/admin-util";
import { addStudent } from "@/lib/crm/admin-actions";
import { AddStudentResult, Submit } from "@/components/admin/client";

type Search = { svc?: string; view?: string; q?: string; add?: string; done?: string };

type Row = {
  studentId: string;
  caseId: string | null;
  name: string;
  edu: string;
  minor: boolean;
  service: Service | null;
  target: string;
  phase: string;
  phaseColor: string;
  step: string;
  pct: number;
  due: string;
  urgent: boolean;
  last: string;
  caseStatus: string;
};

export default async function StudentsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const { sb } = await requireAdmin();
  const svc = (["study", "language", "visa", "other"] as const).find((s) => s === sp.svc) ?? "all";
  const showDone = sp.done === "1";
  const board = svc !== "all" && sp.view !== "list";
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 60);
  const today = todayKST();
  const week = addDays(today, 7);

  const [stuQ, caseQ, stepQ, enrQ, msgQ] = await Promise.all([
    sb.from("crm_students").select("id, family_id, name_ko, name_en, phone, email, education, status, birth_date").order("created_at", { ascending: false }),
    sb.from("crm_cases").select("id, student_id, service, title, status, visa_subclass").order("created_at"),
    sb.from("crm_steps").select("id, case_id, seq, phase, label, state, due_date"),
    sb.from("crm_enrolments").select("case_id, provider, course"),
    sb.from("crm_messages").select("family_id, created_at").order("created_at", { ascending: false }).limit(500),
  ]);
  const students = (stuQ.data ?? []) as { id: string; family_id: string; name_ko: string; name_en: string | null; phone: string | null; email: string | null; education: string | null; status: string; birth_date: string | null }[];
  const cases = (caseQ.data ?? []) as { id: string; student_id: string; service: Service; title: string; status: string }[];
  const steps = (stepQ.data ?? []) as StepLite[];
  const enrols = (enrQ.data ?? []) as { case_id: string; provider: string; course: string }[];
  const lastMsg = new Map<string, string>();
  for (const m of (msgQ.data ?? []) as { family_id: string; created_at: string }[]) if (!lastMsg.has(m.family_id)) lastMsg.set(m.family_id, m.created_at);

  const stepsByCase = new Map<string, StepLite[]>();
  for (const s of steps) stepsByCase.set(s.case_id, [...(stepsByCase.get(s.case_id) ?? []), s]);
  const schoolsByCase = new Map<string, string>();
  for (const e of enrols) schoolsByCase.set(e.case_id, `${schoolsByCase.get(e.case_id) ?? ""} ${e.provider} ${e.course}`);

  const matches = (s: (typeof students)[number], extra: string) =>
    !q || [s.name_ko, s.name_en, s.phone, s.email, extra].some((v) => (v ?? "").toLowerCase().includes(q));

  const rows: Row[] = [];
  const withCase = new Set<string>();
  for (const s of students) {
    const minor = !!s.birth_date && ageOn(s.birth_date, today) < 18;
    const mine = cases.filter((c) => c.student_id === s.id);
    for (const c of mine) {
      withCase.add(s.id);
      if (!showDone && (c.status === "done" || c.status === "cancelled")) continue;
      if (!matches(s, `${c.title} ${schoolsByCase.get(c.id) ?? ""}`)) continue;
      const p = caseProgress(c.service, stepsByCase.get(c.id) ?? []);
      rows.push({
        studentId: s.id,
        caseId: c.id,
        name: s.name_ko,
        edu: s.education ?? "",
        minor,
        service: c.service,
        target: c.title,
        phase: p.phase,
        phaseColor: p.phaseColor,
        step: p.step,
        pct: p.pct,
        due: p.next ? `${shortDate(p.next.due_date)} ${p.next.label}` : "마감 없음",
        urgent: !!p.next?.due_date && p.next.due_date <= week,
        last: whenKo(lastMsg.get(s.family_id)),
        caseStatus: c.status,
      });
    }
    if (!mine.length && (showDone || (s.status !== "done" && s.status !== "cancelled")) && matches(s, "")) {
      rows.push({
        studentId: s.id, caseId: null, name: s.name_ko, edu: s.education ?? "", minor, service: null,
        target: "진행 건 없음", phase: STUDENT_STATUS[s.status] ?? s.status, phaseColor: "#5B6577", step: "", pct: 0,
        due: "", urgent: false, last: whenKo(lastMsg.get(s.family_id)), caseStatus: s.status,
      });
    }
  }

  const counts: Record<string, number> = { all: new Set(rows.map((r) => r.studentId)).size };
  for (const sv of SERVICES) counts[sv.key] = rows.filter((r) => r.service === sv.key).length;
  const shown = svc === "all" ? rows : rows.filter((r) => r.service === svc);
  const activeN = students.filter((s) => s.status === "active").length;

  const qs = (patch: Partial<Search>) => {
    const p = new URLSearchParams();
    const next = { svc: svc === "all" ? undefined : svc, view: sp.view, q: sp.q, done: sp.done, ...patch };
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
    const s = p.toString();
    return `/admin/students${s ? "?" + s : ""}`;
  };
  const flow = svc === "all" ? [] : FLOWS[svc];

  return (
    <>
      <header className="ad-head">
        <div>
          <span className="ad-sub">진행 중 {activeN}명 · 등록 {students.length}명 · 누적 650명 이상</span>
          <h1 className="ad-h1">학생</h1>
        </div>
        <div className="ad-row">
          <form action="/admin/students" method="get" className="ad-search" role="search">
            <span>찾기</span>
            {svc !== "all" ? <input type="hidden" name="svc" value={svc} /> : null}
            <input type="search" name="q" defaultValue={sp.q ?? ""} placeholder="이름, 학교, 연락처" aria-label="학생 찾기" />
          </form>
          {svc !== "all" ? (
            <div role="group" aria-label="보기 방식" className="ad-seg">
              <Link href={qs({ view: undefined })} aria-current={board ? "page" : undefined}>진행 보드</Link>
              <Link href={qs({ view: "list" })} aria-current={!board ? "page" : undefined}>목록</Link>
            </div>
          ) : null}
          <a href="#add" className="ad-btn">학생 추가</a>
        </div>
      </header>

      <nav aria-label="서비스" className="ad-tabs">
        <Link href={qs({ svc: undefined })} className="ad-tab" aria-current={svc === "all" ? "page" : undefined}>전체 <small>{counts.all}</small></Link>
        {SERVICES.map((s) => (
          <Link key={s.key} href={qs({ svc: s.key })} className="ad-tab" aria-current={svc === s.key ? "page" : undefined}>
            {s.label} <small>{counts[s.key]}</small>
          </Link>
        ))}
      </nav>
      <div className="ad-between">
        <span className="ad-sub">
          {svc === "all" ? "서비스마다 단계가 달라 전체는 목록으로 보여 드립니다. 진행 보드는 위에서 서비스를 고르면 나옵니다." : ""}
          {q ? ` "${sp.q}" 찾은 결과 ${shown.length}건 · ` : " "}
          {q ? <Link href={qs({ q: undefined })}>찾기 지우기</Link> : null}
        </span>
        <Link href={qs({ done: showDone ? undefined : "1" })} className="ad-small">{showDone ? "진행 중인 건만 보기" : "완료·취소 건도 보기"}</Link>
      </div>

      {board ? (
        <div className="ad-board">
          <div className="ad-board-grid" style={{ gridTemplateColumns: `repeat(${flow.length}, minmax(220px, 1fr))`, minWidth: flow.length * 224 }}>
            {flow.map((p) => {
              const items = shown.filter((r) => r.phase === p.phase);
              return (
                <section key={p.phase} className="ad-col">
                  <h2><span style={{ color: p.color }}>{p.phase}</span><span style={{ color: "#5B6577", fontWeight: 600 }}>{items.length}</span></h2>
                  {items.map((s) => (
                    <Link key={s.caseId ?? s.studentId} href={`/admin/students/${s.studentId}${s.caseId ? `?case=${s.caseId}` : ""}`} className="ad-scard">
                      <span className="ad-between"><strong style={{ fontSize: 16 }}>{s.name}</strong><span className="ad-tiny" style={{ color: "#5B6577" }}>{[s.edu, s.minor ? "미성년" : ""].filter(Boolean).join(" · ")}</span></span>
                      <span style={{ fontSize: 13, color: "#4A5568", lineHeight: 1.5 }}>{s.target}</span>
                      {s.step ? <span style={{ fontSize: 13, fontWeight: 700 }}>지금: {s.step}</span> : null}
                      <span className="ad-bar" style={{ height: 6 }}><span style={{ width: `${s.pct}%`, background: p.color, borderRadius: 0 }} /></span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.urgent ? "#9B2C3E" : "#5B6577" }}>{s.due}</span>
                    </Link>
                  ))}
                </section>
              );
            })}
          </div>
          {shown.some((r) => !flow.some((p) => p.phase === r.phase)) ? (
            <p className="ad-sub">단계 이름을 바꾼 건은 목록 보기에서 보입니다.</p>
          ) : null}
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table" style={{ minWidth: 860 }}>
            <thead>
              <tr><th scope="col">학생</th><th scope="col">서비스</th><th scope="col">목표 과정</th><th scope="col">단계</th><th scope="col">지금 할 일</th><th scope="col">다음 마감</th><th scope="col">최근 연락</th></tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr><td colSpan={7} className="ad-muted">{q ? "찾는 학생이 없습니다." : "아직 학생이 없습니다. 아래에서 학생을 추가해 주세요."}</td></tr>
              ) : null}
              {shown.map((s) => {
                const sv = s.service ? serviceOf(s.service) : null;
                return (
                  <tr key={(s.caseId ?? "") + s.studentId}>
                    <td>
                      <Link href={`/admin/students/${s.studentId}${s.caseId ? `?case=${s.caseId}` : ""}`} style={{ fontWeight: 800, color: "#0F1B2D", textDecoration: "none" }}>{s.name}</Link>
                      <span style={{ display: "block", fontSize: 12, color: "#5B6577" }}>{[s.edu, s.minor ? "미성년" : ""].filter(Boolean).join(" · ") || " "}</span>
                    </td>
                    <td className="nowrap" style={{ fontWeight: 700, color: sv?.color }}>{sv?.label ?? "-"}</td>
                    <td style={{ color: "#4A5568" }}>{s.target}{s.caseStatus !== "active" && s.caseId ? ` (${s.caseStatus === "done" ? "완료" : s.caseStatus === "hold" ? "보류" : "취소"})` : ""}</td>
                    <td><span className="ad-badge" style={{ color: s.phaseColor, background: s.phaseColor + "1A" }}>{s.phase}</span></td>
                    <td>{s.step}</td>
                    <td className="nowrap" style={{ fontWeight: 700, color: s.urgent ? "#9B2C3E" : "#5B6577" }}>{s.due}</td>
                    <td className="nowrap ad-muted">{s.last}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <details id="add" className="ad-details" open={sp.add === "1" || students.length === 0}>
        <summary>학생 추가</summary>
        <div>
          <span className="ad-sub">가족이 함께 만들어지고 연결 코드가 나옵니다. 학생과 부모님이 가입할 때 이 코드를 넣으면 같은 마이페이지를 봅니다.</span>
          <AddStudentResult action={addStudent}>
            <label>이름 (한글)<input type="text" name="name_ko" required maxLength={80} /></label>
            <label>영문 이름 (여권)<input type="text" name="name_en" maxLength={120} placeholder="KIM SEOYUN" /></label>
            <label>연락처<input type="tel" name="phone" maxLength={40} /></label>
            <label>이메일<input type="email" name="email" maxLength={200} /></label>
            <label>생년월일<input type="date" name="birth_date" /></label>
            <label>학력
              <select name="education" defaultValue="">
                <option value="">선택 안 함</option>
                {EDUCATION.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>
            <label>첫 진행 건
              <select name="service" defaultValue="">
                <option value="">나중에 추가</option>
                {SERVICES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </label>
            <label>진행 건 이름<input type="text" name="case_title" maxLength={200} placeholder="예: UTS 간호 학사 2027년 2월" /></label>
            <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}><Submit className="ad-btn">학생 추가</Submit></div>
          </AddStudentResult>
        </div>
      </details>
    </>
  );
}
