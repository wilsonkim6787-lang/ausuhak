// 소식·공지 목록 — blogs 테이블 published 글 공개 노출.
// 익명 접근 가능 (RLS: blogs_anon_published_select).

import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import HeaderEn from "@/components/layout/HeaderEn";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import { createClient } from "@/lib/supabase/server";
import { BLOG_CATEGORIES } from "../admin/blog/constants";
import {
  formatNewsDate,
  newsCategoryLabel,
  type NewsListRow,
} from "./constants";

export const metadata: Metadata = {
  title: "소식·공지 | ausuhak.com",
  description:
    "호주 유학 소식 — 합격 소식, 장학금 정보, 비자·이민성 공지, 학교 입학 일정, 프로모션 안내를 모았습니다.",
};

export default async function NewsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { locale } = await params;
  const { cat } = await searchParams;
  setRequestLocale(locale);
  const HeaderCmp = locale === "en" ? HeaderEn : Header;

  // cat 파라미터는 화이트리스트 검증 (임의 값 무시)
  const activeCat =
    cat && (BLOG_CATEGORIES as readonly string[]).includes(cat) ? cat : null;

  const supabase = await createClient();
  let query = supabase
    .from("blogs")
    .select("id, slug, title, excerpt, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(60);
  if (activeCat) query = query.eq("category", activeCat);
  const { data } = await query;
  const posts = (data ?? []) as NewsListRow[];

  return (
    <>
      <HeaderCmp />
      <main className="flex-1 pb-20 sm:pb-0">
        <section className="bg-navy-900 py-14 text-cream-100 sm:py-20">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-cream-200 transition hover:text-gold-500"
            >
              <span aria-hidden>←</span> 메인으로
            </Link>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">
              소식·공지
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream-200 sm:text-lg">
              합격 소식부터 장학금, 비자·이민성 변경, 학교 입학 일정까지 —
              호주 유학에 필요한 새 소식을 모았습니다.
            </p>
          </div>
        </section>

        <section className="bg-cream-100">
          <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2">
              <Link
                href="/news"
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
                  activeCat === null
                    ? "bg-navy-900 text-cream-100"
                    : "border border-cream-300 bg-white text-navy-700 hover:border-gold-600 hover:text-gold-600"
                }`}
              >
                전체
              </Link>
              {BLOG_CATEGORIES.map((c) => (
                <Link
                  key={c}
                  href={`/news?cat=${encodeURIComponent(c)}`}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
                    activeCat === c
                      ? "bg-navy-900 text-cream-100"
                      : "border border-cream-300 bg-white text-navy-700 hover:border-gold-600 hover:text-gold-600"
                  }`}
                >
                  {newsCategoryLabel(c)}
                </Link>
              ))}
            </div>

            {/* 글 목록 */}
            {posts.length === 0 ? (
              <p className="mt-14 text-center text-sm text-ink-500">
                {activeCat
                  ? `'${newsCategoryLabel(activeCat)}' 소식이 아직 없습니다.`
                  : "등록된 소식이 아직 없습니다. 곧 첫 소식으로 찾아뵙겠습니다."}
              </p>
            ) : (
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {posts.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/news/${p.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gold-600 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-bold">
                        <span className="rounded-full bg-gold-100 px-2.5 py-0.5 tracking-wide text-gold-600">
                          {newsCategoryLabel(p.category)}
                        </span>
                        <span className="font-mono font-medium text-ink-500">
                          {formatNewsDate(p.published_at)}
                        </span>
                      </div>
                      <p className="mt-3 font-display text-lg font-bold leading-snug text-navy-900 group-hover:text-gold-600 sm:text-xl">
                        {p.title}
                      </p>
                      {p.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-700">
                          {p.excerpt}
                        </p>
                      )}
                      <span
                        aria-hidden
                        className="mt-auto pt-4 text-sm font-semibold text-gold-600 transition group-hover:translate-x-1"
                      >
                        자세히 보기 →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
