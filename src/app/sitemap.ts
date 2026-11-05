import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { FAQS } from "@/lib/faq";
import { getOffers, getPosts } from "@/lib/content";

export const revalidate = 3600;

const STATIC: [string, number][] = [
  ["/", 1],
  ["/ged", 0.9],
  ["/nursing", 0.9],
  ["/pharmacy", 0.9],
  ["/medical", 0.9],
  ["/visa", 0.9],
  ["/business", 0.8],
  ["/it", 0.8],
  ["/cookery", 0.8],
  ["/early-study", 0.8],
  ["/general-english", 0.8],
  ["/hidden-majors", 0.8],
  ["/medical/universities", 0.8],
  ["/medical/admission", 0.8],
  ["/medical/calendar", 0.8],
  ["/medical/scores", 0.8],
  ["/medical/mmi", 0.7],
  ["/medical/ib-sat", 0.7],
  ["/medical/isat", 0.7],
  ["/medical/services", 0.7],
  ["/medical/isat-mock", 0.6],
  ["/medical/ucat-mock", 0.6],
  ["/medical/interview-lab", 0.6],
  ["/offers", 0.8],
  ["/news", 0.8],
  ["/faq", 0.8],
  ["/tools/points", 0.7],
  ["/tools/schedule", 0.7],
  ["/tools/route", 0.7],
  ["/en", 0.5],
  ["/privacy", 0.2],
  ["/terms", 0.2],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [offers, posts] = await Promise.all([getOffers(), getPosts()]);
  return [
    ...STATIC.map(([p, priority]) => ({ url: p === "/" ? SITE.url : SITE.url + p, lastModified: now, priority })),
    ...FAQS.map((f) => ({ url: `${SITE.url}/faq/${f.id}`, lastModified: now, priority: 0.6 })),
    ...offers.map((o) => ({ url: `${SITE.url}/offers/${o.id}`, priority: 0.5 })),
    ...posts.map((p) => ({
      url: `${SITE.url}/news/${encodeURIComponent(p.slug)}`,
      lastModified: p.published_at ? new Date(p.published_at) : undefined,
      priority: 0.6,
    })),
  ];
}
