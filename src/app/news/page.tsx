import Link from "next/link";
import SiteShell, { AskBox, Crumbs } from "@/components/SiteShell";
import { breadcrumbJsonLd, jsonLdScript, pageMeta } from "@/lib/seo";
import { fmtDate, getPosts } from "@/lib/content";

export const revalidate = 300;

export const metadata = pageMeta({
  title: "호주유학 소식 | 학생비자 변경·장학금·입학 일정 - AusUhak(호주유학)",
  description:
    "호주 학생비자 규정 변경, 대학 장학금과 지원 마감, 입학 일정, 호주 생활 정보를 정리해 올립니다. 유학 준비에 꼭 필요한 최신 소식을 확인하세요.",
  path: "/news",
});

export default async function NewsPage() {
  const posts = await getPosts();
  const cats = Array.from(new Set(posts.map((p) => p.category).filter(Boolean))) as string[];
  return (
    <SiteShell current="/news">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd([{ name: "홈", path: "/" }, { name: "소식", path: "/news" }]))}
      />
      <div className="ux-wrap">
        <Crumbs items={[{ name: "홈", path: "/" }, { name: "소식" }]} />
        <h1 className="ux-h1">호주유학 소식</h1>
        <p className="ux-lead">비자 규정, 장학금 마감, 입학 일정이 바뀌면 바로 정리해 올립니다.</p>
        {cats.length > 1 ? (
          <nav aria-label="소식 분류" className="ux-chips">
            {cats.map((c) => (
              <a key={c} className="ux-chip" href={"#" + encodeURIComponent(c)}>{c}</a>
            ))}
          </nav>
        ) : null}
        {posts.length === 0 ? (
          <p className="ux-card">소식을 불러오는 중입니다. 잠시 후 다시 열어 주세요.</p>
        ) : (
          (cats.length ? cats : [""]).map((c) => {
            const list = c ? posts.filter((p) => p.category === c) : posts;
            return (
              <section key={c || "all"} id={c ? encodeURIComponent(c) : undefined} style={{ marginBottom: 32, scrollMarginTop: 90 }}>
                {c ? <h2 style={{ fontSize: 24, margin: "0 0 12px" }}>{c}</h2> : null}
                <ul className="ux-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {list.map((p) => (
                    <li key={p.id}>
                      <Link href={"/news/" + p.slug} className="ux-card" style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", textDecoration: "none" }}>
                        <span className="ux-muted" style={{ fontSize: 14 }}>{fmtDate(p.published_at)}</span>
                        <strong style={{ fontSize: 18, lineHeight: 1.4 }}>{p.title}</strong>
                        {p.excerpt ? <span className="ux-muted" style={{ fontSize: 15 }}>{p.excerpt.slice(0, 110)}{p.excerpt.length > 110 ? "…" : ""}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
        <AskBox />
      </div>
    </SiteShell>
  );
}
