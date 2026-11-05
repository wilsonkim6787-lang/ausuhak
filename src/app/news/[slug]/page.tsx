import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell, { AskBox, Crumbs } from "@/components/SiteShell";
import { breadcrumbJsonLd, jsonLdScript, pageMeta } from "@/lib/seo";
import { fmtDate, getPost, getPosts } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getPost(decodeURIComponent((await params).slug));
  if (!p) return {};
  const m = pageMeta({
    title: p.title + " - AusUhak(호주유학)",
    description: (p.excerpt || p.title).slice(0, 160),
    path: "/news/" + p.slug,
  });
  return { ...m, openGraph: { ...m.openGraph, type: "article", publishedTime: p.published_at || undefined } };
}

export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const slug = decodeURIComponent((await params).slug);
  const p = await getPost(slug);
  if (!p) notFound();
  const more = (await getPosts()).filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 5);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.excerpt || undefined,
    datePublished: p.published_at || undefined,
    author: { "@type": "Person", name: "Wilson Kim (김구복)" },
    publisher: { "@id": SITE.url + "/#org" },
    mainEntityOfPage: SITE.url + "/news/" + p.slug,
    inLanguage: "ko-KR",
  };
  return (
    <SiteShell current="/news">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(article)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "홈", path: "/" },
            { name: "소식", path: "/news" },
            { name: p.title, path: "/news/" + p.slug },
          ]),
        )}
      />
      <div className="ux-wrap" style={{ maxWidth: 820 }}>
        <Crumbs items={[{ name: "홈", path: "/" }, { name: "소식", path: "/news" }, { name: p.category || "글" }]} />
        <span className="ux-tag">{p.category || "소식"}</span>
        <h1 className="ux-h1" style={{ marginTop: 12 }}>{p.title}</h1>
        <p className="ux-muted" style={{ margin: "0 0 20px" }}>{fmtDate(p.published_at)} · Wilson</p>
        <article className="ux-card ux-prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body || "") }} />
        <AskBox />
        {more.length > 0 ? (
          <section style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 22, margin: "0 0 12px" }}>{p.category} 다른 글</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
              {more.map((x) => (
                <li key={x.id}>
                  <Link href={"/news/" + x.slug} className="ux-card" style={{ display: "block", padding: "14px 18px", textDecoration: "none", fontWeight: 600 }}>
                    {x.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SiteShell>
  );
}
