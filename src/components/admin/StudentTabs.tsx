// Tab sections of the admin student page (server components).
import Link from "next/link";
import { DOC_STATE, ENROL_STATUS, FEE_KIND, fmtMoney, serviceOf } from "@/lib/crm/flows";
import { DOC_TYPES, shortDate, whenKo } from "@/lib/crm/admin-util";
import {
  addEnrolment,
  addFee,
  deleteDoc,
  deleteEnrolment,
  deleteFee,
  recordUpload,
  requestDoc,
  sendMessage,
  setDocState,
  updateDoc,
  updateEnrolment,
  updateFee,
} from "@/lib/crm/admin-actions";
import { ActionForm, Submit, UploadToFamily } from "./client";

export type CaseRow = { id: string; service: string; title: string; status: string };
export type DocRow = {
  id: string;
  case_id: string | null;
  direction: string;
  label: string;
  state: string;
  due_date: string | null;
  storage_path: string | null;
  file_name: string | null;
  source: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};
export type EnrolRow = {
  id: string;
  case_id: string;
  seq: number;
  provider: string;
  course: string;
  cricos_code: string | null;
  start_date: string | null;
  end_date: string | null;
  offer_status: string;
  coe_no: string | null;
};
export type FeeRow = {
  id: string;
  case_id: string;
  label: string;
  kind: string;
  amount: number | string;
  currency: string;
  due_date: string | null;
  paid_at: string | null;
  note: string | null;
};
export type MsgRow = { id: string; author_id: string | null; from_admin: boolean; body: string; created_at: string; read_by_family: boolean };

function CaseSelect({ cases, name = "case_id", value, required, allowNone }: { cases: CaseRow[]; name?: string; value?: string | null; required?: boolean; allowNone?: boolean }) {
  return (
    <select name={name} defaultValue={value ?? ""} required={required}>
      {allowNone || !value ? <option value="">{allowNone ? "연결 안 함" : "진행 건 선택"}</option> : null}
      {cases.map((c) => (
        <option key={c.id} value={c.id}>{serviceOf(c.service).label} · {c.title}</option>
      ))}
    </select>
  );
}

function CaseBadge({ c }: { c?: CaseRow }) {
  if (!c) return <span className="ad-tiny">-</span>;
  const s = serviceOf(c.service);
  return <span className="ad-badge" style={{ color: s.color, background: s.bg }} title={c.title}>{s.label}</span>;
}

// ---------- documents ----------
export function DocsTab({ studentId, familyId, docs, cases }: { studentId: string; familyId: string; docs: DocRow[]; cases: CaseRow[] }) {
  const fromFamily = docs.filter((d) => d.direction === "from_family");
  const toFamily = docs.filter((d) => d.direction === "to_family");
  const got = fromFamily.filter((d) => d.state !== "requested" && d.state !== "redo").length;
  return (
    <section className="ad-cols">
      <div className="ad-card ad-grow" style={{ gap: 0 }}>
        <div className="ad-between" style={{ paddingBottom: 12 }}>
          <h2 className="ad-h2">서류</h2>
          <span className="ad-sub">받은 서류 {got}/{fromFamily.length}</span>
        </div>
        {fromFamily.length === 0 ? <p className="ad-empty" style={{ borderTop: "1px solid #EEF2F7" }}>아직 요청한 서류가 없습니다. 아래에서 요청하면 학생 마이페이지에 바로 뜹니다.</p> : null}
        {fromFamily.map((d) => {
          const st = DOC_STATE[d.state] ?? DOC_STATE.requested;
          const meta = [d.note, d.due_date ? `기한 ${shortDate(d.due_date)}` : "", d.file_name ? `파일 ${d.file_name}` : "", d.source === "email" ? "메일로 받음" : ""].filter(Boolean).join(" · ");
          return (
            <div key={d.id} className="ad-list-row">
              <span style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{d.label}</span>
                <span className="ad-small ad-muted">{meta || " "}</span>
              </span>
              <span className="ad-badge" style={{ minWidth: 68, color: st.color, background: st.bg }}>{st.admin}</span>
              <span style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {d.storage_path ? <a href={`/admin/docs/${d.id}`} target="_blank" rel="noopener" style={{ fontSize: 14, fontWeight: 700 }}>보기</a> : null}
                <form action={setDocState} style={{ display: "flex", gap: 10 }}>
                  <input type="hidden" name="id" value={d.id} />
                  {d.state !== "ok" && d.storage_path ? <button type="submit" name="state" value="ok" className="ad-linkbtn">확인 완료</button> : null}
                  {d.state !== "redo" && d.state !== "requested" ? <button type="submit" name="state" value="redo" className="ad-linkbtn red">다시 요청</button> : null}
                  {(d.state === "requested" || d.state === "redo") && !d.storage_path ? <button type="submit" name="state" value="received" className="ad-linkbtn">받음 표시</button> : null}
                  {d.state === "received" ? <button type="submit" name="state" value="reviewing" className="ad-linkbtn">검토 중</button> : null}
                </form>
              </span>
              <details className="ad-inline-details" style={{ flexBasis: "auto" }}>
                <summary>고치기</summary>
                <div>
                  <form action={updateDoc} className="ad-form">
                    <input type="hidden" name="id" value={d.id} />
                    <label>서류 이름<input type="text" name="label" defaultValue={d.label} maxLength={160} required /></label>
                    <label>기한<input type="date" name="due_date" defaultValue={d.due_date ?? ""} /></label>
                    <label className="full">안내 (학생에게 보임)<input type="text" name="note" defaultValue={d.note ?? ""} maxLength={500} /></label>
                    <div className="ad-row full"><Submit>저장</Submit></div>
                  </form>
                  <form action={deleteDoc} style={{ marginTop: 8 }}>
                    <input type="hidden" name="id" value={d.id} />
                    <Submit className="ad-btn sm danger" confirm="이 서류를 지울까요? 올라온 파일도 같이 지워집니다.">지우기</Submit>
                  </form>
                </div>
              </details>
            </div>
          );
        })}
        <div style={{ borderTop: "1px solid #EEF2F7", paddingTop: 16, marginTop: 4, display: "flex", flexDirection: "column", gap: 10 }}>
          <h3 className="ad-h3">서류 요청</h3>
          <ActionForm action={requestDoc} resetOnOk>
            <input type="hidden" name="student_id" value={studentId} />
            <label>서류 이름
              <input type="text" name="label" list="doc-types" maxLength={160} required placeholder="예: 재직증명서 (영문)" />
            </label>
            <datalist id="doc-types">{DOC_TYPES.map((t) => <option key={t} value={t} />)}</datalist>
            <label>기한<input type="date" name="due_date" /></label>
            {cases.length ? <label>진행 건<CaseSelect cases={cases} allowNone /></label> : null}
            <label className="full">안내 (학생에게 보임)<input type="text" name="note" maxLength={500} placeholder="예: 직위·근무 기간·월급이 들어가게 회사에서 영문으로 받아 주세요" /></label>
            <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}><Submit>요청하기</Submit></div>
          </ActionForm>
        </div>
      </div>

      <div className="ad-card" style={{ flex: "1 1 300px", gap: 12 }}>
        <h2 className="ad-h2">제가 보내는 서류</h2>
        <span className="ad-sub" style={{ lineHeight: 1.6 }}>올리면 학생 마이페이지에 바로 뜹니다.</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {toFamily.length === 0 ? <span className="ad-sub">아직 보낸 서류가 없습니다.</span> : null}
          {toFamily.map((d) => (
            <div key={d.id} className="ad-sent">
              <span>{d.storage_path ? <a href={`/admin/docs/${d.id}`} target="_blank" rel="noopener">{d.label}</a> : d.label}</span>
              <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: "#1F6B5C", fontWeight: 700 }}>보냄 {shortDate(d.created_at.slice(0, 10))}</span>
                <form action={deleteDoc}>
                  <input type="hidden" name="id" value={d.id} />
                  <Submit className="ad-linkbtn gray" confirm="보낸 서류를 지울까요? 학생 화면에서도 사라집니다.">지우기</Submit>
                </form>
              </span>
            </div>
          ))}
        </div>
        <UploadToFamily familyId={familyId} studentId={studentId} cases={cases.map((c) => ({ id: c.id, title: c.title }))} record={recordUpload} />
      </div>
    </section>
  );
}

// ---------- schools / enrolments ----------
function EnrolFields({ e, cases }: { e?: EnrolRow; cases: CaseRow[] }) {
  return (
    <>
      <label>진행 건<CaseSelect cases={cases} value={e?.case_id} required /></label>
      <label>순서<input type="number" name="seq" min={1} max={20} defaultValue={e?.seq ?? 1} /></label>
      <label>학교<input type="text" name="provider" defaultValue={e?.provider ?? ""} maxLength={160} required placeholder="UTS" /></label>
      <label>과정<input type="text" name="course" defaultValue={e?.course ?? ""} maxLength={200} required placeholder="Bachelor of Nursing" /></label>
      <label>CRICOS<input type="text" name="cricos_code" defaultValue={e?.cricos_code ?? ""} maxLength={20} /></label>
      <label>시작일<input type="date" name="start_date" defaultValue={e?.start_date ?? ""} /></label>
      <label>종료일<input type="date" name="end_date" defaultValue={e?.end_date ?? ""} /></label>
      <label>결과
        <select name="offer_status" defaultValue={e?.offer_status ?? "planned"}>
          {Object.entries(ENROL_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label>CoE 번호<input type="text" name="coe_no" defaultValue={e?.coe_no ?? ""} maxLength={40} /></label>
    </>
  );
}

const ENROL_COLOR: Record<string, [string, string]> = {
  planned: ["#5B6577", "#EEF2F7"],
  applied: ["#5B6577", "#EEF2F7"],
  conditional: ["#0E4C92", "#E7F0FB"],
  unconditional: ["#0E4C92", "#E7F0FB"],
  accepted: ["#1F6B5C", "#E5F2EE"],
  coe: ["#1F6B5C", "#E5F2EE"],
  withdrawn: ["#8A94A6", "#F5F7FA"],
  rejected: ["#9B2C3E", "#F9E9EC"],
};

export function AppsTab({ enrols, cases }: { enrols: EnrolRow[]; cases: CaseRow[] }) {
  const caseById = new Map(cases.map((c) => [c.id, c]));
  const sorted = [...enrols].sort((a, b) => (a.case_id === b.case_id ? a.seq - b.seq : (a.start_date ?? "9") < (b.start_date ?? "9") ? -1 : 1));
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="ad-table-wrap">
        <table className="ad-table" style={{ minWidth: 760 }}>
          <thead>
            <tr><th scope="col">학교·과정</th><th scope="col">진행 건</th><th scope="col">기간</th><th scope="col">결과</th><th scope="col">CoE</th></tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? <tr><td colSpan={5} className="ad-muted">아직 지원 학교가 없습니다.</td></tr> : null}
            {sorted.map((e) => {
              const col = ENROL_COLOR[e.offer_status] ?? ENROL_COLOR.planned;
              return (
                <tr key={e.id}>
                  <td>
                    <b>{e.provider} · {e.course}</b>
                    {e.cricos_code ? <span className="ad-tiny" style={{ display: "block" }}>CRICOS {e.cricos_code}</span> : null}
                    <details className="ad-inline-details">
                      <summary>고치기</summary>
                      <div>
                        <ActionForm action={updateEnrolment}>
                          <input type="hidden" name="id" value={e.id} />
                          <EnrolFields e={e} cases={cases} />
                          <div className="ad-row full">
                            <Submit>저장</Submit>
                          </div>
                        </ActionForm>
                        <form action={deleteEnrolment} style={{ marginTop: 8 }}>
                          <input type="hidden" name="id" value={e.id} />
                          <Submit className="ad-btn sm danger" confirm="이 학교·과정을 지울까요?">지우기</Submit>
                        </form>
                      </div>
                    </details>
                  </td>
                  <td><CaseBadge c={caseById.get(e.case_id)} /> <span className="ad-small ad-muted">{caseById.get(e.case_id)?.title}</span></td>
                  <td className="nowrap">{e.start_date ? shortDate(e.start_date) : "미정"}{e.end_date ? ` ~ ${shortDate(e.end_date)}` : ""}</td>
                  <td><span className="ad-badge" style={{ color: col[0], background: col[1] }}>{ENROL_STATUS[e.offer_status] ?? e.offer_status}</span></td>
                  <td className="nowrap">{e.coe_no ?? ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {cases.length ? (
        <details className="ad-details">
          <summary>학교·과정 추가 (패키지는 순서 1, 2로 나눠 넣기)</summary>
          <div>
            <ActionForm action={addEnrolment} resetOnOk>
              <EnrolFields cases={cases} />
              <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}><Submit>추가</Submit></div>
            </ActionForm>
          </div>
        </details>
      ) : <p className="ad-sub">진행 건을 먼저 만들면 학교·과정을 넣을 수 있습니다.</p>}
    </section>
  );
}

// ---------- fees ----------
function feeState(f: FeeRow): [string, string, string] {
  if (f.kind === "payment") return ["받음", "#1F6B5C", "#E5F2EE"];
  if (f.kind === "external") return f.paid_at ? ["납부 확인", "#1F6B5C", "#E5F2EE"] : ["납부 전", "#5B6577", "#EEF2F7"];
  if (f.kind === "commission") return f.paid_at ? ["받음", "#1F6B5C", "#E5F2EE"] : ["청구 예정", "#5B6577", "#EEF2F7"];
  if (f.paid_at) return ["완료", "#1F6B5C", "#E5F2EE"];
  return f.due_date ? ["청구함", "#9B2C3E", "#F9E9EC"] : ["청구 예정", "#5B6577", "#EEF2F7"];
}

function FeeFields({ f, cases, commission }: { f?: FeeRow; cases: CaseRow[]; commission?: boolean }) {
  return (
    <>
      <label>진행 건<CaseSelect cases={cases} value={f?.case_id} required /></label>
      <label>종류
        <select name="kind" defaultValue={f?.kind ?? (commission ? "commission" : "charge")}>
          {Object.entries(FEE_KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label>항목<input type="text" name="label" defaultValue={f?.label ?? ""} maxLength={160} required /></label>
      <label>금액<input type="text" name="amount" inputMode="decimal" defaultValue={f ? String(f.amount) : ""} required /></label>
      <label>통화
        <select name="currency" defaultValue={f?.currency ?? "KRW"}>
          {["KRW", "AUD", "USD", "PHP"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>기한<input type="date" name="due_date" defaultValue={f?.due_date ?? ""} /></label>
      <label>납부·입금일<input type="date" name="paid_at" defaultValue={f?.paid_at ?? ""} /></label>
      <label className="full">메모 (커미션이 아니면 학생에게 보임)<input type="text" name="note" defaultValue={f?.note ?? ""} maxLength={300} /></label>
    </>
  );
}

function FeeEdit({ f, cases }: { f: FeeRow; cases: CaseRow[] }) {
  return (
    <details className="ad-inline-details">
      <summary>고치기</summary>
      <div>
        <ActionForm action={updateFee}>
          <input type="hidden" name="id" value={f.id} />
          <FeeFields f={f} cases={cases} />
          <div className="ad-row full"><Submit>저장</Submit></div>
        </ActionForm>
        <form action={deleteFee} style={{ marginTop: 8 }}>
          <input type="hidden" name="id" value={f.id} />
          <Submit className="ad-btn sm danger" confirm="이 비용 항목을 지울까요?">지우기</Submit>
        </form>
      </div>
    </details>
  );
}

function sumBy(rows: FeeRow[]) {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.currency, (m.get(r.currency) ?? 0) + Number(r.amount));
  return m;
}

export function PayTab({ fees, cases }: { fees: FeeRow[]; cases: CaseRow[] }) {
  const caseById = new Map(cases.map((c) => [c.id, c]));
  const visible = fees.filter((f) => f.kind !== "commission");
  const commission = fees.filter((f) => f.kind === "commission");
  const charged = sumBy(fees.filter((f) => f.kind === "charge"));
  const paid = sumBy(fees.filter((f) => f.kind === "payment"));
  const currencies = [...new Set([...charged.keys(), ...paid.keys()])];
  return (
    <section className="ad-cols stretch">
      <div className="ad-card ad-grow" style={{ flexBasis: 560, gap: 12 }}>
        <div className="ad-between">
          <h2 className="ad-h2">진행 비용</h2>
          <span className="ad-sub">학생·부모님 화면에도 그대로 보입니다</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="ad-table" style={{ minWidth: 620 }}>
            <thead>
              <tr><th scope="col">진행 건</th><th scope="col">항목</th><th scope="col" className="num">금액</th><th scope="col">기한</th><th scope="col">상태</th></tr>
            </thead>
            <tbody>
              {visible.length === 0 ? <tr><td colSpan={5} className="ad-muted">아직 비용 항목이 없습니다.</td></tr> : null}
              {visible.map((f) => {
                const [label, color, bg] = feeState(f);
                return (
                  <tr key={f.id}>
                    <td><CaseBadge c={caseById.get(f.case_id)} /></td>
                    <td>
                      <b>{f.label}</b>
                      <span style={{ display: "block", fontSize: 12, color: "#5B6577" }}>{[FEE_KIND[f.kind] && f.kind !== "charge" ? FEE_KIND[f.kind] : "", f.note].filter(Boolean).join(" · ") || " "}</span>
                      <FeeEdit f={f} cases={cases} />
                    </td>
                    <td className="num">{fmtMoney(f.amount, f.currency)}</td>
                    <td className="nowrap">{f.paid_at ? shortDate(f.paid_at) : f.due_date ? shortDate(f.due_date) : ""}</td>
                    <td><span className="ad-badge wide" style={{ color, background: bg }}>{label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {cases.length ? (
          <details className="ad-details">
            <summary>비용 항목 추가</summary>
            <div>
              <ActionForm action={addFee} resetOnOk>
                <FeeFields cases={cases} />
                <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}><Submit>추가</Submit></div>
              </ActionForm>
            </div>
          </details>
        ) : <p className="ad-sub">진행 건을 먼저 만들면 비용을 넣을 수 있습니다.</p>}
      </div>

      <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="ad-card" style={{ gap: 10, padding: "20px 22px" }}>
          <h3 className="ad-h3">합계</h3>
          {currencies.length === 0 ? <span className="ad-sub">청구한 진행 비용이 없습니다.</span> : null}
          {currencies.map((cur) => {
            const c = charged.get(cur) ?? 0;
            const p = paid.get(cur) ?? 0;
            return (
              <div key={cur} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="ad-kv" style={{ fontSize: 15 }}><span>AusUhak 진행 비용</span><span style={{ fontWeight: 800 }}>{fmtMoney(c, cur)}</span></span>
                <span className="ad-kv" style={{ fontSize: 15 }}><span>받은 금액</span><span style={{ fontWeight: 800, color: "#1F6B5C" }}>{fmtMoney(p, cur)}</span></span>
                <span className="ad-kv" style={{ fontSize: 15, borderTop: "1px solid #EEF2F7", paddingTop: 10 }}><span>남은 금액</span><span style={{ fontWeight: 800, color: c - p > 0 ? "#9B2C3E" : "#1F6B5C" }}>{fmtMoney(c - p, cur)}</span></span>
              </div>
            );
          })}
          <span style={{ fontSize: 13, color: "#5B6577", lineHeight: 1.6 }}>학비·보험·비자 신청비는 학교와 기관에 직접 내는 돈이라 납부 확인만 표시합니다.</span>
        </div>
        <div className="ad-memo" style={{ gap: 8, padding: "18px 22px" }}>
          <span className="ad-row" style={{ gap: 8, alignItems: "baseline" }}><strong style={{ fontSize: 16 }}>학교 커미션</strong><span style={{ fontSize: 12, color: "#8A5A1F", fontWeight: 800 }}>나만 보기 · 학생·학부모에게 안 보임</span></span>
          {commission.length === 0 ? <span className="ad-sub">넣은 커미션 항목이 없습니다.</span> : null}
          {commission.map((f) => (
            <div key={f.id} style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 14 }}>
              <span className="ad-kv"><span>{f.label}</span><span>{fmtMoney(f.amount, f.currency)}</span></span>
              <span className="ad-tiny">{f.paid_at ? `받음 ${shortDate(f.paid_at)}` : f.due_date ? `청구 예정 · ${shortDate(f.due_date)}` : "청구 예정"}{f.note ? ` · ${f.note}` : ""}</span>
              <FeeEdit f={f} cases={cases} />
            </div>
          ))}
          {cases.length ? (
            <details className="ad-inline-details">
              <summary>커미션 추가</summary>
              <div>
                <ActionForm action={addFee} resetOnOk>
                  <FeeFields cases={cases} commission />
                  <div className="full"><Submit>추가</Submit></div>
                </ActionForm>
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ---------- messages ----------
export function MsgsTab({ familyId, msgs, names }: { familyId: string; msgs: MsgRow[]; names: Map<string, string> }) {
  return (
    <section className="ad-card" style={{ maxWidth: 860 }}>
      <span className="ad-sub">AusUhak 메시지 · 학생과 부모님이 같이 봅니다</span>
      {msgs.length === 0 ? <p className="ad-empty">아직 주고받은 메시지가 없습니다.</p> : null}
      {msgs.map((m) => (
        <div key={m.id} className={`ad-bubble ${m.from_admin ? "me" : "them"}`}>
          {m.body}
          <small>
            {m.from_admin ? "AusUhak" : (m.author_id && names.get(m.author_id)) || "가족"} · {whenKo(m.created_at)}
            {m.from_admin ? (m.read_by_family ? " · 읽음" : "") : ""}
          </small>
        </div>
      ))}
      <ActionForm action={sendMessage} resetOnOk className="ad-form">
        <input type="hidden" name="family_id" value={familyId} />
        <label className="full" style={{ fontSize: 14, fontWeight: 700, color: "#0F1B2D" }}>답장
          <textarea name="body" rows={3} maxLength={4000} required placeholder="학생과 학부모에게 같이 보입니다" />
        </label>
        <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}><Submit className="ad-btn">보내기</Submit></div>
      </ActionForm>
    </section>
  );
}

export function TabLinks({ base, tab }: { base: string; tab: string }) {
  const T: [string, string][] = [["docs", "서류"], ["apps", "지원 학교"], ["pay", "진행 비용"], ["msgs", "메시지"]];
  return (
    <nav id="tabs" aria-label="학생 정보" className="ad-tabs">
      {T.map(([k, v]) => (
        <Link key={k} href={`${base}${base.includes("?") ? "&" : "?"}tab=${k}#tabs`} scroll={false} className="ad-tab sm" aria-current={tab === k ? "page" : undefined}>{v}</Link>
      ))}
    </nav>
  );
}
