import { SITE } from "@/lib/site";
import { getPosts } from "@/lib/content";

export const revalidate = 600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// News feed. Naver Search Advisor and feed readers pick new posts up from here.
export async function GET() {
  const posts = (await getPosts()).slice(0, 50);
  const items = posts
    .map((p) => {
      const link = `${SITE.url}/news/${encodeURIComponent(p.slug)}`;
      return `<item><title>${esc(p.title)}</title><link>${link}</link><guid isPermaLink="true">${link}</guid>${
        p.published_at ? `<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : ""
      }${p.category ? `<category>${esc(p.category)}</category>` : ""}<description>${esc(p.excerpt || p.title)}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(SITE.name)} 소식</title><link>${SITE.url}/news</link><description>호주 학생비자 변경, 장학금, 입학 일정 소식</description><language>ko</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
