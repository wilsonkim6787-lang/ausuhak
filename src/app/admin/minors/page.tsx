import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { DOC_STATE, fmtDateKo } from "@/lib/crm/flows";
import {
  FORM_1229_LABEL,
  UNDER14_LABEL,
  WELFARE,
  WELFARE_ITEMS,
  addDays,
  ageOn,
  birthdayAt,
  monthKo,
  todayKST,
} from "@/lib/crm/admin-util";
import { applyWelfareChecklist, setWelfare, toggleMinorFlag } from "@/lib/crm/admin-actions";
import { Submit } from "@/components/admin/client";

type Student = {
  id: string;
  family_id: string;
  name_ko: string;
  birth_date: string;
  education: string | null;
  status: string;
  welfare_type: string | null;
  form_1229_received: boolean;
  under14_consent_received: boolean;
};

const GRAY: [string, string] = ["#5B6577", "#EEF2F7"];
const DONE: [string, string] = ["#1F6B5C", "#E5F2EE"];
const NA: [string, string] = ["#8A94A6", "#F5F7FA"];

export default async function MinorsPage() {
  const { sb } = await requireAdmin();
  const today = todayKST();
  // Born after this date = under 18 today.
  const cutoff = `${Number(today.slice(0, 4)) - 18}${today.slice(4)}`;
  const { data: stuData } = await sb
    .from("crm_students")
    .select("id, family_id, name_ko, birth_date, education, status, welfare_type, form_1229_received, under14_consent_received")
    .gt("birth_date", cutoff)
    .not("status", "in", "(done,cancelled)")
    .order("birth_date", { ascending: false });
  const students = (stuData ?? []) as Student[];
  const ids = students.map((s) => s.id);
  const famIds = [...new Set(students.map((s) => s.family_id))];

  const [caseQ, docQ, profQ, noBirthQ] = await Promise.all([
    ids.length ? sb.from("crm_cases").select("id, student_id, service, title, status").in("student_id", ids) : Promise.resolve({ data: [] }),
    ids.length ? sb.from("crm_documents").select("id, student_id, label, state").in("student_id", ids) : Promise.resolve({ data: [] }),
    famIds.length ? sb.from("crm_profiles").select("id, family_id, name, relation, role").in("family_id", famIds) : Promise.resolve({ data: [] }),
    sb.from("crm_students").select("id", { count: "exact", head: true }).is("birth_date", null).not("status", "in", "(done,cancelled)"),
  ]);
  const cases = (caseQ.data ?? []) as { id: string; student_id: string; service: string; title: string; status: string }[];
  const caseIds = cases.map((c) => c.id);
  const [enrQ, stepQ] = caseIds.length
    ? await Promise.all([
        sb.from("crm_enrolments").select("case_id, provider, course, start_date, end_date, offer_status").in("case_id", caseIds),
        sb.from("crm_steps").select("case_id, label, state").in("case_id", caseIds),
      ])
    : [{ data: [] }, { data: [] }];
  const enrols = (enrQ.data ?? []) as { case_id: string; provider: string; course: string; start_date: string | null; end_date: string | null; offer_status: string }[];
  const steps = (stepQ.data ?? []) as { case_id: string; label: string; state: string }[];
  const docs = (docQ.data ?? []) as { id: string; student_id: string; label: string; state: string }[];
  const profiles = (profQ.data ?? []) as { id: string; family_id: string; name: string; relation: string | null; role: string }[];

  return (
    <>
      <header className="ad-head">
        <div>
          <span className="ad-sub">만 18세 미만 학생 {students.length}명 · 생년월일이 없는 학생 {noBirthQ.count ?? 0}명은 여기에 나오지 않습니다</span>
          <h1 className="ad-h1">미성년 학생</h1>
        </div>
      </header>

      {students.length === 0 ? <p className="ad-empty">진행 중인 미성년 학생이 없습니다.</p> : null}

      {students.map((st) => {
        const age = ageOn(st.birth_date, today);
        const adult = birthdayAt(st.birth_date, 18);
        const under14 = age < 14;
        const myCases = cases.filter((c) => c.student_id === st.id && c.status !== "cancelled");
        const caseIdSet = new Set(myCases.map((c) => c.id));
        const studyCases = myCases.filter((c) => c.service === "study" || c.service === "language");
        const myEnrols = enrols
          .filter((e) => caseIdSet.has(e.case_id) && e.offer_status !== "withdrawn" && e.offer_status !== "rejected")
          .sort((a, b) => ((a.start_date ?? "9") < (b.start_date ?? "9") ? -1 : 1));
        const starts = myEnrols.map((e) => e.start_date).filter((x): x is string => !!x).sort();
        const ends = myEnrols.map((e) => e.end_date).filter((x): x is string => !!x).sort();
        const firstStart = starts[0];
        const lastEnd = ends[ends.length - 1];
        const myDocs = docs.filter((d) => d.student_id === st.id);
        const mySteps = steps.filter((s) => caseIdSet.has(s.case_id));
        const fam = profiles.filter((p) => p.family_id === st.family_id);
        const parents = fam.filter((p) => p.role === "parent");
        const studentLinked = fam.some((p) => p.role === "student");

        function docState(label: string): [string, string, string] {
          const d = myDocs.find((x) => x.label === label);
          if (!d) return ["요청 전", ...GRAY];
          const s = DOC_STATE[d.state];
          return [s?.admin ?? d.state, s?.color ?? GRAY[0], s?.bg ?? GRAY[1]];
        }
        function taskState(label: string): [string, string, string] {
          const s = mySteps.find((x) => x.label === label);
          if (!s) return ["단계에 없음", ...GRAY];
          if (s.state === "done") return ["완료", ...DONE];
          if (s.state === "doing") return ["진행 중", "#0E4C92", "#E7F0FB"];
          if (s.state === "skip") return ["해당 없음", ...NA];
          return ["대기", ...GRAY];
        }

        const items = st.welfare_type ? WELFARE_ITEMS[st.welfare_type] ?? [] : [];
        return (
          <section key={st.id} id={`m-${st.id}`} style={{ display: "flex", flexDirection: "column", gap: 20, scrollMarginTop: 20 }}>
            <div className="ad-card" style={{ padding: 24, gap: 12 }}>
              <div className="ad-row">
                <h2 className="ad-h1" style={{ fontSize: 30 }}><Link href={`/admin/students/${st.id}`} className="ad-plain">{st.name_ko}</Link></h2>
                <span className="ad-badge" style={{ color: "#fff", background: "#9B2C3E" }}>미성년 · 만 {age}세</span>
                <span className="ad-badge" style={{ color: "#9B2C3E", background: "#F9E9EC" }}>만 18세 되는 날 {fmtDateKo(adult)}</span>
              </div>
              <span style={{ fontSize: 15, color: "#4A5568" }}>
                {[st.education, myCases.length ? myCases.map((c) => c.title).join(" / ") : "진행 건 없음", firstStart ? `${monthKo(firstStart)} 시작 예정` : ""].filter(Boolean).join(" · ")}
              </span>
              <div className="ad-family">
                {parents.map((p) => (
                  <span key={p.id} className="ad-person"><strong>{p.relation || "보호자"} · 법정대리인</strong><span>{p.name} · 가족 초대로 연결됨</span></span>
                ))}
                <span className="ad-person"><strong>{st.name_ko} · 학생</strong><span>{studentLinked ? "마이페이지 연결됨" : "아직 가입 전"}</span></span>
                {parents.length === 0 ? <span className="ad-person"><strong>부모님</strong><span>아직 연결된 부모님 계정이 없습니다</span></span> : null}
              </div>
            </div>

            <div className="ad-cols stretch">
              <section aria-label="복지 방식" className="ad-card ad-grow">
                <h3 className="ad-h2">호주 체류 중 보호 방식 (만 18세까지 필수)</h3>
                <form action={setWelfare} role="radiogroup" aria-label="보호 방식" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 10 }}>
                  <input type="hidden" name="student_id" value={st.id} />
                  {WELFARE.map((w) => (
                    <button key={w.key} type="submit" name="welfare" value={w.key} role="radio" aria-checked={st.welfare_type === w.key} className="ad-radio">
                      <strong>{w.label}</strong>
                      <span>{w.desc}</span>
                    </button>
                  ))}
                </form>
                <div>
                  <div className="ad-check-row">
                    <span style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>{FORM_1229_LABEL}<span className="ad-tiny" style={{ display: "block", color: "#5B6577" }}>한 분만 가능하면 단독 친권 증빙 · {docState(FORM_1229_LABEL)[0]}</span></span>
                    <form action={toggleMinorFlag}>
                      <input type="hidden" name="student_id" value={st.id} />
                      <input type="hidden" name="field" value="form_1229_received" />
                      <input type="hidden" name="value" value={st.form_1229_received ? "0" : "1"} />
                      <button type="submit" className="ad-badge" style={{ minWidth: 84, border: 0, cursor: "pointer", color: (st.form_1229_received ? DONE : GRAY)[0], background: (st.form_1229_received ? DONE : GRAY)[1] }} title="눌러서 바꾸기">
                        {st.form_1229_received ? "받음" : "대기"}
                      </button>
                    </form>
                  </div>
                  <div className="ad-check-row">
                    <span style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>{UNDER14_LABEL}<span className="ad-tiny" style={{ display: "block", color: "#5B6577" }}>만 14세 미만 학생만</span></span>
                    {under14 ? (
                      <form action={toggleMinorFlag}>
                        <input type="hidden" name="student_id" value={st.id} />
                        <input type="hidden" name="field" value="under14_consent_received" />
                        <input type="hidden" name="value" value={st.under14_consent_received ? "0" : "1"} />
                        <button type="submit" className="ad-badge" style={{ minWidth: 84, border: 0, cursor: "pointer", color: (st.under14_consent_received ? DONE : GRAY)[0], background: (st.under14_consent_received ? DONE : GRAY)[1] }} title="눌러서 바꾸기">
                          {st.under14_consent_received ? "받음" : "대기"}
                        </button>
                      </form>
                    ) : <span className="ad-badge" style={{ minWidth: 84, color: NA[0], background: NA[1] }}>해당 없음</span>}
                  </div>
                  {items.map((it) => {
                    const [label, color, bg] = it.kind === "doc" ? docState(it.label) : taskState(it.label);
                    return (
                      <div key={it.label} className="ad-check-row">
                        <span style={{ flex: 1, minWidth: 0, lineHeight: 1.5 }}>{it.label}<span className="ad-tiny" style={{ display: "block", color: "#5B6577" }}>{[it.note, it.kind === "doc" ? "가족에게 받을 서류" : "제가 할 일"].filter(Boolean).join(" · ")}</span></span>
                        <span className="ad-badge" style={{ minWidth: 84, color, background: bg }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
                {st.welfare_type ? (
                  <form action={applyWelfareChecklist} className="ad-form" style={{ borderTop: "1px solid #EEF2F7", paddingTop: 14 }}>
                    <input type="hidden" name="student_id" value={st.id} />
                    {items.some((i) => i.kind === "task") ? (
                      <label>할 일을 넣을 진행 건
                        <select name="case_id" defaultValue={myCases.find((c) => c.service === "visa")?.id ?? studyCases[0]?.id ?? ""}>
                          <option value="">넣지 않음</option>
                          {myCases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </label>
                    ) : null}
                    <div><Submit className="ad-btn sm">서류 요청·단계에 넣기</Submit></div>
                    <span className="ad-tiny full">이미 있는 서류와 단계는 다시 넣지 않습니다. 서류는 학생 마이페이지 요청 목록에 바로 뜹니다.</span>
                  </form>
                ) : <p className="ad-sub">보호 방식을 고르면 받을 서류 목록이 나옵니다.</p>}
              </section>

              <section aria-label="날짜 확인" style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="ad-card" style={{ gap: 10, padding: "20px 22px" }}>
                  <h3 className="ad-h3">날짜 자동 확인</h3>
                  {myEnrols.length ? myEnrols.map((e, i) => (
                    <span key={i} className="ad-kv"><span>CoE 기간 ({e.provider})</span><span>{e.start_date ? monthKo(e.start_date) : "미정"} ~ {e.end_date ? monthKo(e.end_date) : "미정"}</span></span>
                  )) : <span className="ad-kv"><span>CoE 기간</span><span>과정 날짜 없음</span></span>}
                  <span className="ad-kv"><span>보호 필요 기간</span><span>{lastEnd && addDays(lastEnd, 7) < adult ? `${fmtDateKo(addDays(lastEnd, 7))}까지 (과정 종료 + 7일)` : `만 18세 되는 날까지 (${fmtDateKo(adult)})`}</span></span>
                  {st.welfare_type === "caaw" ? (
                    <span className="ad-kv"><span>CAAW 시작일</span><span>{firstStart ? `${fmtDateKo(addDays(firstStart, -7))} 권장 (개강 7일 전)` : "개강 7일 전 권장"}</span></span>
                  ) : null}
                  <span className="ad-kv" style={{ color: "#9B2C3E" }}><span>입국 가능일</span><span style={{ fontWeight: 800 }}>보호 시작일 이후만</span></span>
                  {firstStart && firstStart >= adult ? <span className="ad-tiny" style={{ color: "#1F6B5C" }}>개강일에는 이미 만 18세라 보호 서류가 필요 없을 수 있습니다.</span> : null}
                  <span style={{ fontSize: 12, color: "#5B6577", lineHeight: 1.6 }}>학교 2곳 이상이면 보호 기간이 끊기지 않게 이어져야 합니다. 보호 방식을 바꾸려면 학교 서면 승인이 먼저입니다.</span>
                </div>
                <div className="ad-memo" style={{ gap: 8, padding: "18px 22px" }}>
                  <strong style={{ fontSize: 16 }}>미성년이라도 가입은 똑같이</strong>
                  <span style={{ fontSize: 14, lineHeight: 1.65, color: "#4A5568" }}>학생이 직접 가입하고 부모님은 가족 초대로 연결됩니다. 미성년이면 왼쪽 서류만 추가로 받습니다. 만 14세 미만이면 부모님이 서명한 개인정보 동의서를 서류로 하나 더 받습니다.</span>
                </div>
              </section>
            </div>
          </section>
        );
      })}
    </>
  );
}
