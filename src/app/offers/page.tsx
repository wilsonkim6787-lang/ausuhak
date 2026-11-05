import Image from "next/image";
import Link from "next/link";
import SiteShell, { AskBox, Crumbs } from "@/components/SiteShell";
import { breadcrumbJsonLd, jsonLdScript, pageMeta } from "@/lib/seo";
import { getOffers, offerImage } from "@/lib/content";

export const revalidate = 300;

export const metadata = pageMeta({
  title: "호주 대학 합격증 모음 | 간호·약대·의대·경영 진학 사례 - AusUhak(호주유학)",
  description:
    "시드니대, UNSW, 모나쉬, 그리피스, UTS 등 호주 대학 합격증과 학생 후기를 모았습니다. 검정고시, 고졸, 대졸, 직장인까지 학력별로 실제 진학한 사례를 확인하세요.",
  path: "/offers",
});

export default async function OffersPage() {
  const offers = await getOffers();
  return (
    <SiteShell current="/offers">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd([{ name: "홈", path: "/" }, { name: "합격증", path: "/offers" }]))}
      />
      <div className="ux-wrap">
        <Crumbs items={[{ name: "홈", path: "/" }, { name: "합격증" }]} />
        <h1 className="ux-h1">호주 대학 합격증 {offers.length > 0 ? offers.length + "건" : ""}</h1>
        <p className="ux-lead">
          제가 직접 진행한 학생들의 합격증입니다. 개인정보는 가리고, 학교와 과정, 입학 연도만 남겼습니다.
        </p>
        {offers.length === 0 ? (
          <p className="ux-card">합격증을 불러오는 중입니다. 잠시 후 다시 열어 주세요.</p>
        ) : (
          <ul className="ux-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {offers.map((o) => {
              const img = offerImage(o);
              const pdf = o.image_path?.toLowerCase().endsWith(".pdf");
              return (
                <li key={o.id}>
                  <Link
                    href={"/offers/" + o.id}
                    className="ux-card"
                    style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", textDecoration: "none", padding: 16 }}
                  >
                    {img && !pdf ? (
                      <div style={{ position: "relative", aspectRatio: "4 / 3", borderRadius: 12, overflow: "hidden", background: "#F3F3F1" }}>
                        <Image src={img} alt={o.school + " 합격증"} fill sizes="(max-width: 700px) 92vw, 340px" style={{ objectFit: "cover", objectPosition: "top" }} />
                      </div>
                    ) : null}
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#8E2A3B" }}>
                      {o.year ? o.year + " 합격" : "합격"}
                      {o.student_alias ? " · " + o.student_alias : ""}
                    </span>
                    <strong style={{ fontSize: 18, lineHeight: 1.35 }}>{o.school}</strong>
                    {o.program ? <span className="ux-muted" style={{ fontSize: 15 }}>{o.program}</span> : null}
                    {o.story ? <span style={{ fontSize: 14, fontWeight: 700, marginTop: "auto" }}>후기 읽기</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <AskBox title="나도 이 학교에 갈 수 있을까" text="지금 성적과 영어 점수를 보내 주시면 가능한 학교부터 알려 드립니다." />
      </div>
    </SiteShell>
  );
}
