// 메인 페이지 "최신 소식" 섹션 — published 글 최신 3개.
// 글이 하나도 없으면 섹션 자체를 렌더하지 않는다 (콘텐츠 쌓이기 전 빈 박스 방지).

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  formatNewsDate,
  newsCategoryLabel,
  type NewsListRow,
} from "@/app/[locale]/news/constants";

export default async function NewsPreview() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select("id, slug, title, excerpt, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);
  const posts = (data ?? []) as NewsListRow[];

  if (posts.length === 0) return null;

  return (
    <section className="bg-cream-200">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              News
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
              최신 소식
            </h2>
          </div>
          <Link
            href="/news"
            className="shrink-0 text-sm font-semibold text-gold-600 transition hover:underline"
          >
            전체 보기 →
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/news/${p.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-cream-300 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-gold-600 hover:shadow-lg"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="rounded-full bg-gold-100 px-2 py-0.5 tracking-wide text-gold-600">
                    {newsCategoryLabel(p.category)}
                  </span>
                  <span className="font-mono font-medium text-ink-500">
                    {formatNewsDate(p.published_at)}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 font-display text-base font-bold leading-snug text-navy-900 group-hover:text-gold-600 sm:text-lg">
                  {p.title}
                </p>
                {p.excerpt && (
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-700">
                    {p.excerpt}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
