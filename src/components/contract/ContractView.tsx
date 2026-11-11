import { STANDARD_TERMS, won, CHANNEL_KO, type ContractSnapshot } from "@/lib/crm/contract";
import "./contract.css";

export type Agreed = { at: string | null; name: string | null; relation: string | null; channel: string | null } | null;

const dateKo = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

// The contract as the signer sees it: parties, scope and fees, standard terms, differing clauses.
export default function ContractView({ snap, agreed }: { snap: ContractSnapshot; agreed?: Agreed }) {
  return (
    <>
      {agreed?.at ? (
        <div className="ct-done" role="status">
          <b>동의가 끝난 계약서입니다</b>
          <span>
            {dateKo(agreed.at)} · {agreed.name}
            {agreed.relation ? ` (${agreed.relation})` : ""} · {CHANNEL_KO[agreed.channel ?? "site"] ?? "홈페이지"}에서 동의
          </span>
        </div>
      ) : null}

      <section className="ct-card">
        <p className="ct-step">1. 계약 당사자</p>
        <h2>누가 계약하나요</h2>
        <dl className="ct-dl">
          <dt>학생</dt>
          <dd>
            {snap.student.name}
            {snap.student.minor ? " (미성년)" : ""}
          </dd>
          <dt>동의하는 분</dt>
          <dd>
            {snap.signer.name}
            <span className="ct-tag">{snap.signer.role === "parent" ? `${snap.signer.relation} · 법정대리인` : "학생 본인"}</span>
          </dd>
          <dt>유학원</dt>
          <dd>
            {snap.company.name} · 대표 {snap.company.rep}
            <br />
            <small>
              사업자등록번호 {snap.company.bizNo} · {snap.company.address}
            </small>
          </dd>
        </dl>
        {snap.student.minor ? <p className="ct-note">학생이 미성년이어서 보호자 한 분의 동의로 계약합니다. 학생은 서명하지 않습니다.</p> : null}
      </section>

      <section className="ct-card">
        <p className="ct-step">2. 맡기시는 일과 비용</p>
        <h2>
          {snap.scopeType}
          {snap.intake ? ` · ${snap.intake} 입학` : ""}
        </h2>
        <p className="ct-note" style={{ margin: "-6px 0 12px" }}>맡기시는 일: {snap.tasks.join(", ")}</p>
        <table className="ct-table">
          <thead>
            <tr>
              <th>구분</th>
              <th>내용</th>
              <th className="n">금액</th>
            </tr>
          </thead>
          <tbody>
            {snap.fees.map((f) => (
              <tr key={f.label}>
                <td>{f.label}</td>
                <td>{f.desc}</td>
                <td className="n">
                  {f.unit ? `${f.unit} ` : ""}
                  {won(f.amount)}
                </td>
              </tr>
            ))}
            <tr className="sum">
              <td colSpan={2}>제가 받는 금액 합계</td>
              <td className="n">{won(snap.total)}</td>
            </tr>
          </tbody>
        </table>
        <p className="ct-note">학교 입학신청료, 학비, 비자 신청비, 건강보험료, 번역·공증비는 학교와 호주 정부 등에 직접 내시는 비용이며 위 금액에 들어 있지 않습니다. 낼 때마다 금액과 납부처를 먼저 알려 드립니다.</p>
      </section>

      <section className="ct-card">
        <p className="ct-step">3. 약관</p>
        <h2>유학절차대행 표준약관</h2>
        <p className="ct-note" style={{ margin: "-6px 0 12px" }}>{snap.termsSource}의 조항을 그대로 씁니다.</p>
        <div className="ct-terms" tabIndex={0} aria-label="표준약관 전문">
          <p>{STANDARD_TERMS.intro}</p>
          {STANDARD_TERMS.articles.map((a) => (
            <div key={a.title}>
              <h3>{a.title}</h3>
              {a.items.map((it) => (
                <div key={it.text}>
                  <p>{it.text}</p>
                  {it.list ? (
                    <ol>
                      {it.list.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ol>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="ct-diff">
        <p className="ct-step">4. 표준약관과 다르게 정한 내용</p>
        <h2>아래 내용을 더하거나 다르게 정했습니다</h2>
        <ol>
          {snap.special.map((c) => (
            <li key={c.title}>
              {c.title}: {c.body}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
