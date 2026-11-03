import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell, { AskBox, Crumbs } from "@/components/SiteShell";
import { breadcrumbJsonLd, jsonLdScript, pageMeta } from "@/lib/seo";
import { getOffer, getOffers, offerImage } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getOffers()).map((o) => ({ id: o.id }));
}

function strip(md: string) {
  return md.replace(/[#*>\[\]()_`]/g, "").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const o = await getOffer((await params).id);
  if (!o) return {};
  const title = `${o.school}${o.program ? " " + o.program : ""} 합격${o.year ? " (" + o.year + ")" : ""} - AusUhak(호주유학)`;
  const description = o.story
    ? strip(o.story).slice(0, 150)
    : `${o.school}${o.program ? " " + o.program : ""} 합격증입니다. 제가 직접 진행한 호주 진학 사례를 확인하세요.`;
  const img = offerImage(o);
  return pageMeta({ title, description, path: "/offers/" + o.id, image: img && !img.endsWith(".pdf") ? img : undefined });
}

export default async function OfferDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = await getOffer(id);
  if (!o) notFound();
  const others = (await getOffers()).filter((x) => x.id !== o.id && x.image_path).slice(0, 6);
  const img = offerImage(o);
  const pdf = o.image_path?.toLowerCase().endsWith(".pdf");
  return (
    <SiteShell current="/offers">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "홈", path: "/" },
            { name: "합격증", path: "/offers" },
            { name: o.school, path: "/offers/" + o.id },
          ]),
        )}
      />
      <div className="ux-wrap" style={{ maxWidth: 820 }}>
        <Crumbs items={[{ name: "홈", path: "/" }, { name: "합격증", path: "/offers" }, { name: o.school }]} />
        <span className="ux-tag">{o.year ? o.year + " 합격" : "합격"}{o.student_alias ? " · " + o.student_alias : ""}</span>
        <h1 className="ux-h1" style={{ marginTop: 12 }}>{o.school}</h1>
        {o.program ? <p className="ux-lead" style={{ marginBottom: 24 }}>{o.program}</p> : null}
        {img && !pdf ? (
          <figure className="ux-card" style={{ margin: 0, padding: 12 }}>
            <Image src={img} alt={`${o.school} ${o.program || ""} 합격증`} width={800} height={1000} sizes="(max-width: 860px) 92vw, 780px" style={{ width: "100%", height: "auto", borderRadius: 10 }} />
          </figure>
        ) : null}
        {img && pdf ? (
          <p className="ux-card"><a href={img} target="_blank" rel="noopener">합격증 PDF 보기</a></p>
        ) : null}
        {o.story ? (
          <article className="ux-card ux-prose" style={{ marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>학생 후기</h2>
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(o.story) }} />
          </article>
        ) : null}
        <AskBox title="나도 이 학교에 갈 수 있을까" text="지금 성적과 영어 점수를 보내 주시면 가능한 길을 먼저 알려 드립니다." />
        {others.length > 0 ? (
          <section style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 22, margin: "0 0 12px" }}>다른 합격 사례</h2>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
              {others.map((x) => (
                <li key={x.id}>
                  <Link href={"/offers/" + x.id} className="ux-card" style={{ display: "block", padding: "14px 18px", textDecoration: "none" }}>
                    <strong>{x.school}</strong>
                    <span className="ux-muted">{x.program ? " · " + x.program : ""}{x.year ? " · " + x.year : ""}</span>
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
