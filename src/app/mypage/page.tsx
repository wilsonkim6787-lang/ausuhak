import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import Tabs from "@/components/mypage/Tabs";
import {
  FamilyCode,
  Fees,
  FromFamily,
  Hero,
  Messages,
  Phases,
  Tasks,
  ToFamily,
  type Case,
  type Doc,
  type Enrol,
  type Fee,
  type Member,
  type Msg,
  type Step,
  type Student,
} from "@/components/mypage/Sections";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function MyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { sb, user, profile } = await requireFamily();
  const familyId = profile.family_id;

  const [famRes, stuRes, memRes, msgRes, conRes] = await Promise.all([
    sb.from("crm_families").select("invite_code").eq("id", familyId).maybeSingle(),
    sb.from("crm_students").select("id, name_ko, profile_id, status").eq("family_id", familyId).order("created_at"),
    sb.from("crm_profiles").select("id, name, relation, role").eq("family_id", familyId).order("created_at"),
    sb.from("crm_messages").select("id, author_id, from_admin, body, created_at").eq("family_id", familyId).order("created_at", { ascending: false }).limit(200),
    // Contracts waiting for consent or already agreed (RLS hides cancelled ones). Empty if the table is not there yet.
    sb.from("crm_contracts").select("id, student_id, status, total_amount, sent_at, agreed_at").eq("family_id", familyId).order("sent_at", { ascending: false }),
  ]);
  const contracts = (conRes.data ?? []) as { id: string; student_id: string; status: string; total_amount: number; sent_at: string; agreed_at: string | null }[];
  const students = ((stuRes.data ?? []) as Student[]).filter((s) => s.status !== "cancelled");
  const members = (memRes.data ?? []) as Member[];
  const msgs = ((msgRes.data ?? []) as Msg[]).slice().reverse();
  const inviteCode = (famRes.data?.invite_code as string | undefined) ?? "";

  // Mark Wilson's messages as read by the family (migration 102). Errors are ignored.
  if (msgs.some((m) => m.from_admin)) await sb.rpc("crm_family_mark_read");

  const wantS = one(sp.s);
  const student =
    students.find((s) => UUID.test(wantS) && s.id === wantS) ?? students.find((s) => s.profile_id === user.id) ?? students[0] ?? null;

  let cases: Case[] = [];
  let current: Case | null = null;
  let steps: Step[] = [];
  let enrols: Enrol[] = [];
  let docs: Doc[] = [];
  let fees: Fee[] = [];

  if (student) {
    const [caseRes, docRes] = await Promise.all([
      sb.from("crm_cases").select("id, service, title, status, visa_subclass, intake, created_at").eq("student_id", student.id).order("created_at"),
      sb.from("crm_documents").select("id, case_id, direction, label, state, due_date, storage_path, file_name, note, created_at").eq("student_id", student.id).order("created_at"),
    ]);
    cases = ((caseRes.data ?? []) as Case[]).filter((c) => c.status !== "cancelled");
    docs = (docRes.data ?? []) as Doc[];
    const wantC = one(sp.c);
    current =
      cases.find((c) => UUID.test(wantC) && c.id === wantC) ??
      cases.find((c) => c.status === "active") ??
      cases.find((c) => c.status === "hold") ??
      cases[cases.length - 1] ??
      null;
    if (cases.length) {
      const [stepRes, enrolRes, feeRes] = await Promise.all([
        current ? sb.from("crm_steps").select("id, seq, phase, label, state, student_note").eq("case_id", current.id).order("seq") : Promise.resolve({ data: [] }),
        current ? sb.from("crm_enrolments").select("id, seq, provider, course, offer_status").eq("case_id", current.id).order("seq") : Promise.resolve({ data: [] }),
        // RLS already hides kind = commission; the filter below is a second guard.
        sb.from("crm_fees").select("id, case_id, label, kind, amount, currency, due_date, paid_at, created_at").in("case_id", cases.map((c) => c.id)).neq("kind", "commission").order("created_at"),
      ]);
      steps = (stepRes.data ?? []) as Step[];
      enrols = (enrolRes.data ?? []) as Enrol[];
      fees = ((feeRes.data ?? []) as Fee[]).filter((f) => f.kind !== "commission");
    }
  }

  const fileMissing = one(sp.file) === "missing";
  const query = (s: Student, c?: Case) => `/mypage?s=${s.id}${c ? `&c=${c.id}` : ""}`;

  return (
    <main className="mp-main">
      {fileMissing ? <p className="mp-notice" role="alert">파일을 열 수 없습니다. 다시 눌러 보시고, 그래도 안 되면 AusUhak 메시지로 알려 주세요.</p> : null}

      {contracts.map((c) => {
        const who = students.find((s) => s.id === c.student_id)?.name_ko ?? "";
        return c.status === "sent" ? (
          <p key={c.id} className="mp-notice" role="status">
            {who ? `${who} 학생의 ` : ""}유학 수속 계약서가 도착했습니다. <Link href={`/mypage/contract/${c.id}`}>내용을 확인하고 동의하기</Link>
          </p>
        ) : null;
      })}

      {students.length > 1 ? (
        <nav className="mp-switch" aria-label="학생 고르기">
          <span className="mp-switch-label">학생</span>
          {students.map((s) => (
            <Link key={s.id} href={query(s)} className="mp-chip" aria-current={s.id === student?.id ? "page" : undefined}>
              {s.name_ko}
            </Link>
          ))}
        </nav>
      ) : null}
      {student && cases.length > 1 ? (
        <nav className="mp-switch" aria-label="진행 건 고르기">
          <span className="mp-switch-label">진행 건</span>
          {cases.map((c) => (
            <Link key={c.id} href={query(student, c)} className="mp-chip" aria-current={c.id === current?.id ? "page" : undefined}>
              {c.title}
            </Link>
          ))}
        </nav>
      ) : null}

      <Tabs>
        <Hero student={student} current={current} steps={steps} enrols={enrols} docs={docs} />
        {student ? <Tasks docs={docs} familyId={familyId} studentId={student.id} /> : null}
        {current && steps.length ? <Phases current={current} steps={steps} /> : null}
        {student ? (
          <div className="mp-cols" data-pane="docs">
            <FromFamily docs={docs} />
            <ToFamily docs={docs} />
          </div>
        ) : null}
        {cases.length ? <Fees fees={fees} cases={cases} /> : null}
        <Messages msgs={msgs} members={members} />
        {contracts.some((c) => c.status === "agreed") ? (
          <section className="mp-card" data-pane="docs" aria-label="계약서">
            <h2>계약서</h2>
            {contracts
              .filter((c) => c.status === "agreed")
              .map((c) => (
                <p key={c.id} className="mp-empty">
                  <Link href={`/mypage/contract/${c.id}`}>
                    {students.find((s) => s.id === c.student_id)?.name_ko ?? ""} 유학 수속 계약서
                  </Link>{" "}
                  · {c.agreed_at ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "long" }).format(new Date(c.agreed_at)) : ""} 동의
                </p>
              ))}
          </section>
        ) : null}
        <FamilyCode code={inviteCode} members={members} viewerRole={profile.role} />
      </Tabs>
    </main>
  );
}
