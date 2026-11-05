import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { gmailAccount, gmailClientReady, gmailConfigured } from "@/lib/crm/gmail";
import { DOC_TYPES, whenKo } from "@/lib/crm/admin-util";
import { fileAttachment, setEmailStatus, syncMail } from "@/lib/crm/admin-actions";
import { ActionForm, Submit } from "@/components/admin/client";

type Email = {
  id: string;
  from_addr: string | null;
  subject: string | null;
  snippet: string | null;
  received_at: string | null;
  attachments: { filename?: string; mimeType?: string; size?: number }[] | null;
  matched_student_id: string | null;
  match_reason: string | null;
  status: string;
};

const TABS: [string, string][] = [["new", "새로 온 메일"], ["filed", "넣은 메일"], ["ignored", "넘긴 메일"]];

function fromName(s: string | null) {
  if (!s) return "보낸 사람 없음";
  const m = /^\s*"?([^"<]+?)"?\s*<([^>]+)>/.exec(s);
  return m ? m[1].trim() : s;
}
function fromAddr(s: string | null) {
  const m = s ? /<([^>]+)>/.exec(s) : null;
  return m ? m[1] : "";
}
function guessType(name: string, subject: string) {
  const t = `${name} ${subject}`.toLowerCase();
  if (/passport|여권/.test(t)) return "여권";
  if (/ielts|toefl|pte|trf|영어/.test(t)) return "영어 성적표";
  if (/잔고|balance|bank|재정|financ/.test(t)) return "재정 서류";
  if (/재직|employ/.test(t)) return "재직증명서";
  if (/성적|졸업|transcript|graduat|diploma/.test(t)) return "성적·졸업 증명서";
  if (/추천|reference|recommend/.test(t)) return "추천서";
  if (/home affairs|immi|request for information|grant|visa/.test(t)) return "이민성 서신";
  return "";
}
function kb(n?: number) {
  if (!n) return "";
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.max(1, Math.round(n / 1024))}KB`;
}

export default async function MailPage({ searchParams }: { searchParams: Promise<{ show?: string; sync?: string; gmail?: string }> }) {
  const sp = await searchParams;
  const { sb } = await requireAdmin();
  const show = TABS.find(([k]) => k === sp.show)?.[0] ?? "new";
  const on = await gmailConfigured();
  const account = on ? await gmailAccount() : null;
  const clientReady = gmailClientReady();

  const [mailQ, stuQ, reqQ, countQ] = await Promise.all([
    sb.from("crm_inbound_emails").select("id, from_addr, subject, snippet, received_at, attachments, matched_student_id, match_reason, status").eq("status", show).order("received_at", { ascending: false }).limit(100),
    sb.from("crm_students").select("id, name_ko, status").order("name_ko"),
    sb.from("crm_documents").select("id, student_id, label").eq("direction", "from_family").in("state", ["requested", "redo"]),
    sb.from("crm_inbound_emails").select("status"),
  ]);
  const emails = (mailQ.data ?? []) as Email[];
  const students = ((stuQ.data ?? []) as { id: string; name_ko: string; status: string }[]).filter((s) => s.status !== "cancelled");
  const stuName = new Map(students.map((s) => [s.id, s.name_ko]));
  const requests = (reqQ.data ?? []) as { id: string; student_id: string; label: string }[];
  const counts: Record<string, number> = {};
  for (const r of (countQ.data ?? []) as { status: string }[]) counts[r.status] = (counts[r.status] ?? 0) + 1;

  const syncMsg =
    sp.sync === undefined ? null
    : sp.sync === "err" ? { err: true, text: "메일을 가져오지 못했습니다. 잠시 후 다시 해 주세요." }
    : sp.sync === "off" ? { err: true, text: "Gmail 연결이 아직 설정되지 않았습니다." }
    : { err: false, text: Number(sp.sync) > 0 ? `새 메일 ${Number(sp.sync)}통을 가져왔습니다.` : "새로 온 첨부 메일이 없습니다." };

  return (
    <>
      <header className="ad-head">
        <div>
          <span className="ad-sub">{on ? `${account || "ausuhak.com@gmail.com"} 연결됨 · 최근 14일 첨부 메일` : "ausuhak.com@gmail.com"}</span>
          <h1 className="ad-h1">메일로 받은 서류</h1>
        </div>
        <div className="ad-row" style={{ alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "#4A5568", maxWidth: "30em", lineHeight: 1.6 }}>
            보낸 사람 이메일로 학생을 찾아 두었습니다. 학생과 서류 종류를 확인하고 &ldquo;서류함에 넣기&rdquo;를 누르면 학생 서류함과 마이페이지에 들어갑니다.
          </span>
          {on ? (
            <form action={syncMail}>
              <Submit className="ad-btn">지금 가져오기</Submit>
            </form>
          ) : null}
        </div>
      </header>

      {!on ? (
        <div className="ad-memo" style={{ margin: 0, fontSize: 14, color: "#8A5A1F", fontWeight: 700, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
          <span>
            {clientReady
              ? "Gmail이 아직 연결되지 않았습니다. 버튼을 누르고 ausuhak.com@gmail.com으로 허용하면 매일 아침 서류 메일을 가져옵니다."
              : "Gmail 연결 키가 아직 설정되지 않았습니다. 이미 들어온 메일은 아래에서 처리할 수 있습니다."}
          </span>
          {clientReady ? (
            <a href="/api/gmail/connect" className="ad-btn" style={{ textDecoration: "none" }}>Gmail 연결하기</a>
          ) : null}
        </div>
      ) : null}
      {sp.gmail === "ok" ? <p className="ad-msg-ok" role="status">Gmail이 연결되었습니다. 이제 &lsquo;지금 가져오기&rsquo;로 서류 메일을 가져올 수 있습니다.</p> : null}
      {sp.gmail === "err" ? <p className="ad-msg-err" role="status">Gmail 연결이 완료되지 않았습니다. 다시 눌러 주세요.</p> : null}
      {syncMsg ? <p className={syncMsg.err ? "ad-msg-err" : "ad-msg-ok"} role="status">{syncMsg.text}</p> : null}

      <nav aria-label="메일 상태" className="ad-tabs">
        {TABS.map(([k, v]) => (
          <Link key={k} href={k === "new" ? "/admin/mail" : `/admin/mail?show=${k}`} className="ad-tab sm" aria-current={show === k ? "page" : undefined}>
            {v} <small>{counts[k] ?? 0}</small>
          </Link>
        ))}
      </nav>

      <div className="ad-table-wrap">
        <table className="ad-table" style={{ minWidth: 960 }}>
          <thead>
            <tr><th scope="col">받은 메일</th><th scope="col">첨부 파일 · 학생 · 서류 종류</th><th scope="col">처리</th></tr>
          </thead>
          <tbody>
            {emails.length === 0 ? <tr><td colSpan={3} className="ad-muted">{show === "new" ? "처리할 메일이 없습니다." : "메일이 없습니다."}</td></tr> : null}
            {emails.map((e) => {
              const atts = Array.isArray(e.attachments) ? e.attachments : [];
              const matched = e.matched_student_id ? stuName.get(e.matched_student_id) : undefined;
              const reqs = e.matched_student_id ? requests.filter((r) => r.student_id === e.matched_student_id) : [];
              return (
                <tr key={e.id} style={{ background: e.status === "filed" ? "#F6FBF9" : undefined }}>
                  <td style={{ width: "28%" }}>
                    <strong style={{ display: "block" }}>{fromName(e.from_addr)}</strong>
                    {fromAddr(e.from_addr) ? <span className="ad-tiny" style={{ display: "block" }}>{fromAddr(e.from_addr)}</span> : null}
                    <span style={{ display: "block", color: "#5B6577", fontSize: 13 }}>{e.subject || "(제목 없음)"}</span>
                    <span className="ad-tiny" style={{ display: "block" }}>{whenKo(e.received_at)}</span>
                    <span style={{ display: "block", marginTop: 6, fontWeight: 700, color: matched ? "#0F1B2D" : "#9B2C3E" }}>
                      {matched ? <Link href={`/admin/students/${e.matched_student_id}`} style={{ color: "#0F1B2D" }}>{matched}</Link> : "학생을 찾지 못함"}
                    </span>
                    <span className="ad-tiny" style={{ display: "block", color: "#5B6577" }}>{matched ? e.match_reason || "" : "아래에서 학생을 골라 주세요"}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {atts.length === 0 ? <span className="ad-muted">첨부 파일 없음</span> : null}
                      {atts.map((a, i) => {
                        const guess = guessType(a.filename ?? "", e.subject ?? "");
                        return (
                          <ActionForm key={i} action={fileAttachment} className="ad-form" >
                            <input type="hidden" name="email_id" value={e.id} />
                            <input type="hidden" name="index" value={i} />
                            <span className="full" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                              <span style={{ background: "#F5F7FA", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontWeight: 700, color: "#0F1B2D", wordBreak: "break-all" }}>{a.filename || "파일"}</span>
                              <span className="ad-tiny">{kb(a.size)}</span>
                            </span>
                            <label>학생
                              <select name="student_id" defaultValue={e.matched_student_id ?? ""} required>
                                <option value="">학생 선택</option>
                                {students.map((s) => <option key={s.id} value={s.id}>{s.name_ko}</option>)}
                              </select>
                            </label>
                            <label>종류
                              <select name="kind" defaultValue={guess}>
                                <option value="">파일 이름 그대로</option>
                                {reqs.length ? (
                                  <optgroup label={`${matched}에게 요청한 서류`}>
                                    {reqs.map((r) => <option key={r.id} value={`req:${r.id}`}>{r.label}</option>)}
                                  </optgroup>
                                ) : null}
                                <optgroup label="서류 종류">
                                  {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </optgroup>
                              </select>
                            </label>
                            <div><Submit>서류함에 넣기</Submit></div>
                          </ActionForm>
                        );
                      })}
                    </div>
                  </td>
                  <td style={{ width: 150 }}>
                    <form action={setEmailStatus}>
                      <input type="hidden" name="id" value={e.id} />
                      {e.status === "new" ? (
                        <>
                          <button type="submit" name="status" value="filed" className="ad-linkbtn" style={{ display: "block", marginBottom: 8 }}>다 넣었음</button>
                          <button type="submit" name="status" value="ignored" className="ad-linkbtn gray" style={{ fontSize: 13 }}>서류 아님 · 넘기기</button>
                        </>
                      ) : (
                        <>
                          <span className="ad-small" style={{ display: "block", fontWeight: 800, color: e.status === "filed" ? "#1F6B5C" : "#5B6577", marginBottom: 8 }}>{e.status === "filed" ? "넣었습니다" : "넘긴 메일"}</span>
                          <button type="submit" name="status" value="new" className="ad-linkbtn gray" style={{ fontSize: 13 }}>새로 온 메일로 되돌리기</button>
                        </>
                      )}
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="ad-card" style={{ gap: 8, maxWidth: 860, padding: "20px 24px" }}>
        <h2 className="ad-h2" style={{ fontSize: 18 }}>학생에게 드리는 안내</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: "#4A5568" }}>
          서류는 마이페이지에 바로 올리셔도 되고, ausuhak.com@gmail.com 으로 보내셔도 됩니다. 메일 제목에 학생 이름을 적어 주시면 더 빨리 확인합니다.
        </p>
      </section>
    </>
  );
}
