// 직원 매뉴얼 475 리스트 + 카테고리 필터 + 검색.
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

  // 카테고리별 카운트 (전체)
  const { data: allCats } = await supabase
    .from("staff_manuals")
    .select("category");
  const categoryCounts = new Map<string, number>();
  for (const row of (allCats ?? []) as { category: string | null }[]) {
    const c = row.category ?? "미분류";
    categoryCounts.set(c, (categoryCounts.get(c) ?? 0) + 1);
  }
  const sortedCats = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);
  const totalCount = sortedCats.reduce((s, [, n]) => s + n, 0);

  // 필터 + 검색 쿼리
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
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy-900">📚 매뉴얼 {totalCount}</h1>
        <p className="mt-1 text-sm text-ink-500">
          학력·전공·지역·주제별 케이스. 카카오 상담 응대 시 즉시 참고. Wilson 19년 노하우 기반.
        </p>
      </header>

      {/* 검색 */}
      <form action="/staff/manuals" className="flex flex-wrap items-center gap-2">
        {cat && cat !== "all" && (
          <input type="hidden" name="cat" value={cat} />
        )}
        <input
          name="q"
          defaultValue={search}
          placeholder="제목·본문 검색 (예: 검정고시, IELTS, TAFE)"
          className="flex-1 min-w-[200px] rounded-full border border-cream-300 bg-white px-4 py-2 text-sm text-navy-900 placeholder:text-ink-500 outline-none focus:border-gold-600"
        />
        <button
          type="submit"
          className="rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-gold-400 transition hover:bg-navy-800"
        >
          검색
        </button>
        {search && (
          <Link
            href={cat && cat !== "all" ? `/staff/manuals?cat=${encodeURIComponent(cat)}` : "/staff/manuals"}
            className="text-xs text-ink-500 hover:text-gold-600"
          >
            검색 해제
          </Link>
        )}
      </form>

      {/* 카테고리 칩 */}
      <nav className="flex flex-wrap gap-1.5" aria-label="카테고리 필터">
        <Link
          href={search ? `/staff/manuals?q=${encodeURIComponent(search)}` : "/staff/manuals"}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            !cat || cat === "all"
              ? "bg-navy-900 text-white"
              : "border border-cream-300 bg-white text-navy-700 hover:bg-cream-200"
          }`}
        >
          전체 {totalCount}
        </Link>
        {sortedCats.map(([c, n]) => {
          const active = cat === c;
          const href = `/staff/manuals?cat=${encodeURIComponent(c)}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
          return (
            <Link
              key={c}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? "bg-navy-900 text-white"
                  : "border border-cream-300 bg-white text-navy-700 hover:bg-cream-200"
              }`}
            >
              {c} {n}
            </Link>
          );
        })}
      </nav>

      {/* 리스트 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-2 shadow-sm">
        {error && (
          <p className="p-4 text-sm text-error">조회 실패: {error.message}</p>
        )}
        {!error && (!manuals || manuals.length === 0) && (
          <p className="p-6 text-sm text-ink-500">— 매칭되는 매뉴얼 없음</p>
        )}
        {!error && manuals && manuals.length > 0 && (
          <ul className="divide-y divide-cream-200">
            {(manuals as Manual[]).map((m) => (
              <li key={m.id}>
                <Link
                  href={`/staff/manuals/${m.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-cream-100"
                >
                  <span className="w-12 shrink-0 font-mono text-xs font-bold text-gold-600">
                    #{m.number}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-navy-900">
                    {m.title}
                  </span>
                  {m.category && (
                    <span className="shrink-0 rounded-full bg-cream-200 px-2 py-0.5 text-[10px] text-ink-700">
                      {m.category}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-[11px] text-ink-500">
        최대 200건 표시. 검색·카테고리로 좁히세요.
      </p>
    </div>
  );
}
