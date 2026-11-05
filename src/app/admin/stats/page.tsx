import { requireAdmin } from "@/lib/auth";

type Ev = { kind: string; label: string | null; section: string | null; page: string | null; created_at: string };

const SECTION: Record<string, string> = {
  top: "첫 화면", majors: "전공별 진학", medical: "의대 띠", offers: "합격증", steps: "진행 5단계", wilson: "상담사 소개",
  faq: "질문", ask: "상담 신청서", footer: "맨 아래", nav: "위쪽 메뉴", "mobile-bar": "휴대폰 하단 버튼",
};

function days(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const sp = await searchParams;
  const range = sp.d === "30" ? 30 : sp.d === "7" ? 7 : 14;
  const { sb } = await requireAdmin();
  const { data } = await sb.from("site_events").select("kind, label, section, page, created_at").gte("created_at", days(range)).order("created_at", { ascending: false }).limit(5000);
  const ev = (data ?? []) as Ev[];
  const clicks = ev.filter((e) => e.kind === "click");
  const starts = ev.filter((e) => e.kind === "form_start").length;
  const submits = ev.filter((e) => e.kind === "form_submit").length;

  const bySection = new Map<string, number>();
  const byButton = new Map<string, number>();
  const byPage = new Map<string, number>();
  for (const c of clicks) {
    const s = c.section || "기타";
    bySection.set(s, (bySection.get(s) ?? 0) + 1);
    const k = `${SECTION[s] ?? s} · ${c.label || "(이름 없음)"}`;
    byButton.set(k, (byButton.get(k) ?? 0) + 1);
  }
  for (const e of ev.filter((x) => x.kind === "form_submit")) byPage.set(e.page || "/", (byPage.get(e.page || "/") ?? 0) + 1);
  const sort = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...bySection.values());

  return (
    <>
      <header className="ad-head">
        <div>
          <span className="ad-sub">최근 {range}일 · 버튼 클릭과 상담 신청</span>
          <h1 className="ad-h1">홈페이지 반응</h1>
        </div>
        <nav className="ad-tabs" aria-label="기간">
          {[7, 14, 30].map((d) => (
            <a key={d} className="ad-tab sm" href={`/admin/stats?d=${d}`} aria-current={range === d ? "page" : undefined}>최근 {d}일</a>
          ))}
        </nav>
      </header>

      <section className="ad-card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
        <div><span className="ad-sub">상담 버튼 클릭</span><strong style={{ display: "block", fontSize: 32 }}>{clicks.length}</strong></div>
        <div><span className="ad-sub">신청서 작성 시작</span><strong style={{ display: "block", fontSize: 32 }}>{starts}</strong></div>
        <div><span className="ad-sub">상담 신청 완료</span><strong style={{ display: "block", fontSize: 32 }}>{submits}</strong></div>
        <div><span className="ad-sub">작성 시작 대비 완료</span><strong style={{ display: "block", fontSize: 32 }}>{starts ? Math.round((submits / starts) * 100) : 0}%</strong></div>
      </section>

      <section className="ad-card" style={{ gap: 12 }}>
        <h2 className="ad-h2" style={{ fontSize: 18 }}>어느 구역에서 눌렀나</h2>
        {bySection.size === 0 ? <p className="ad-muted">아직 기록이 없습니다.</p> : null}
        {sort(bySection).map(([s, n]) => (
          <div key={s} style={{ display: "grid", gridTemplateColumns: "140px 1fr 48px", gap: 12, alignItems: "center" }}>
            <span>{SECTION[s] ?? s}</span>
            <span style={{ height: 10, borderRadius: 5, background: "#9B2C3E", width: `${(n / max) * 100}%` }} />
            <strong style={{ textAlign: "right" }}>{n}</strong>
          </div>
        ))}
      </section>

      <section className="ad-card" style={{ gap: 8 }}>
        <h2 className="ad-h2" style={{ fontSize: 18 }}>버튼별 클릭</h2>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead><tr><th scope="col">구역 · 버튼</th><th scope="col" style={{ width: 80 }}>클릭</th></tr></thead>
            <tbody>
              {sort(byButton).slice(0, 40).map(([k, n]) => <tr key={k}><td>{k}</td><td>{n}</td></tr>)}
              {byButton.size === 0 ? <tr><td colSpan={2} className="ad-muted">아직 기록이 없습니다.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ad-card" style={{ gap: 8 }}>
        <h2 className="ad-h2" style={{ fontSize: 18 }}>상담 신청이 들어온 페이지</h2>
        {sort(byPage).map(([pg, n]) => <div key={pg} style={{ display: "flex", justifyContent: "space-between" }}><span>{pg}</span><strong>{n}</strong></div>)}
        {byPage.size === 0 ? <p className="ad-muted">아직 기록이 없습니다.</p> : null}
      </section>
    </>
  );
}
