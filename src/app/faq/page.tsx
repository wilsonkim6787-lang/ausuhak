import Link from "next/link";
import SiteShell, { AskBox, Crumbs } from "@/components/SiteShell";
import { breadcrumbJsonLd, jsonLdScript, pageMeta } from "@/lib/seo";
import { FAQS, faqsByCategory, plain } from "@/lib/faq";
import FaqSearch from "@/components/FaqSearch";

export const metadata = pageMeta({
  title: "호주유학 자주 묻는 질문 " + FAQS.length + "가지 | AusUhak(호주유학)",
  description:
    "검정고시·고졸·대졸별 호주 대학 진학, 간호·의대·약대 입학 요건, 학생비자와 졸업 후 비자, 학비와 생활비, 호주 생활까지 상담에서 가장 많이 받은 질문에 Wilson이 직접 답했습니다.",
  path: "/faq",
});

export default function FaqPage() {
  const groups = faqsByCategory();
  return (
    <SiteShell current="/faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd([{ name: "홈", path: "/" }, { name: "FAQ", path: "/faq" }]))}
      />
      <div className="ux-wrap">
        <Crumbs items={[{ name: "홈", path: "/" }, { name: "자주 묻는 질문" }]} />
        <h1 className="ux-h1">호주유학 자주 묻는 질문</h1>
        <p className="ux-lead">
          상담에서 가장 많이 받은 질문 {FAQS.length}가지에 직접 답했습니다. 내 상황과 조금 다르면 카카오톡으로 물어봐 주세요.
        </p>
        <FaqSearch items={FAQS.map((f) => ({ id: f.id, q: f.q, c: f.category, a: plain(f.a).slice(0, 160) }))} />
        <nav aria-label="질문 분류" className="ux-chips">
          {groups.map((g) => (
            <a key={g.slug} className="ux-chip" href={"#" + g.slug}>
              {g.name} {g.items.length}
            </a>
          ))}
        </nav>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {groups.map((g) => (
            <section key={g.slug} id={g.slug} className="ux-card" style={{ scrollMarginTop: 90 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 24, letterSpacing: -0.6 }}>{g.name}</h2>
              <p className="ux-muted" style={{ margin: "0 0 12px", fontSize: 15 }}>{g.desc}</p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {g.items.map((f) => (
                  <li key={f.id} style={{ borderTop: "1px solid #EEF2F7" }}>
                    <Link href={"/faq/" + f.id} style={{ display: "block", padding: "12px 0", textDecoration: "none", fontWeight: 600 }}>
                      {f.q}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <AskBox />
      </div>
    </SiteShell>
  );
}
