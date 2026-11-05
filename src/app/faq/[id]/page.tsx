import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell, { AskBox, Crumbs } from "@/components/SiteShell";
import RichText from "@/components/RichText";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageMeta } from "@/lib/seo";
import { FAQS, categoryOf, getFaq, plain, snippet } from "@/lib/faq";

export function generateStaticParams() {
  return FAQS.map((f) => ({ id: f.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const f = getFaq((await params).id);
  if (!f) return {};
  return pageMeta({ title: f.q + " - AusUhak(호주유학)", description: snippet(f.a), path: "/faq/" + f.id });
}

export default async function FaqDetail({ params }: { params: Promise<{ id: string }> }) {
  const f = getFaq((await params).id);
  if (!f) notFound();
  const cat = categoryOf(f);
  const related = FAQS.filter((x) => x.category === f.category && x.id !== f.id);
  const idx = FAQS.filter((x) => x.category === f.category).findIndex((x) => x.id === f.id);
  const nearby = [...related.slice(Math.max(0, idx - 3)), ...related.slice(0, Math.max(0, idx - 3))].slice(0, 6);
  const crumbs = [
    { name: "홈", path: "/" },
    { name: "FAQ", path: "/faq" },
    { name: f.category, path: "/faq#" + (cat?.slug || "") },
    { name: f.q, path: "/faq/" + f.id },
  ];
  return (
    <SiteShell current="/faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqJsonLd([{ q: f.q, a: plain(f.a) }]))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd(crumbs))} />
      <div className="ux-wrap" style={{ maxWidth: 820 }}>
        <Crumbs items={[crumbs[0], crumbs[1], crumbs[2], { name: "질문" }]} />
        <span className="ux-tag">{f.category}</span>
        <h1 className="ux-h1" style={{ marginTop: 12 }}>{f.q}</h1>
        <article className="ux-card ux-prose">
          <RichText text={f.a} />
          <p className="ux-muted" style={{ fontSize: 15, margin: 0 }}>답변 Wilson · AusUhak(호주유학)</p>
        </article>
        {nearby.length > 0 && (
          <section style={{ marginTop: 36 }}>
            <h2 style={{ fontSize: 22, margin: "0 0 12px" }}>{f.category} 다른 질문</h2>
            <ul className="ux-card" style={{ listStyle: "none", margin: 0, padding: "4px 24px" }}>
              {nearby.map((x) => (
                <li key={x.id} style={{ borderTop: "1px solid #EEF2F7" }}>
                  <Link href={"/faq/" + x.id} style={{ display: "block", padding: "12px 0", textDecoration: "none", fontWeight: 600 }}>
                    {x.q}
                  </Link>
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 14 }}>
              <Link href="/faq">질문 {FAQS.length}가지 전체 보기</Link>
            </p>
          </section>
        )}
        <AskBox title="내 경우는 조금 다르다면" text="지금 학력과 영어 점수, 원하는 시기를 보내 주시면 제가 직접 답해 드립니다." />
      </div>
    </SiteShell>
  );
}
