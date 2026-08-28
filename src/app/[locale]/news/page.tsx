// 소식·공지 목록 — blogs 테이블 published 글 공개 노출.
// 익명 접근 가능 (RLS: blogs_anon_published_select).

import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import HeaderEn from "@/components/layout/HeaderEn";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import { createPublicClient } from "@/lib/supabase/public";
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

  const supabase = createPublicClient();
  let query = supabase
    .from("blogs")
    .select("id, slug, title, excerpt, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(100);
  if (activeCat) query = query.eq("category", activeCat);
  const { data } = await query;
  // 전체 보기에선 공지가 맨 위 (그 안에서는 최신순 유지)
  const rows = (data ?? []) as NewsListRow[];
  const posts = activeCat
    ? rows
    : [...rows.filter((p) => p.category === "공지"), ...rows.filter((p) => p.category !== "공지")];

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
          <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
            {/* 모바일: 가로 스크롤 분류 칩 */}
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
              <CatChip href="/news" active={activeCat === null} label="전체" />
              {BLOG_CATEGORIES.map((c) => (
                <CatChip
                  key={c}
                  href={`/news?cat=${encodeURIComponent(c)}`}
                  active={activeCat === c}
                  label={newsCategoryLabel(c)}
                />
              ))}
            </div>

            <div className="mt-4 grid gap-6 lg:mt-0 lg:grid-cols-[210px_1fr]">
              {/* 데스크톱: 분류 사이드바 */}
              <aside className="hidden lg:block">
                <nav className="sticky top-24 rounded-2xl border border-cream-300 bg-white p-3 shadow-sm">
                  <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-500">
                    분류
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    <SideCat href="/news" active={activeCat === null} label="전체" />
                    {BLOG_CATEGORIES.map((c) => (
                      <SideCat
                        key={c}
                        href={`/news?cat=${encodeURIComponent(c)}`}
                        active={activeCat === c}
                        label={newsCategoryLabel(c)}
                      />
                    ))}
                  </ul>
                </nav>
              </aside>

              {/* 게시판 목록 */}
              <div className="rounded-2xl border border-cream-300 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-cream-200 px-5 py-3.5">
                  <p className="text-sm font-bold text-navy-900">
                    {activeCat ? newsCategoryLabel(activeCat) : "전체"}
                    <span className="ml-2 font-mono text-xs font-medium text-ink-500">
                      {posts.length}건
                    </span>
                  </p>
                </div>

                {posts.length === 0 ? (
                  <p className="px-5 py-16 text-center text-sm text-ink-500">
                    {activeCat
                      ? `'${newsCategoryLabel(activeCat)}' 소식이 아직 없습니다.`
                      : "등록된 소식이 아직 없습니다. 곧 첫 소식으로 찾아뵙겠습니다."}
                  </p>
                ) : (
                  <ul>
                    {posts.map((p) => {
                      const isNotice = p.category === "공지";
                      return (
                        <li key={p.id} className="border-b border-cream-200 last:border-b-0">
                          <Link
                            href={`/news/${p.slug}`}
                            className={`group flex items-center gap-3 px-5 py-3.5 transition hover:bg-cream-100/60 ${
                              isNotice && !activeCat ? "bg-gold-100/40" : ""
                            }`}
                          >
                            <span
                              className={`w-[74px] shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-bold ${
                                isNotice
                                  ? "bg-gold-600 text-white"
                                  : "bg-cream-200 text-navy-700"
                              }`}
                            >
                              {newsCategoryLabel(p.category)}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy-900 group-hover:text-gold-600 sm:text-[15px]">
                              {isNotice && <span aria-hidden className="mr-1">📢</span>}
                              {p.title}
                            </span>
                            <span className="shrink-0 font-mono text-[11px] text-ink-500 sm:text-xs">
                              {formatNewsDate(p.published_at)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}

// 모바일 가로 스크롤 분류 칩
function CatChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-navy-900 text-cream-100"
          : "border border-cream-300 bg-white text-navy-700"
      }`}
    >
      {label}
    </Link>
  );
}

// 데스크톱 사이드바 분류 항목
function SideCat({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className={`block rounded-lg px-3 py-2 text-sm transition ${
          active
            ? "bg-navy-900 font-bold text-cream-100"
            : "font-medium text-navy-700 hover:bg-cream-100 hover:text-gold-600"
        }`}
      >
        {label}
      </Link>
    </li>
  );
}
