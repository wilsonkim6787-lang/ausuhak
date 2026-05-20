// 직원 매뉴얼 474 리스트 + 카테고리 필터 + 검색.
// requireStaff 가드 (staff 또는 super_admin).
// 마크다운 렌더링은 [id]/page.tsx 상세에서.

import Link from "next/link";
import { requireStaff } from "@/lib/auth/requireStaff";
import { createClient } from "@/lib/supabase/server";

type Manual = {
  id: string;
  number: number;
  category: string | null;
  title: string;
};

export default async function StaffManualsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string }>;
}) {
  await requireStaff();
  const { cat, q } = await searchParams;
  const search = (q ?? "").trim();
  const supabase = await createClient();

  const { data: allCats } = await supabase.from("staff_manuals").select("category");
  const categoryCounts = new Map<string, number>();
  for (const row of (allCats ?? []) as { category: string | null }[]) {
    const c = row.category ?? "미분류";
    categoryCounts.set(c, (categoryCounts.get(c) ?? 0) + 1);
  }
  const sortedCats = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);
  const totalCount = sortedCats.reduce((s, [, n]) => s + n, 0);

  let query = supabase
    .from("staff_manuals")
    .select("id, number, category, title")
    .order("number", { ascending: true });
  if (cat && cat !== "all") {
    if (cat === "미분류") {
      query = query.is("category", null);
    } else {
      query = query.eq("category", cat);
    }
  }
  if (search) {
    const safe = search.replace(/%/g, "");
    query = query.or(`title.ilike.%${safe}%,search_text.ilike.%${safe}%`);
  }
  const { data: manuals, error } = await query.limit(200);

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-3xl font-bold text-navy-900">
            📚 매뉴얼
          </h1>
          <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold text-gold-600">
            {totalCount}개
          </span>
          <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-medium text-navy-700">
            직원 전용
          </span>
        </div>
        <p className="text-sm text-ink-700">
          학력·전공·지역·주제별 케이스. 카카오 상담 응대 시 즉시 참고. Wilson 19년 노하우 기반.
        </p>
      </header>

      {/* 검색바 */}
      <form action="/staff/manuals" className="space-y-4">
        {cat && cat !== "all" && (
          <input type="hidden" name="cat" value={cat} />
        )}
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink-400"
          >
            🔍
          </span>
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="제목·본문 검색 (예: 검정고시, IELTS, TAFE)"
            className="w-full rounded-full border border-cream-300 bg-white py-3.5 pl-11 pr-28 text-sm text-navy-900 shadow-sm transition focus:border-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-600/20 sm:text-base"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            검색
          </button>
        </div>
      </form>

      {/* 카테고리 칩 */}
      <nav className="flex flex-wrap gap-2" aria-label="카테고리 필터">
        <Link
          href={search ? `/staff/manuals?q=${encodeURIComponent(search)}` : "/staff/manuals"}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition sm:text-sm ${
            !cat || cat === "all"
              ? "border-navy-900 bg-navy-900 text-white"
              : "border-cream-300 bg-white text-navy-700 hover:border-gold-600/50"
          }`}
        >
          전체 <span className="text-[11px] opacity-70">{totalCount}</span>
        </Link>
        {sortedCats.map(([c, n]) => {
          const active = cat === c;
          const href = `/staff/manuals?cat=${encodeURIComponent(c)}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
          return (
            <Link
              key={c}
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition sm:text-sm ${
                active
                  ? "border-gold-600 bg-gold-600 text-white"
                  : "border-cream-300 bg-white text-navy-700 hover:border-gold-600/50"
              }`}
            >
              {c} <span className="text-[11px] opacity-70">{n}</span>
            </Link>
          );
        })}
      </nav>

      {/* 결과 카운트 */}
      <div className="flex items-baseline justify-between border-b border-cream-300 pb-2">
        <p className="text-sm text-ink-700">
          결과 <strong className="text-navy-900">{manuals?.length ?? 0}</strong>건
          {search && (
            <>
              {" "}
              · &ldquo;<strong className="text-gold-600">{search}</strong>&rdquo;
            </>
          )}
          {cat && cat !== "all" && (
            <>
              {" "}
              · {cat}
            </>
          )}
        </p>
        {(search || (cat && cat !== "all")) && (
          <Link
            href="/staff/manuals"
            className="text-xs font-medium text-ink-500 transition hover:text-navy-900"
          >
            필터 초기화 ✕
          </Link>
        )}
      </div>

      {/* 리스트 */}
      {error ? (
        <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
          조회 실패: {error.message}
        </p>
      ) : !manuals || manuals.length === 0 ? (
        <div className="rounded-2xl border border-cream-300 bg-cream-100/40 px-6 py-12 text-center">
          <p className="text-3xl">🔎</p>
          <p className="mt-3 text-sm font-medium text-navy-900">
            매칭되는 매뉴얼이 없습니다
          </p>
          <p className="mt-1 text-xs text-ink-500">
            검색어를 다르게 시도하거나 필터를 초기화해보세요.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {(manuals as Manual[]).map((m) => (
            <li key={m.id}>
              <Link
                href={`/staff/manuals/${m.id}`}
                className="group flex items-center gap-3 rounded-xl border border-cream-300 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-600/50 hover:shadow-md sm:px-5 sm:py-3.5"
              >
                <span className="inline-flex h-8 w-12 shrink-0 items-center justify-center rounded-full bg-gold-100 font-mono text-xs font-bold text-gold-600">
                  #{m.number}
                </span>
                <span className="flex-1 truncate text-sm font-medium text-navy-900 group-hover:text-gold-600 sm:text-base">
                  {m.title}
                </span>
                {m.category && (
                  <span className="shrink-0 rounded-full bg-cream-200 px-2.5 py-0.5 text-[10px] font-medium text-navy-700 sm:text-[11px]">
                    {m.category}
                  </span>
                )}
                <span
                  aria-hidden
                  className="shrink-0 text-gold-600 transition group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-[11px] text-ink-500">
        최대 200건 표시 · 검색·카테고리로 좁히세요
      </p>
    </div>
  );
}
