// sitemap.xml — 검색엔진 수집용 (네이버 서치어드바이저 / 구글 서치콘솔 등록 대상).
// 정적 페이지 + 발행된 소식 글(/news/slug) + 공개 합격 오퍼(/offers/id).
// DB 조회 실패(빌드 환경 등)에도 정적 목록은 항상 반환.

import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://ausuhak.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/en`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/medical`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/news`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/offers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/cost`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/consult`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return entries;

  try {
    const sb = createClient(url, key);

    const { data: blogs } = await sb
      .from("blogs")
      .select("slug, published_at, updated_at")
      .eq("status", "published")
      .limit(500);
    for (const b of blogs ?? []) {
      entries.push({
        url: `${BASE}/news/${b.slug}`,
        lastModified: new Date(b.updated_at ?? b.published_at ?? now),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    const { data: offers } = await sb
      .from("offers")
      .select("id, updated_at")
      .eq("status", "published")
      .limit(200);
    for (const o of offers ?? []) {
      entries.push({
        url: `${BASE}/offers/${o.id}`,
        lastModified: new Date(o.updated_at ?? now),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    // DB 불가 → 정적 목록만
  }

  return entries;
}
