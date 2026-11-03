import { formatCode } from "@/lib/crm/account";
import { DOC_STATE, ENROL_STATUS, fmtMoney } from "@/lib/crm/flows";
import { SITE } from "@/lib/site";
import { fmtIntake, fmtMonthDay, fmtWhen, givenName, josa } from "./ko";
import UploadButton from "./UploadButton";
import MessageForm from "./MessageForm";
import CopyCode from "./CopyCode";

// MyPage sections. All text from the database is rendered as React text (escaped).

export type Student = { id: string; name_ko: string; profile_id: string | null; status: string };
export type Case = { id: string; service: string; title: string; status: string; visa_subclass: string | null; intake: string | null; created_at: string };
export type Step = { id: string; seq: number; phase: string; label: string; state: string; student_note: string | null };
export type Enrol = { id: string; seq: number; provider: string; course: string; offer_status: string };
export type Doc = { id: string; case_id: string | null; direction: string; label: string; state: string; due_date: string | null; storage_path: string | null; file_name: string | null; note: string | null; created_at: string };
export type Fee = { id: string; case_id: string; label: string; kind: string; amount: number | string; currency: string; due_date: string | null; paid_at: string | null; created_at: string };
export type Msg = { id: string; author_id: string | null; from_admin: boolean; body: string; created_at: string };
export type Member = { id: string; name: string; relation: string | null; role: string };

/* ---------- hero ---------- */

function currentStepOf(steps: Step[]) {
  return steps.find((s) => s.state === "doing") ?? steps.find((s) => s.state === "todo") ?? null;
}

export function Hero({ student, current, steps, enrols, docs }: { student: Student | null; current: Case | null; steps: Step[]; enrols: Enrol[]; docs: Doc[] }) {
  if (!student || !current || !steps.length) {
    return (
      <section className="mp-hero" data-pane="home" aria-label="진행 상황">
        <div className="mp-hero-text">
          {student ? <span className="mp-hero-tag">{student.name_ko} 학생</span> : null}
          <h1>{current ? current.title : "반갑습니다"}</h1>
          <p>제가 상담 내용을 정리해서 곧 진행 단계를 올려 드리겠습니다. 궁금한 점은 아래 AusUhak 메시지로 남겨 주세요.</p>
        </div>
      </section>
    );
  }

  const counted = steps.filter((s) => s.state !== "skip");
  const done = counted.filter((s) => s.state === "done").length;
  const total = counted.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const now = currentStepOf(steps);
  const openTasks = docs.filter((d) => d.direction === "from_family" && (d.state === "requested" || d.state === "redo")).length;

  const tag = [
    current.title,
    current.intake ? fmtIntake(current.intake) + (current.service === "study" || current.service === "language" ? " 입학" : "") : "",
    current.service === "visa" && current.visa_subclass ? `${current.visa_subclass} 비자` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  let title: string;
  let body: string;
  if (current.status === "done" || !now) {
    title = "모든 단계를 마쳤습니다";
    body = "함께해 주셔서 고맙습니다. 호주에서 필요한 일이 생기면 언제든 AusUhak 메시지로 알려 주세요.";
  } else if (current.status === "hold") {
    title = "지금은 잠시 멈춰 둔 상태입니다";
    body = now.student_note || "다시 진행할 때 제가 먼저 연락드리겠습니다.";
  } else {
    title = `지금은 ${now.label} 단계입니다`;
    body =
      now.student_note ||
      (openTasks
        ? `아래 서류 ${openTasks}가지를 올려 주시면 제가 다음 단계를 진행하겠습니다.`
        : "제가 다음 단계를 준비하고 있습니다. 해 주실 일이 생기면 여기와 AusUhak 메시지로 알려 드리겠습니다.");
  }

  return (
    <section className="mp-hero" data-pane="home" aria-label="진행 상황">
      <div className="mp-hero-text">
        <span className="mp-hero-tag">{tag}</span>
        <h1>{title}</h1>
        <p>{body}</p>
        {enrols.length ? (
          <div className="mp-hero-enrol">
            {enrols.map((e) => (
              <span key={e.id}>
                {e.provider} {e.course} · {ENROL_STATUS[e.offer_status] ?? e.offer_status}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mp-hero-prog">
        <small>전체 진행</small>
        <span className="mp-hero-count">
          {done} / {total}단계
        </span>
        <span className="mp-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="전체 진행">
          <span style={{ width: `${pct}%` }} />
        </span>
        <span className="mp-hero-count-m">
          {total}단계 중 {done}단계 완료
        </span>
      </div>
    </section>
  );
}

/* ---------- tasks ---------- */

function byDue(a: Doc, b: Doc) {
  if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
  if (a.due_date) return -1;
  if (b.due_date) return 1;
  return a.created_at.localeCompare(b.created_at);
}

export function Tasks({ docs, familyId, studentId }: { docs: Doc[]; familyId: string; studentId: string }) {
  // Upload: documents I asked for (or asked again). Read: documents I sent for the family to check.
  const tasks = docs
    .filter((d) => (d.direction === "from_family" && (d.state === "requested" || d.state === "redo")) || (d.direction === "to_family" && d.state === "requested"))
    .sort(byDue);

  return (
    <section className="mp-card" data-pane="home" aria-label="지금 해 주실 일">
      <h2>지금 해 주실 일</h2>
      {tasks.length === 0 ? (
        <p className="mp-empty">지금은 해 주실 일이 없습니다. 새로 생기면 여기와 AusUhak 메시지로 알려 드리겠습니다.</p>
      ) : (
        tasks.map((d) => {
          const upload = d.direction === "from_family";
          const redo = d.state === "redo";
          const desc = d.note || (redo ? "제가 확인해 보니 다시 받아야 할 부분이 있습니다. 새 파일로 올려 주세요." : upload ? "" : "제가 보내 드린 내용을 읽어 보시고 사실과 다른 곳만 알려 주세요.");
          return (
            <div key={d.id} className="mp-task">
              <span className={"mp-task-due" + (d.due_date ? "" : " is-none")}>{d.due_date ? `${fmtMonthDay(d.due_date)}까지` : redo ? "다시 요청" : "기한 없음"}</span>
              <span className="mp-task-body">
                <strong>{d.label}</strong>
                {desc ? <span>{desc}</span> : null}
              </span>
              <span className="mp-task-act">
                {upload ? (
                  <UploadButton docId={d.id} familyId={familyId} studentId={studentId} redo={redo} />
                ) : d.storage_path ? (
                  <a href={`/mypage/file/${d.id}`} target="_blank" rel="noopener noreferrer" className="mp-btn is-line">
                    읽어 보기
                  </a>
                ) : (
                  <span className="mp-pill is-wait">준비 중</span>
                )}
              </span>
            </div>
          );
        })
      )}
    </section>
  );
}

/* ---------- phases ---------- */

type PhaseView = { name: string; steps: Step[]; state: "done" | "now" | "next" };

function phasesOf(steps: Step[], caseDone: boolean): PhaseView[] {
  const out: PhaseView[] = [];
  for (const s of steps) {
    const name = s.phase || "진행";
    let p = out.find((x) => x.name === name);
    if (!p) out.push((p = { name, steps: [], state: "next" }));
    p.steps.push(s);
  }
  const visible = out.filter((p) => p.steps.some((s) => s.state !== "skip"));
  let found = false;
  for (const p of visible) {
    const allDone = p.steps.every((s) => s.state === "done" || s.state === "skip");
    if (caseDone || (allDone && !found)) p.state = "done";
    else if (!found) {
      p.state = "now";
      found = true;
    } else p.state = allDone ? "done" : "next";
  }
  return visible;
}

const PHASE_LABEL = { done: "완료", now: "지금 여기", next: "다음" } as const;

export function Phases({ current, steps }: { current: Case; steps: Step[] }) {
  const phases = phasesOf(steps, current.status === "done");
  // The current step's note is already the hero text.
  const nowId = currentStepOf(steps)?.id;
  return (
    <section className="mp-card" data-pane="home" aria-label="진행 단계">
      <h2 style={{ marginBottom: 16 }}>진행 단계</h2>
      <ol className="mp-phases">
        {phases.map((p) => (
          <li key={p.name} className={"mp-phase is-" + p.state} aria-current={p.state === "now" ? "step" : undefined}>
            <span className="mp-phase-top">
              <span className="mp-phase-dot" aria-hidden="true" />
              <span className="mp-phase-state">{PHASE_LABEL[p.state]}</span>
              <strong className="mp-phase-name">{p.name}</strong>
            </span>
            <ul className="mp-steps">
              {p.steps
                .filter((s) => s.state !== "skip")
                .map((s) => (
                  <li key={s.id} className={"is-" + s.state}>
                    <span>
                      {s.label}
                      {s.student_note && s.state !== "done" && s.id !== nowId ? <em>{s.student_note}</em> : null}
                    </span>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- documents ---------- */

export function FromFamily({ docs }: { docs: Doc[] }) {
  const list = docs.filter((d) => d.direction === "from_family");
  return (
    <section className="mp-card is-wide" aria-label="보내 주신 서류">
      <h2>보내 주신 서류</h2>
      {list.length === 0 ? (
        <p className="mp-empty">아직 요청드린 서류가 없습니다. 필요한 서류는 제가 한 번에 정리해서 여기에 올려 드리겠습니다.</p>
      ) : (
        list.map((d) => {
          const st = DOC_STATE[d.state] ?? DOC_STATE.requested;
          return (
            <div key={d.id} className="mp-row">
              <span className="mp-row-label">
                <span>{d.label}</span>
                {d.storage_path && d.file_name ? (
                  <a className="mp-row-file" href={`/mypage/file/${d.id}`} target="_blank" rel="noopener noreferrer">
                    {d.file_name}
                  </a>
                ) : null}
              </span>
              <span className="mp-pill" style={{ color: st.color, background: st.bg }}>
                {st.family}
              </span>
            </div>
          );
        })
      )}
    </section>
  );
}

export function ToFamily({ docs }: { docs: Doc[] }) {
  const list = docs.filter((d) => d.direction === "to_family");
  return (
    <section className="mp-card is-narrow" aria-label="제가 보내 드린 서류">
      <h2>제가 보내 드린 서류</h2>
      {list.length === 0 ? (
        <p className="mp-empty">견적서, Offer Letter, 입학허가서(CoE), 비자 승인서가 나오면 여기에서 바로 여실 수 있습니다.</p>
      ) : (
        list.map((d) => (
          <div key={d.id} className="mp-row">
            <span className="mp-row-label">{d.label}</span>
            {d.storage_path ? (
              <a className="mp-pill is-open" href={`/mypage/file/${d.id}`} target="_blank" rel="noopener noreferrer">
                열기
              </a>
            ) : (
              <span className="mp-pill is-wait">준비 중</span>
            )}
          </div>
        ))
      )}
    </section>
  );
}

/* ---------- fees ---------- */

function sumBy(list: Fee[]) {
  const m = new Map<string, number>();
  for (const f of list) m.set(f.currency, (m.get(f.currency) ?? 0) + Number(f.amount || 0));
  return m;
}

function feeStatus(f: Fee): { label: string; color: string; bg: string } {
  const green = { color: "#1F6B5C", bg: "#E5F2EE" };
  const red = { color: "#FFFFFF", bg: "#9B2C3E" };
  const grey = { color: "#5B6577", bg: "#EEF2F7" };
  if (f.kind === "payment") return { label: "입금 확인", ...green };
  if (f.kind === "external") {
    if (f.paid_at) return { label: "납부 확인", ...green };
    return f.due_date ? { label: "납부 대기", ...red } : { label: "납부 예정", ...grey };
  }
  if (f.paid_at) return { label: "완료", ...green };
  return f.due_date ? { label: "입금 대기", ...red } : { label: "청구 예정", ...grey };
}

export function Fees({ fees, cases }: { fees: Fee[]; cases: Case[] }) {
  // Remaining = charges minus what was received. Received counts either payment rows
  // or charges marked paid (whichever is larger), so recording both does not double count.
  const charges = fees.filter((f) => f.kind === "charge");
  const total = sumBy(charges);
  const paidRows = sumBy(fees.filter((f) => f.kind === "payment"));
  const paidCharges = sumBy(charges.filter((f) => f.paid_at));
  const remaining: string[] = [];
  for (const [cur, amt] of total) {
    const left = amt - Math.max(paidRows.get(cur) ?? 0, paidCharges.get(cur) ?? 0);
    if (left > 0) remaining.push(fmtMoney(left, cur));
  }
  const caseTitle = (id: string) => (cases.length > 1 ? cases.find((c) => c.id === id)?.title ?? "" : "");

  return (
    <section className="mp-card" data-pane="home" aria-label="진행 비용">
      <div className="mp-card-head">
        <h2>진행 비용</h2>
        {charges.length ? (
          <span className="mp-sub">{remaining.length ? `남은 금액 ${remaining.join(" + ")} · 입금 계좌는 제가 보내 드린 청구서에 있습니다` : "남은 금액이 없습니다"}</span>
        ) : null}
      </div>
      {fees.length === 0 ? (
        <p className="mp-empty">아직 정리된 비용이 없습니다. 견적서를 드린 뒤 여기에 올려 드리겠습니다.</p>
      ) : (
        fees.map((f) => {
          const st = feeStatus(f);
          const notes = [
            caseTitle(f.case_id),
            f.kind === "external" ? "학교·이민성에 직접 납부" : "",
            f.kind === "payment" && (f.paid_at || f.created_at) ? `${fmtMonthDay(f.paid_at || f.created_at)} 받음` : "",
            f.kind !== "payment" && !f.paid_at && f.due_date ? `${fmtMonthDay(f.due_date)}까지` : "",
          ].filter(Boolean);
          return (
            <div key={f.id} className="mp-fee">
              <span className="mp-fee-label">
                {f.label}
                {notes.length ? <small> · {notes.join(" · ")}</small> : null}
              </span>
              <span className="mp-fee-amt">{fmtMoney(f.amount, f.currency)}</span>
              <span className="mp-pill" style={{ color: st.color, background: st.bg }}>
                {st.label}
              </span>
            </div>
          );
        })
      )}
    </section>
  );
}

/* ---------- messages ---------- */

function memberWord(m: Member) {
  return m.role === "student" ? `${givenName(m.name) || "학생"} 학생` : m.relation || "보호자";
}

function viewersLine(members: Member[]) {
  const words = members.filter((m) => m.role === "student" || m.role === "parent").map(memberWord);
  if (words.length === 0) return "";
  if (words.length === 1) return `지금은 ${words[0]}만 보고 있습니다`;
  const head = words.slice(0, -1).map((w, i, a) => (i === a.length - 1 ? josa(w, "과", "와") : w + ","));
  return `${head.join(" ")} ${josa(words[words.length - 1], "이", "가")} 같이 봅니다`;
}

function authorName(m: Msg, byId: Map<string, Member>) {
  if (m.from_admin) return "AusUhak";
  const p = m.author_id ? byId.get(m.author_id) : undefined;
  if (!p) return "가족";
  if (p.role === "student") return p.name || "학생";
  const rel = p.relation || "보호자";
  return p.name ? `${p.name}(${rel})` : rel;
}

export function Messages({ msgs, members }: { msgs: Msg[]; members: Member[] }) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const line = viewersLine(members);
  const tel = SITE.phone.replace(/[^0-9]/g, "");
  return (
    <section className="mp-card is-msg" data-pane="msg" aria-label="AusUhak 메시지">
      <div className="mp-card-head">
        <h2>AusUhak 메시지</h2>
        <span className="mp-sub">
          {line ? `${line} · ` : ""}급한 일은{" "}
          <a href={SITE.kakao} target="_blank" rel="noopener noreferrer">
            카카오톡
          </a>
          이나 <a href={`tel:${tel}`} className="mp-nowrap">{SITE.phone}</a>
        </span>
      </div>
      <div className="mp-msgs">
        {msgs.length === 0 ? <p className="mp-empty">궁금한 점을 남겨 주시면 제가 직접 답을 드리겠습니다.</p> : null}
        {msgs.map((m) => (
          <div key={m.id} className={"mp-bubble" + (m.from_admin ? "" : " is-family")}>
            {m.body}
            <span className="mp-bubble-meta">
              {authorName(m, byId)} · {fmtWhen(m.created_at)}
            </span>
          </div>
        ))}
        <MessageForm />
      </div>
    </section>
  );
}

/* ---------- family code ---------- */

export function FamilyCode({ code, members, viewerRole }: { code: string; members: Member[]; viewerRole: string }) {
  if (!code) return null;
  const who = members
    .filter((m) => m.role === "student" || m.role === "parent")
    .map((m) => `${m.name || memberWord(m)}(${m.role === "student" ? "학생" : m.relation || "보호자"})`)
    .join(", ");
  return (
    <section className="mp-card" data-pane="home" aria-label="가족 연결 코드">
      <h2>가족 연결 코드</h2>
      <div className="mp-code-box">
        <span className="mp-code">{formatCode(code)}</span>
        <CopyCode code={formatCode(code)} />
      </div>
      <p className="mp-code-text">
        {viewerRole === "student"
          ? "이 코드를 부모님께 알려 주세요. 부모님이 가입할 때 넣으시면 이 마이페이지를 함께 보십니다."
          : "다른 가족분도 가입할 때 이 코드를 넣으시면 이 마이페이지를 함께 보십니다."}
        {who ? ` 지금 함께 보는 분: ${who}.` : ""}
      </p>
    </section>
  );
}
