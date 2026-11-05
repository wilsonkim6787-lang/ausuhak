import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { whenKo } from "@/lib/crm/admin-util";
import { registerConsult, saveConsultMemo, setConsultStatus } from "@/lib/crm/admin-actions";
import { ActionForm, Submit } from "@/components/admin/client";

type Consult = {
  id: string | number;
  name: string | null;
  contact: string | null;
  topic: string | null;
  message: string | null;
  source: string | null;
  status: string | null;
  admin_memo: string | null;
  created_at: string;
  student_id: string | null;
};

const STATUS: Record<string, [string, string, string]> = {
  new: ["새 신청", "#9B2C3E", "#F9E9EC"],
  contacted: ["답장함", "#0E4C92", "#E7F0FB"],
  closed: ["마무리", "#5B6577", "#EEF2F7"],
};
const REGISTERED: [string, string, string] = ["학생 등록", "#1F6B5C", "#E5F2EE"];

const SOURCE: Record<string, string> = { web: "사이트", home: "내 상황 보내기", medical: "의대 사이트 상담 예약", kakao: "카카오톡" };

// The public form stores "항목: 값" lines; split them into facts and free text.
function parseMessage(msg: string) {
  const facts: { k: string; v: string }[] = [];
  const rest: string[] = [];
  for (const line of msg.split("\n")) {
    const m = /^([^:\n]{1,30}):\s?(.*)$/.exec(line.trim());
    if (m && m[2].length <= 120 && !/(문의|내용|질문|메시지|상황)/.test(m[1])) facts.push({ k: m[1], v: m[2] });
    else if (m) rest.push(m[2]);
    else if (line.trim()) rest.push(line.trim());
  }
  return { facts, text: rest.join("\n") };
}

function status(c: Consult) {
  if (c.student_id) return REGISTERED;
  return STATUS[c.status ?? "new"] ?? STATUS.new;
}

export default async function ConsultsPage({ searchParams }: { searchParams: Promise<{ id?: string; show?: string }> }) {
  const sp = await searchParams;
  const { sb } = await requireAdmin();
  const showAll = sp.show === "all";
  let query = sb
    .from("consult_requests")
    .select("id, name, contact, topic, message, source, status, admin_memo, created_at, student_id")
    .order("created_at", { ascending: false })
    .limit(100);
  if (!showAll) query = query.neq("status", "closed");
  const { data, error } = await query;
  const items = (data ?? []) as Consult[];
  const sel = items.find((c) => String(c.id) === sp.id) ?? items[0] ?? null;
  const parsed = sel ? parseMessage(sel.message ?? "") : null;

  return (
    <>
      <header className="ad-head">
        <div>
          <span className="ad-sub">사이트 &ldquo;내 상황 보내기&rdquo;와 의대 사이트 상담 예약으로 들어온 신청</span>
          <h1 className="ad-h1">상담 신청</h1>
        </div>
        <Link href={showAll ? "/admin/consults" : "/admin/consults?show=all"} className="ad-small">{showAll ? "마무리한 신청 숨기기" : "마무리한 신청도 보기"}</Link>
      </header>

      {error ? <p className="ad-msg-err">상담 신청을 불러오지 못했습니다.</p> : null}
      {items.length === 0 && !error ? <p className="ad-empty">새 상담 신청이 없습니다.</p> : null}

      {sel && parsed ? (
        <div className="ad-cols">
          <section aria-label="신청 목록" style={{ flex: "1 1 340px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((c) => {
              const [label, color, bg] = status(c);
              const summary = [c.topic, (c.message ?? "").split("\n").find((l) => !/^(이름|연락처)/.test(l))?.replace(/^[^:]{1,30}:\s?/, "")].filter(Boolean).join(" · ");
              return (
                <Link key={String(c.id)} href={`/admin/consults?id=${c.id}${showAll ? "&show=all" : ""}`} scroll={false} className="ad-pickcard" aria-current={sel.id === c.id ? "true" : undefined}>
                  <span className="ad-between" style={{ alignItems: "center" }}>
                    <strong style={{ fontSize: 16 }}>{c.name || "이름 없음"}</strong>
                    <span className="ad-badge" style={{ color, background: bg, padding: "3px 9px" }}>{label}</span>
                  </span>
                  <span style={{ fontSize: 14, color: "#4A5568" }}>{summary.length > 70 ? summary.slice(0, 70) + "…" : summary || " "}</span>
                  <span className="ad-tiny" style={{ color: "#5B6577" }}>{whenKo(c.created_at)} · {SOURCE[c.source ?? ""] ?? c.source ?? "사이트"}</span>
                </Link>
              );
            })}
          </section>

          <section aria-label="신청 내용" className="ad-card ad-grow" style={{ padding: 24, gap: 18 }}>
            <div className="ad-between" style={{ alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h2 className="ad-h2" style={{ fontSize: 24 }}>{sel.name || "이름 없음"}</h2>
                <span className="ad-sub">{whenKo(sel.created_at)} · {SOURCE[sel.source ?? ""] ?? sel.source ?? "사이트"} · 연락처: {sel.contact || "없음"}</span>
              </div>
              <div className="ad-row">
                {sel.student_id ? (
                  <Link href={`/admin/students/${sel.student_id}`} className="ad-btn sm" style={{ minHeight: 44 }}>학생 화면 열기</Link>
                ) : (
                  <form action={registerConsult}>
                    <input type="hidden" name="id" value={String(sel.id)} />
                    <Submit className="ad-btn sm" confirm="이 신청으로 학생과 가족을 새로 만들까요?">학생으로 등록</Submit>
                  </form>
                )}
              </div>
            </div>

            <form action={setConsultStatus} className="ad-row" aria-label="상태">
              <input type="hidden" name="id" value={String(sel.id)} />
              <span className="ad-small ad-muted" style={{ fontWeight: 700 }}>상태</span>
              {Object.entries(STATUS).map(([k, [label]]) => (
                <button key={k} type="submit" name="status" value={k} className={`ad-btn sm ${(sel.status ?? "new") === k ? "" : "ghost"}`} aria-pressed={(sel.status ?? "new") === k}>{label}</button>
              ))}
            </form>

            {parsed.facts.length ? (
              <dl className="ad-facts">
                {sel.topic ? <div><dt>관심 분야</dt><dd>{sel.topic}</dd></div> : null}
                {parsed.facts.filter((f) => !/^(이름|연락처)/.test(f.k)).map((f, i) => (
                  <div key={i}><dt>{f.k}</dt><dd>{f.v}</dd></div>
                ))}
              </dl>
            ) : null}
            {parsed.text ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="ad-small ad-muted" style={{ fontWeight: 700 }}>보낸 내용</span>
                <p className="ad-pre" style={{ margin: 0, fontSize: 15, lineHeight: 1.75, maxWidth: "40em" }}>{parsed.text}</p>
              </div>
            ) : null}

            <div className="ad-memo" style={{ padding: "14px 16px", gap: 8 }}>
              <span className="ad-row" style={{ alignItems: "baseline" }}><strong style={{ fontSize: 15 }}>상담 메모</strong><span className="ad-memo-tag">학생·학부모에게 안 보임</span></span>
              <ActionForm action={saveConsultMemo}>
                <input type="hidden" name="id" value={String(sel.id)} />
                <textarea name="admin_memo" rows={3} maxLength={4000} defaultValue={sel.admin_memo ?? ""} className="full" placeholder="가능한 길, 먼저 볼 것, 다음 연락 날짜" aria-label="상담 메모" />
                <div className="full" style={{ display: "flex", justifyContent: "flex-end" }}><Submit>메모 저장</Submit></div>
              </ActionForm>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
