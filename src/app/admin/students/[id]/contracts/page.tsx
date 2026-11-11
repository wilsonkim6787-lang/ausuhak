import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isUuid, todayKST } from "@/lib/crm/admin-util";
import { cancelContract, createContract } from "@/lib/crm/contract-actions";
import { CHANNEL_KO, SCOPE_TYPES, TASKS, VISA_LABELS, isMinor, won, type ContractSnapshot } from "@/lib/crm/contract";
import { ActionForm, Submit } from "@/components/admin/client";
import ContractView from "@/components/contract/ContractView";
import OfflineConsent from "@/components/contract/OfflineConsent";
import PrintButton from "@/components/contract/PrintButton";

type Row = {
  id: string;
  version: number;
  status: "sent" | "agreed" | "cancelled";
  total_amount: number;
  snapshot: ContractSnapshot;
  sent_at: string;
  agreed_at: string | null;
  agreed_name: string | null;
  agreed_relation: string | null;
  agreed_ip: string | null;
  channel: string | null;
  evidence_path: string | null;
  evidence_note: string | null;
};

const STATUS: Record<Row["status"], string> = { sent: "동의 대기", agreed: "동의 완료", cancelled: "취소됨" };
const dt = (iso: string) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

export default async function ContractsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ view?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!isUuid(id)) notFound();
  const { sb } = await requireAdmin();
  const { data: st } = await sb.from("crm_students").select("id, family_id, name_ko, birth_date").eq("id", id).maybeSingle();
  if (!st) notFound();

  const [conRes, proRes] = await Promise.all([
    sb
      .from("crm_contracts")
      .select("id, version, status, total_amount, snapshot, sent_at, agreed_at, agreed_name, agreed_relation, agreed_ip, channel, evidence_path, evidence_note")
      .eq("student_id", id)
      .order("version", { ascending: false }),
    sb.from("crm_profiles").select("id, name, relation, role").eq("family_id", st.family_id).order("created_at"),
  ]);
  const tableMissing = Boolean(conRes.error);
  const rows = (conRes.data ?? []) as Row[];
  const profiles = (proRes.data ?? []) as { id: string; name: string; relation: string | null; role: string }[];
  const today = todayKST();
  const minor = isMinor(st.birth_date as string | null, today);
  const parent = profiles.find((p) => p.role === "parent");
  const self = profiles.find((p) => p.role === "student");
  const signer = minor ? parent : (self ?? parent);
  const waiting = rows.find((r) => r.status === "sent") ?? null;
  const viewing = rows.find((r) => r.id === sp.view) ?? null;

  // Short-lived links to the proof files of consents received by KakaoTalk or email.
  const proof = new Map<string, string>();
  for (const r of rows) {
    if (!r.evidence_path) continue;
    const { data } = await sb.storage.from("crm-docs").createSignedUrl(r.evidence_path, 600);
    if (data?.signedUrl) proof.set(r.id, data.signedUrl);
  }

  if (viewing) {
    return (
      <>
        <nav aria-label="현재 위치" className="ad-crumb ct-noprint">
          <Link href="/admin/students">학생</Link> › <Link href={`/admin/students/${id}`}>{st.name_ko}</Link> › <Link href={`/admin/students/${id}/contracts`}>계약서</Link> › {viewing.version}번째
        </nav>
        <div className="ct">
          <div>
            <h1>유학 수속 계약서</h1>
            <p className="ct-lead">{st.name_ko} · {viewing.version}번째 계약서 · {STATUS[viewing.status]}</p>
          </div>
          <ContractView
            snap={viewing.snapshot}
            agreed={viewing.status === "agreed" ? { at: viewing.agreed_at, name: viewing.agreed_name, relation: viewing.agreed_relation, channel: viewing.channel } : null}
          />
          {viewing.status !== "agreed" ? (
            <section className="ct-card">
              <p className="ct-step">5. 확인과 동의</p>
              <h2>동의하실 때 확인하는 내용</h2>
              {viewing.snapshot.checks.map((c) => (
                <p key={c} className="ct-check" style={{ cursor: "default" }}>□ {c}</p>
              ))}
            </section>
          ) : null}
          <div className="ct-actions">
            <Link href={`/admin/students/${id}/contracts`} className="ct-link">목록으로</Link>
            <PrintButton label="인쇄하거나 PDF로 저장 (카카오톡·이메일로 보낼 때)" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <nav aria-label="현재 위치" className="ad-crumb">
        <Link href="/admin/students">학생</Link> › <Link href={`/admin/students/${id}`}>{st.name_ko}</Link> › 계약서
      </nav>
      <h1 className="ad-h1">{st.name_ko} 계약서{minor ? " (미성년)" : ""}</h1>
      {tableMissing ? <p className="ad-msg-err" role="alert">계약서 저장 공간이 아직 없습니다. Supabase에서 supabase/migrations/107_contracts.sql을 한 번 실행하면 이 화면을 쓸 수 있습니다.</p> : null}

      <section className="ad-card">
        <h2 className="ad-h2">새 계약서 보내기</h2>
        <p className="ad-muted" style={{ margin: 0, fontSize: 14 }}>
          금액은 적어 넣은 것만 계약서에 들어갑니다. 보내면 {minor ? "보호자" : "학생 또는 보호자"} 마이페이지에 바로 뜹니다. 비자 수속료를 넣으면 환급 없음 조항이 자동으로 들어갑니다.
          {waiting ? " 동의 대기 중인 계약서가 있으면 새 계약서로 바뀝니다." : ""}
        </p>
        <ActionForm action={createContract}>
          <input type="hidden" name="student_id" value={id} />
          <label>수속 종류
            <select name="scope_type" defaultValue={SCOPE_TYPES[0]}>{SCOPE_TYPES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label>입학 시기<input type="text" name="intake" placeholder="예: 2027년 2월" maxLength={30} /></label>
          <fieldset className="full" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 13, color: "#5B6577", fontWeight: 600, marginBottom: 6 }}>맡는 일</legend>
            <div className="ad-row" style={{ gap: 14 }}>
              {TASKS.map((t) => (
                <label key={t} className="ad-check" style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" name="tasks" value={t} defaultChecked={t === "상담" || t === "입학 지원" || t === "출국 준비 안내"} />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
          <label>기본 수속대행료 (원)<input type="text" name="fee_base" inputMode="numeric" placeholder="받지 않으면 0" required /></label>
          <label>추가 1개교당 (원)<input type="text" name="fee_extra" inputMode="numeric" placeholder="없으면 비워 두기" /></label>
          <label>비자 수속료 이름
            <select name="visa_label" defaultValue={VISA_LABELS[0]}>{VISA_LABELS.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label>비자 수속료 (원)<input type="text" name="fee_visa" inputMode="numeric" placeholder="없으면 비워 두기" /></label>
          <label>동의받을 분
            <select name="signer_role" defaultValue={minor ? "parent" : (signer?.role ?? "student")} disabled={minor}>
              <option value="student">학생 본인</option>
              <option value="parent">보호자</option>
            </select>
          </label>
          <label>동의받을 분 성함<input type="text" name="signer_name" defaultValue={signer?.name ?? (minor ? "" : st.name_ko)} maxLength={40} required /></label>
          <label>학생과의 관계<input type="text" name="signer_relation" defaultValue={signer?.relation ?? ""} placeholder="예: 어머니" maxLength={20} /></label>
          {minor && !parent ? <p className="ad-msg-err full">연결된 보호자 계정이 없습니다. 가족 연결 코드를 먼저 보호자께 보내 가입하시게 해 주세요.</p> : null}
          <Submit className="ad-btn">계약서 보내기</Submit>
        </ActionForm>
      </section>

      {waiting ? (
        <section className="ad-card">
          <h2 className="ad-h2">부득이하게 카카오톡·이메일로 동의를 받은 경우</h2>
          <p className="ad-muted" style={{ margin: 0, fontSize: 14 }}>
            동의 대기 중인 {waiting.version}번째 계약서를 <Link href={`/admin/students/${id}/contracts?view=${waiting.id}`}>열어서 PDF로 저장</Link>해 보내고, &ldquo;위 계약서 내용에 동의합니다&rdquo;라는 답을 받은 뒤 그 답장의 캡처나 메일 파일을 올려 주세요. 미성년 학생은 보호자 본인의 카카오톡이나 이메일로 받아야 합니다.
          </p>
          <OfflineConsent id={waiting.id} familyId={st.family_id} studentId={id} signerName={waiting.snapshot.signer.name} today={today} />
        </section>
      ) : null}

      <section aria-label="계약 기록">
        <h2 className="ad-h2" style={{ marginBottom: 12 }}>계약 기록</h2>
        {rows.length === 0 ? (
          <p className="ad-empty">아직 보낸 계약서가 없습니다.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr><th>계약서</th><th className="num">금액</th><th>상태</th><th>동의 기록</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/students/${id}/contracts?view=${r.id}`}>{r.version}번째 · {r.snapshot.scopeType}</Link>
                      <div className="ad-small ad-muted">{dt(r.sent_at)} 보냄 · {r.snapshot.tasks.join(", ")}</div>
                    </td>
                    <td className="num">{won(r.total_amount)}</td>
                    <td className="nowrap" style={{ fontWeight: 700, color: r.status === "agreed" ? "#1F6B5C" : r.status === "sent" ? "#9B2C3E" : "#5B6577" }}>{STATUS[r.status]}</td>
                    <td>
                      {r.status === "agreed" && r.agreed_at ? (
                        <>
                          {dt(r.agreed_at)} · {r.agreed_name}{r.agreed_relation ? ` (${r.agreed_relation})` : ""} · {CHANNEL_KO[r.channel ?? "site"]}
                          <div className="ad-small ad-muted">
                            {r.agreed_ip ? `IP ${r.agreed_ip}` : ""}
                            {proof.get(r.id) ? <a href={proof.get(r.id)} target="_blank" rel="noopener">받은 답장 보기</a> : null}
                            {r.evidence_note ? ` · ${r.evidence_note}` : ""}
                          </div>
                        </>
                      ) : r.status === "sent" ? (
                        <span className="ad-muted">{r.snapshot.signer.name} ({r.snapshot.signer.relation}) 동의 대기</span>
                      ) : null}
                    </td>
                    <td>
                      {r.status === "sent" ? (
                        <form action={cancelContract}>
                          <input type="hidden" name="id" value={r.id} />
                          <Submit className="ad-btn sm danger" confirm="이 계약서를 취소할까요? 마이페이지에서 사라집니다.">취소</Submit>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
