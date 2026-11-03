import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { CASE_STATUS, ENROL_STATUS, SERVICES, STEP_STATE, expectedVisaExpiry, fmtDateKo, phaseColor, serviceOf } from "@/lib/crm/flows";
import { formatCode } from "@/lib/crm/account";
import {
  EDUCATION,
  STUDENT_STATUS,
  WELFARE,
  WELFARE_PHASE,
  ageOn,
  caseProgress,
  isUuid,
  monthsBetween,
  shortDate,
  todayKST,
  whenKo,
  type StepLite,
} from "@/lib/crm/admin-util";
import {
  addCase,
  addNote,
  addStep,
  cycleStep,
  deleteCase,
  deleteNote,
  deleteStep,
  saveExpiry,
  updateCase,
  updateStep,
  updateStudent,
} from "@/lib/crm/admin-actions";
import { ActionForm, Submit } from "@/components/admin/client";
import { AppsTab, DocsTab, MsgsTab, PayTab, TabLinks, type DocRow, type EnrolRow, type FeeRow, type MsgRow } from "@/components/admin/StudentTabs";

type Student = {
  id: string;
  family_id: string;
  profile_id: string | null;
  name_ko: string;
  name_en: string | null;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  kakao_id: string | null;
  education: string | null;
  status: string;
  welfare_type: string | null;
  form_1229_received: boolean;
  under14_consent_received: boolean;
  consult_request_id: string | null;
  created_at: string;
};
type Case = {
  id: string;
  service: string;
  title: string;
  status: string;
  visa_subclass: string | null;
  linked_case_id: string | null;
  trn: string | null;
  lodged_at: string | null;
  granted_at: string | null;
  expected_expiry: string | null;
  form_956a: boolean;
  oshc_until: string | null;
  intake: string | null;
  created_at: string;
};
type Step = StepLite & { key: string | null; student_note: string | null };
type Profile = { id: string; name: string; phone: string | null; relation: string | null; role: string };

function ymdLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Expected 500 expiry from the linked study case's enrolments.
function visaExpiryFor(enrols: EnrolRow[]) {
  const live = enrols.filter((e) => e.end_date && e.offer_status !== "withdrawn" && e.offer_status !== "rejected");
  if (!live.length) return null;
  const lastEnd = live.map((e) => e.end_date!).sort().pop()!;
  const starts = live.map((e) => e.start_date).filter((x): x is string => !!x).sort();
  const months = starts.length ? monthsBetween(starts[0], lastEnd) : 12;
  const [y, m, d] = lastEnd.split("-").map(Number);
  const exp = ymdLocal(expectedVisaExpiry(new Date(y, m - 1, d), months));
  const rule = m === 11 || m === 12 ? "11~12월 종료 → 다음 해 3월 15일" : months <= 10 ? "과정 10개월 이하 → 종료 후 1개월" : "종료 후 2개월";
  return { lastEnd, months, exp, rule, n: live.length, coe: live.filter((e) => e.offer_status === "coe").length };
}

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ case?: string; tab?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  if (!isUuid(id)) notFound();
  const { sb } = await requireAdmin();
  const { data: stRaw } = await sb.from("crm_students").select("*").eq("id", id).maybeSingle();
  if (!stRaw) notFound();
  const st = stRaw as Student;
  const today = todayKST();
  const tab = ["docs", "apps", "pay", "msgs"].includes(sp.tab ?? "") ? (sp.tab as string) : "docs";

  const [famQ, profQ, caseQ, docQ, noteQ, siblingsQ] = await Promise.all([
    sb.from("crm_families").select("id, display_name, invite_code").eq("id", st.family_id).maybeSingle(),
    sb.from("crm_profiles").select("id, name, phone, relation, role").eq("family_id", st.family_id),
    sb.from("crm_cases").select("*").eq("student_id", id).order("created_at"),
    sb.from("crm_documents").select("*").eq("student_id", id).order("created_at"),
    sb.from("crm_notes").select("id, body, pinned, created_at").eq("student_id", id).order("created_at", { ascending: false }),
    sb.from("crm_students").select("id, name_ko").eq("family_id", st.family_id).neq("id", id),
  ]);
  const cases = (caseQ.data ?? []) as Case[];
  const caseIds = cases.map((c) => c.id);
  const [stepQ, enrQ, feeQ] = caseIds.length
    ? await Promise.all([
        sb.from("crm_steps").select("id, case_id, seq, phase, key, label, state, due_date, student_note").in("case_id", caseIds).order("seq"),
        sb.from("crm_enrolments").select("*").in("case_id", caseIds).order("seq"),
        sb.from("crm_fees").select("*").in("case_id", caseIds).order("created_at"),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];
  const steps = (stepQ.data ?? []) as Step[];
  const enrols = (enrQ.data ?? []) as EnrolRow[];
  const fees = (feeQ.data ?? []) as FeeRow[];
  const docs = (docQ.data ?? []) as DocRow[];
  const notes = (noteQ.data ?? []) as { id: string; body: string; pinned: boolean; created_at: string }[];
  const profiles = (profQ.data ?? []) as Profile[];
  const fam = famQ.data as { id: string; display_name: string; invite_code: string } | null;
  const siblings = (siblingsQ.data ?? []) as { id: string; name_ko: string }[];

  // Messages (only loaded on the message tab; viewing marks them read).
  let msgs: MsgRow[] = [];
  const names = new Map(profiles.map((p) => [p.id, p.role === "parent" ? `${st.name_ko} ${p.relation || "보호자"}` : p.name]));
  if (tab === "msgs") {
    const { data } = await sb.from("crm_messages").select("id, author_id, from_admin, body, created_at, read_by_family").eq("family_id", st.family_id).order("created_at");
    msgs = (data ?? []) as MsgRow[];
    await sb.from("crm_messages").update({ read_by_admin: true }).eq("family_id", st.family_id).eq("read_by_admin", false);
  }
  const { count: unread } = tab === "msgs" ? { count: 0 } : await sb.from("crm_messages").select("id", { count: "exact", head: true }).eq("family_id", st.family_id).eq("read_by_admin", false);

  const stepsByCase = new Map<string, Step[]>();
  for (const s of steps) stepsByCase.set(s.case_id, [...(stepsByCase.get(s.case_id) ?? []), s]);
  const enrolByCase = new Map<string, EnrolRow[]>();
  for (const e of enrols) enrolByCase.set(e.case_id, [...(enrolByCase.get(e.case_id) ?? []), e]);

  const sel = cases.find((c) => c.id === sp.case) ?? cases.find((c) => c.status === "active") ?? cases[0] ?? null;
  const base = `/admin/students/${id}${sel ? `?case=${sel.id}` : ""}`;

  const age = st.birth_date ? ageOn(st.birth_date, today) : null;
  const minor = age !== null && age < 18;
  const activeCases = cases.filter((c) => c.status === "active");
  const nextDue = activeCases
    .flatMap((c) => (stepsByCase.get(c.id) ?? []).filter((s) => (s.state === "todo" || s.state === "doing") && s.due_date))
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))[0];
  const studyCases = cases.filter((c) => c.service === "study" || c.service === "language");

  function caseLegs(c: Case) {
    if (c.service === "visa") {
      const linked = c.linked_case_id ? cases.find((x) => x.id === c.linked_case_id) : null;
      const exp = linked ? visaExpiryFor(enrolByCase.get(linked.id) ?? []) : null;
      const legs: { n: string; name: string; meta: string }[] = [];
      if (linked) legs.push({ n: "↳", name: `연결: ${linked.title}${exp ? ` · 과정 ${exp.n}개${exp.coe ? ` (CoE ${exp.coe})` : ""}` : ""}`, meta: exp ? `예상 비자 만료 ${fmtDateKo(exp.exp)} (${exp.rule})` : "연결한 건에 과정 종료일을 넣으면 예상 만료일이 나옵니다" });
      else legs.push({ n: "↳", name: "연결한 진학 건 없음", meta: "학생비자라면 아래 진행 건 정보에서 진학 건을 연결해 주세요" });
      const expiry = c.expected_expiry ?? exp?.exp ?? null;
      if (c.oshc_until) legs.push({ n: c.oshc_until && expiry && c.oshc_until < expiry ? "!" : "✓", name: `OSHC ${fmtDateKo(c.oshc_until)}까지`, meta: expiry && c.oshc_until < expiry ? "보험 종료일이 예상 비자 만료일보다 빠릅니다" : "보험 종료일이 비자 만료일 이후인지 접수 전 확인" });
      else legs.push({ n: "!", name: "OSHC 종료일 확인", meta: "보험 종료일이 비자 만료일 이후인지 접수 전 확인" });
      legs.push({ n: "✉", name: c.form_956a ? "956A · 수신인 AusUhak" : "956A 수신인 지정 전", meta: c.form_956a ? "이민성 서류가 ausuhak.com@gmail.com 으로 옴" : "지정하면 이민성 서류를 제가 바로 받습니다" });
      if (c.trn || c.lodged_at || c.granted_at) legs.push({ n: "#", name: [c.trn ? `TRN ${c.trn}` : "", c.lodged_at ? `접수 ${shortDate(c.lodged_at)}` : ""].filter(Boolean).join(" · ") || "접수", meta: c.granted_at ? `승인 ${fmtDateKo(c.granted_at)}` : "심사 중" });
      return legs;
    }
    return (enrolByCase.get(c.id) ?? []).map((e) => ({
      n: String(e.seq),
      name: `${e.provider} ${e.course}`,
      meta: [ENROL_STATUS[e.offer_status], e.start_date ? `${fmtDateKo(e.start_date)}${e.end_date ? ` ~ ${fmtDateKo(e.end_date)}` : ""}` : "", e.coe_no ? `CoE ${e.coe_no}` : ""].filter(Boolean).join(" · "),
    }));
  }

  // Phases of the selected case, in step order (custom phases included).
  const selSteps = sel ? (stepsByCase.get(sel.id) ?? []) : [];
  const phaseNames: string[] = [];
  for (const s of selSteps) if (!phaseNames.includes(s.phase)) phaseNames.push(s.phase);
  const selExp = sel?.service === "visa" && sel.linked_case_id ? visaExpiryFor(enrolByCase.get(sel.linked_case_id) ?? []) : null;

  return (
    <>
      <nav aria-label="현재 위치" className="ad-crumb"><Link href="/admin/students">학생</Link> › {st.name_ko}</nav>

      <section className="ad-card" style={{ padding: 24, flexDirection: "row", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
          <div className="ad-row">
            <h1 className="ad-h1" style={{ fontSize: 30 }}>{st.name_ko}</h1>
            {st.name_en ? <span className="ad-sub">{st.name_en}</span> : null}
            {minor ? <Link href={`/admin/minors#m-${st.id}`} className="ad-badge" style={{ color: "#fff", background: "#9B2C3E", textDecoration: "none" }}>미성년 · 만 {age}세</Link> : null}
            {nextDue ? <span className="ad-badge" style={{ color: "#9B2C3E", background: "#F9E9EC" }}>{shortDate(nextDue.due_date)} {nextDue.label}</span> : null}
          </div>
          <span style={{ fontSize: 15, color: "#4A5568" }}>
            {[st.education, STUDENT_STATUS[st.status], age !== null ? `만 ${age}세` : "", `진행 건 ${cases.length}개 (진행 ${activeCases.length} · 완료 ${cases.filter((c) => c.status === "done").length})`].filter(Boolean).join(" · ")}
          </span>
          <span className="ad-sub">
            등록 {fmtDateKo(st.created_at)}
            {st.consult_request_id ? <> · <Link href={`/admin/consults?id=${st.consult_request_id}`}>상담 신청 보기</Link></> : null}
            {siblings.length ? <> · 같은 가족: {siblings.map((s, i) => <span key={s.id}>{i ? ", " : ""}<Link href={`/admin/students/${s.id}`}>{s.name_ko}</Link></span>)}</> : null}
          </span>
          <div aria-label="가족" className="ad-family">
            {profiles.length === 0 ? (
              <span className="ad-person"><strong>{st.name_ko} · 학생</strong><span>{[st.phone, st.email].filter(Boolean).join(" · ") || "연락처 없음"} · 아직 가입 전</span></span>
            ) : null}
            {profiles.map((p) => (
              <span key={p.id} className="ad-person">
                <strong>{p.name || st.name_ko} · {p.relation || (p.role === "parent" ? "보호자" : "학생")}</strong>
                <span>{p.phone ? `${p.phone} · ` : ""}마이페이지 연결됨</span>
              </span>
            ))}
            {fam ? (
              <span className="ad-code">
                <span className="ad-small ad-muted">가족 연결 코드 (가입할 때 넣기)</span>
                <b>{formatCode(fam.invite_code)}</b>
              </span>
            ) : null}
          </div>
        </div>
        <div className="ad-row">
          <Link href={`${base}${base.includes("?") ? "&" : "?"}tab=msgs#tabs`} className="ad-btn sm" style={{ minHeight: 44 }}>
            메시지 보내기{unread ? ` · 새 메시지 ${unread}` : ""}
          </Link>
        </div>
      </section>

      <details className="ad-details">
        <summary>학생 정보 고치기</summary>
        <div>
          <ActionForm action={updateStudent}>
            <input type="hidden" name="id" value={st.id} />
            <label>이름 (한글)<input type="text" name="name_ko" defaultValue={st.name_ko} maxLength={80} required /></label>
            <label>영문 이름 (여권)<input type="text" name="name_en" defaultValue={st.name_en ?? ""} maxLength={120} /></label>
            <label>생년월일<input type="date" name="birth_date" defaultValue={st.birth_date ?? ""} /></label>
            <label>연락처<input type="tel" name="phone" defaultValue={st.phone ?? ""} maxLength={40} /></label>
            <label>이메일<input type="email" name="email" defaultValue={st.email ?? ""} maxLength={200} /></label>
            <label>카카오톡 ID<input type="text" name="kakao_id" defaultValue={st.kakao_id ?? ""} maxLength={80} /></label>
            <label>학력
              <input type="text" name="education" list="edu-list" defaultValue={st.education ?? ""} maxLength={40} />
              <datalist id="edu-list">{EDUCATION.map((e) => <option key={e} value={e} />)}</datalist>
            </label>
            <label>상태
              <select name="status" defaultValue={st.status}>
                {Object.entries(STUDENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>미성년 보호 방식
              <select name="welfare_type" defaultValue={st.welfare_type ?? ""}>
                <option value="">정하지 않음</option>
                {WELFARE.map((w) => <option key={w.key} value={w.key}>{w.label}</option>)}
              </select>
            </label>
            <label className="ad-check"><input type="checkbox" name="form_1229_received" defaultChecked={st.form_1229_received} />Form 1229 받음</label>
            <label className="ad-check"><input type="checkbox" name="under14_consent_received" defaultChecked={st.under14_consent_received} />만 14세 미만 개인정보 동의서 받음</label>
            <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}><Submit>저장</Submit></div>
          </ActionForm>
        </div>
      </details>

      <section aria-label="관리 메모" className="ad-memo" style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, alignItems: "flex-start", padding: "18px 22px" }}>
        <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="ad-row" style={{ alignItems: "baseline" }}><strong style={{ fontSize: 17 }}>관리 메모</strong><span className="ad-memo-tag">학생·학부모에게 안 보임</span></span>
          <ActionForm action={addNote} resetOnOk className="ad-form">
            <input type="hidden" name="student_id" value={st.id} />
            <textarea name="body" rows={2} maxLength={4000} aria-label="이 학생 메모 쓰기" placeholder="이 학생에 대해 적어 둘 것" className="full" />
            <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}><Submit>메모 저장</Submit></div>
          </ActionForm>
        </div>
        <div style={{ flex: "999 1 420px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {notes.length === 0 ? <span className="ad-sub">아직 메모가 없습니다.</span> : null}
          {notes.map((n) => (
            <div key={n.id} className="ad-memo-item" style={{ padding: "10px 14px" }}>
              <span className="ad-pre">{n.body}</span>
              <span className="ad-tiny" style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span>{whenKo(n.created_at)}</span>
                <form action={deleteNote}>
                  <input type="hidden" name="id" value={n.id} />
                  <Submit className="ad-linkbtn gray" confirm="이 메모를 지울까요?">지우기</Submit>
                </form>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="진행 건" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="ad-between">
          <h2 className="ad-h2">진행 건</h2>
        </div>
        {cases.length ? (
          <div className="ad-cases">
            {cases.map((c) => {
              const s = serviceOf(c.service);
              const p = caseProgress(c.service, stepsByCase.get(c.id) ?? []);
              return (
                <Link key={c.id} href={`/admin/students/${id}?case=${c.id}${tab !== "docs" ? `&tab=${tab}` : ""}`} scroll={false} className="ad-case" aria-current={sel?.id === c.id ? "true" : undefined}>
                  <span className="ad-between" style={{ alignItems: "center" }}>
                    <span className="ad-badge" style={{ color: s.color, background: s.bg, padding: "3px 10px" }}>{s.label}{c.visa_subclass ? ` ${c.visa_subclass}` : ""}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: c.status === "done" ? "#1F6B5C" : c.status === "active" ? "#9B2C3E" : "#5B6577" }}>{CASE_STATUS[c.status] ?? c.status}</span>
                  </span>
                  <strong style={{ fontSize: 16, lineHeight: 1.4 }}>{c.title}</strong>
                  {caseLegs(c).map((l, i) => (
                    <span key={i} className="ad-leg"><span>{l.n}</span><span><b>{l.name}</b><i>{l.meta}</i></span></span>
                  ))}
                  <span className="ad-case-foot">
                    {p.total ? `단계 ${p.done}/${p.total}${p.step ? ` · 지금: ${p.step}` : ""}` : "단계 없음"}
                    {c.intake ? ` · 입학 ${c.intake}` : ""}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : <p className="ad-sub">아직 진행 건이 없습니다.</p>}
        <details className="ad-details">
          <summary>진행 건 추가 (진학 · 어학연수 · 비자 · 기타)</summary>
          <div>
            <span className="ad-sub">만들면 서비스별 기본 단계가 같이 들어갑니다. 단계 이름과 마감일은 나중에 고칠 수 있습니다.</span>
            <form action={addCase} className="ad-form">
              <input type="hidden" name="student_id" value={st.id} />
              <label>서비스
                <select name="service" defaultValue="study">
                  {SERVICES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </label>
              <label>이름<input type="text" name="title" maxLength={200} required placeholder="예: UTS 패키지 · 영어 10주 → 간호 학사" /></label>
              <label>입학 시기<input type="text" name="intake" maxLength={20} placeholder="2027-02" /></label>
              <label>비자 종류 (비자 건)<input type="text" name="visa_subclass" maxLength={10} placeholder="500 / 590 / 600 / 485" /></label>
              {studyCases.length ? (
                <label>연결할 진학 건 (학생비자)
                  <select name="linked_case_id" defaultValue="">
                    <option value="">연결 안 함</option>
                    {studyCases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </label>
              ) : null}
              <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}><Submit>진행 건 만들기</Submit></div>
            </form>
          </div>
        </details>
      </section>

      {sel ? (
        <section aria-label="진행 단계" className="ad-card" style={{ gap: 16 }}>
          <div className="ad-between">
            <h2 className="ad-h2">{sel.title} · 단계</h2>
            <span className="ad-sub">단계를 누르면 진행 중 · 완료 · 대기로 바뀌고, 학생 마이페이지에도 같이 보입니다</span>
          </div>
          {selSteps.length ? (
            <div className="ad-phases">
              <div className="ad-phase-grid" style={{ gridTemplateColumns: `repeat(${phaseNames.length}, minmax(148px, 1fr))`, minWidth: phaseNames.length * 156 }}>
                {phaseNames.map((ph) => {
                  const color = ph === WELFARE_PHASE ? "#9B2C3E" : phaseColor(sel.service, ph);
                  const list = selSteps.filter((s) => s.phase === ph);
                  const counted = list.filter((s) => s.state !== "skip");
                  return (
                    <div key={ph} className="ad-phase">
                      <span className="ad-phase-h" style={{ color, borderColor: color }}>{ph || "단계"}<span>{counted.filter((s) => s.state === "done").length}/{counted.length}</span></span>
                      {list.map((s) => {
                        const done = s.state === "done";
                        const cur = s.state === "doing";
                        const skip = s.state === "skip";
                        return (
                          <form key={s.id} action={cycleStep}>
                            <input type="hidden" name="id" value={s.id} />
                            <button
                              type="submit"
                              className="ad-step"
                              title="눌러서 상태 바꾸기"
                              style={{
                                borderColor: cur ? "#E8B4BE" : "#E3E8EF",
                                background: cur ? "#FFF7F8" : done ? "#FFFFFF" : "#F8FAFC",
                                color: done || cur ? "#0F1B2D" : "#6B7588",
                                textDecoration: skip ? "line-through" : undefined,
                              }}
                            >
                              <span aria-hidden="true" className="ad-step-dot" style={{ borderColor: done ? color : cur ? "#9B2C3E" : "#C5CDD9", background: done ? color : "transparent" }} />
                              <span className="ad-step-label">
                                {s.label}
                                {s.due_date && !done ? <small style={{ color: s.due_date <= today ? "#9B2C3E" : undefined }}>마감 {shortDate(s.due_date)}</small> : null}
                              </span>
                              <span className="ad-step-state" style={{ color: done ? color : cur ? "#9B2C3E" : "#8A94A6" }}>{STEP_STATE[s.state]?.label ?? s.state}</span>
                            </button>
                          </form>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <p className="ad-sub">단계가 없습니다. 아래에서 단계를 추가해 주세요.</p>}

          <details className="ad-details">
            <summary>단계 고치기 (이름 · 마감일 · 학생에게 보이는 안내 · 해당 없음)</summary>
            <div>
              {selSteps.map((s) => (
                <form key={s.id} action={updateStep} className="ad-form" style={{ borderTop: "1px solid #EEF2F7", paddingTop: 12 }}>
                  <input type="hidden" name="id" value={s.id} />
                  <label>단계 이름<input type="text" name="label" defaultValue={s.label} maxLength={120} required /></label>
                  <label>묶음<input type="text" name="phase" defaultValue={s.phase} maxLength={40} list="phase-list" /></label>
                  <label>마감일<input type="date" name="due_date" defaultValue={s.due_date ?? ""} /></label>
                  <label>상태
                    <select name="state" defaultValue={s.state}>
                      {Object.entries(STEP_STATE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </label>
                  <label className="full">학생에게 보이는 안내<input type="text" name="student_note" defaultValue={s.student_note ?? ""} maxLength={1000} /></label>
                  <div className="ad-row full">
                    <Submit>저장</Submit>
                    <button type="submit" formAction={deleteStep} className="ad-btn sm danger">이 단계 지우기</button>
                  </div>
                </form>
              ))}
              <datalist id="phase-list">{phaseNames.map((p) => <option key={p} value={p} />)}</datalist>
              <form action={addStep} className="ad-form" style={{ borderTop: "1px solid #EEF2F7", paddingTop: 12 }}>
                <input type="hidden" name="case_id" value={sel.id} />
                <label>새 단계 이름<input type="text" name="label" maxLength={120} required /></label>
                <label>묶음<input type="text" name="phase" maxLength={40} list="phase-list" defaultValue={phaseNames[phaseNames.length - 1] ?? ""} /></label>
                <label>마감일<input type="date" name="due_date" /></label>
                <div><Submit>단계 추가</Submit></div>
              </form>
            </div>
          </details>

          <details className="ad-details">
            <summary>진행 건 정보 고치기{sel.service === "visa" ? " (비자 연결 · 만료일 · OSHC · 956A)" : ""}</summary>
            <div>
              {selExp ? (
                <div className="ad-sent" style={{ alignItems: "center" }}>
                  <span>
                    예상 비자 만료 <b>{fmtDateKo(selExp.exp)}</b>
                    <span className="ad-tiny" style={{ display: "block" }}>마지막 과정 종료 {fmtDateKo(selExp.lastEnd)} · 전체 {selExp.months}개월 · {selExp.rule}</span>
                  </span>
                  {sel.expected_expiry !== selExp.exp ? (
                    <form action={saveExpiry}>
                      <input type="hidden" name="id" value={sel.id} />
                      <input type="hidden" name="date" value={selExp.exp} />
                      <Submit className="ad-btn sm ghost">이 날짜로 저장</Submit>
                    </form>
                  ) : <span className="ad-tiny">저장됨</span>}
                </div>
              ) : null}
              <ActionForm action={updateCase}>
                <input type="hidden" name="id" value={sel.id} />
                <label>이름<input type="text" name="title" defaultValue={sel.title} maxLength={200} required /></label>
                <label>상태
                  <select name="status" defaultValue={sel.status}>
                    {Object.entries(CASE_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
                <label>입학 시기<input type="text" name="intake" defaultValue={sel.intake ?? ""} maxLength={20} placeholder="2027-02" /></label>
                {sel.service === "visa" ? (
                  <>
                    <input type="hidden" name="is_visa" value="1" />
                    <label>비자 종류<input type="text" name="visa_subclass" defaultValue={sel.visa_subclass ?? ""} maxLength={10} /></label>
                    <label>연결한 진학 건
                      <select name="linked_case_id" defaultValue={sel.linked_case_id ?? ""}>
                        <option value="">연결 안 함</option>
                        {studyCases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </label>
                    <label>TRN<input type="text" name="trn" defaultValue={sel.trn ?? ""} maxLength={40} /></label>
                    <label>접수일<input type="date" name="lodged_at" defaultValue={sel.lodged_at ?? ""} /></label>
                    <label>승인일<input type="date" name="granted_at" defaultValue={sel.granted_at ?? ""} /></label>
                    <label>비자 만료일<input type="date" name="expected_expiry" defaultValue={sel.expected_expiry ?? ""} /></label>
                    <label>OSHC 종료일<input type="date" name="oshc_until" defaultValue={sel.oshc_until ?? ""} /></label>
                    <label className="ad-check"><input type="checkbox" name="form_956a" defaultChecked={sel.form_956a} />956A 수신인 지정됨</label>
                  </>
                ) : null}
                <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}><Submit>저장</Submit></div>
              </ActionForm>
              <form action={deleteCase}>
                <input type="hidden" name="id" value={sel.id} />
                <input type="hidden" name="student_id" value={st.id} />
                <Submit className="ad-btn sm danger" confirm="이 진행 건을 지울까요? 단계·학교·비용 기록도 같이 지워집니다. 끝난 건은 지우지 말고 상태를 완료로 바꿔 두세요.">진행 건 지우기</Submit>
              </form>
            </div>
          </details>
        </section>
      ) : null}

      <TabLinks base={base} tab={tab} />
      {tab === "docs" ? <DocsTab studentId={st.id} familyId={st.family_id} docs={docs} cases={cases} /> : null}
      {tab === "apps" ? <AppsTab enrols={enrols} cases={cases} /> : null}
      {tab === "pay" ? <PayTab fees={fees} cases={cases} /> : null}
      {tab === "msgs" ? <MsgsTab familyId={st.family_id} msgs={msgs} names={names} /> : null}
    </>
  );
}
