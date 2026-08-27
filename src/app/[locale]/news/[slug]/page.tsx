// 소식·공지 상세 — blogs.body markdown 렌더링.
// 익명 접근 가능 (RLS: published 만 SELECT). slug 는 한글 포함 가능 → decode 필요.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import HeaderEn from "@/components/layout/HeaderEn";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import { createClient } from "@/lib/supabase/server";
import { KAKAO_URL } from "@/lib/constants";
import {
  formatNewsDate,
  newsCategoryLabel,
  type NewsListRow,
} from "../constants";


type NewsPost = NewsListRow & { body: string };

marked.setOptions({ gfm: true, breaks: false });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return { title: "소식·공지 | ausuhak.com" };
  return {
    title: `${data.title} | ausuhak.com`,
    description: data.excerpt ?? undefined,
    openGraph: {
      title: data.title,
      description: data.excerpt ?? undefined,
      type: "article",
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  setRequestLocale(locale);
  const HeaderCmp = locale === "en" ? HeaderEn : Header;

  const supabase = await createClient();
  const [currentRes, recentRes] = await Promise.all([
    supabase
      .from("blogs")
      .select("id, slug, title, body, excerpt, category, published_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("blogs")
      .select("id, slug, title, excerpt, category, published_at")
      .eq("status", "published")
      .neq("slug", slug)
      .order("published_at", { ascending: false })
      .limit(4),
  ]);

  if (!currentRes.data) notFound();
  const post = currentRes.data as NewsPost;
  const recent = (recentRes.data ?? []) as NewsListRow[];
  const bodyHtml = post.body ? await marked.parse(post.body) : "";

  return (
    <>
      <HeaderCmp />
      <main className="flex-1 bg-cream-100 pb-20 sm:pb-0">
        <section className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/news"
            className="text-xs font-semibold text-navy-700 hover:text-gold-600"
          >
            ← 소식·공지 전체
          </Link>

          <header className="mt-4">
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className="rounded-full bg-gold-100 px-2.5 py-0.5 tracking-wide text-gold-600">
                {newsCategoryLabel(post.category)}
              </span>
              <span className="font-mono font-medium text-ink-500">
                {formatNewsDate(post.published_at)}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-3 text-sm leading-relaxed text-ink-700 sm:text-base">
                {post.excerpt}
              </p>
            )}
          </header>

          {bodyHtml && (
            <article
              className="news-body mt-6 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          )}

          {/* 카카오 CTA */}
          <div className="mt-10 rounded-2xl border border-cream-300 bg-white p-6 text-center shadow-sm">
            <p className="font-display text-lg font-bold text-navy-900 sm:text-xl">
              이 소식, 내 케이스에는 어떤 의미일까?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              비자·학교·장학금 변경이 본인 계획에 미치는 영향은 케이스마다 다릅니다.
              Wilson이 직접 확인해 드립니다.
            </p>
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source={`news_detail_${post.id}`}
              className="mt-5 inline-flex rounded-full bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
            >
              💬 카카오로 1:1 상담
            </a>
          </div>

          {/* 다른 최신 소식 */}
          {recent.length > 0 && (
            <section className="mt-10">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-navy-900 sm:text-xl">
                  다른 최신 소식
                </h2>
                <Link
                  href="/news"
                  className="text-xs font-semibold text-gold-600 hover:underline"
                >
                  전체 보기 →
                </Link>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {recent.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/news/${r.slug}`}
                      className="group block rounded-xl border border-cream-300 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-600 hover:shadow-md"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="rounded-full bg-gold-100 px-2 py-0.5 tracking-wide text-gold-600">
                          {newsCategoryLabel(r.category)}
                        </span>
                        <span className="font-mono font-medium text-ink-500">
                          {formatNewsDate(r.published_at)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-navy-900 group-hover:text-gold-600">
                        {r.title}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <style>{`
            .news-body { color: #1A1A1A; line-height: 1.75; }
            .news-body h1, .news-body h2 { font-family: var(--font-display); font-weight: 700; color: #0A1628; }
            .news-body h1 { font-size: 1.5rem; margin: 1.25rem 0 0.5rem; }
            .news-body h2 { font-size: 1.25rem; margin: 1.25rem 0 0.5rem; padding-top: 0.5rem; border-top: 1px solid #E8E0D0; }
            .news-body h2:first-of-type { border-top: 0; padding-top: 0; }
            .news-body h3 { font-size: 1.05rem; font-weight: 700; color: #0A1628; margin: 0.9rem 0 0.4rem; }
            .news-body p { margin: 0.5rem 0; }
            .news-body ul, .news-body ol { margin: 0.5rem 0 0.5rem 1.25rem; }
            .news-body li { margin: 0.25rem 0; }
            .news-body ul { list-style: disc; }
            .news-body ol { list-style: decimal; }
            .news-body strong { color: #0A1628; font-weight: 700; }
            .news-body em { color: #4A4A4A; }
            .news-body code { background: #FBF7EE; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.85em; font-family: var(--font-mono); }
            .news-body blockquote { border-left: 3px solid #C9962A; padding: 0.25rem 0.75rem; margin: 0.75rem 0; color: #4A4A4A; background: #FBF7EE; }
            .news-body hr { border: 0; border-top: 1px solid #E8E0D0; margin: 1.5rem 0; }
            .news-body table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 0.9em; }
            .news-body th, .news-body td { border: 1px solid #E8E0D0; padding: 0.4rem 0.75rem; text-align: left; }
            .news-body th { background: #F5EFD9; font-weight: 600; }
            .news-body a { color: #C9962A; text-decoration: underline; }
            .news-body img { max-width: 100%; border-radius: 12px; margin: 0.75rem 0; }
          `}</style>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
