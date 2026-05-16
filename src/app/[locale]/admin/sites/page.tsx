// /admin/sites — Wilson 자료 사이트 모음 검색·열람·편집 (super_admin).
// admin/layout 이 super_admin 가드.
// 데이터 = monitoring_sites 테이블 (xlsx v2 / 11 시트 · 411+ 사이트).

import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import {
  upsertMonitoringSiteAction,
  deleteMonitoringSiteAction,
} from "./actions";

type Site = {
  id: string;
  sheet: string;
  section: string | null;
  category: string | null;
  name: string;
  url: string;
  description: string | null;
  display_order: number;
};

const SHEETS: Array<[string, string]> = [
  ["1.호주 한인사이트", "🇰🇷 한인"],
  ["2.호주 대학교", "🎓 대학교"],
  ["3.대학부속 컬리지", "🏫 대학부속"],
  ["4.사립 컬리지", "📚 사립"],
  ["5.호주 관광청", "🌏 관광청"],
  ["6.생활정보", "🏠 생활"],
  ["7.연봉정보", "💼 연봉"],
  ["8.구직사이트", "🔍 구직"],
  ["9.이력서·면접", "📝 이력서"],
  ["10.PR·취업비자", "🛂 PR·비자"],
  ["11.실용팁", "🌟 실용팁"],
];
const SHEET_LABEL: Record<string, string> = Object.fromEntries(SHEETS);

export default async function AdminSitesPage({
  searchParams,
}: {
  searchParams: Promise<{
    sheet?: string;
    q?: string;
    cat?: string;
    edit?: string;
    new?: string;
    err?: string;
    ok?: string;
  }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const search = (sp.q ?? "").trim();
  const showForm = sp.edit || sp.new === "1";

  // 1) 전체 시트별 카운트 (탭) + 전체 카테고리 list (datalist 용) — 병렬
  // 2) 편집 대상 (있으면) — 병렬
  const [sheetCountsRes, allCatsRes, editRes] = await Promise.all([
    supabase.from("monitoring_sites").select("sheet"),
    supabase.from("monitoring_sites").select("category").not("category", "is", null),
    sp.edit
      ? supabase.from("monitoring_sites").select("*").eq("id", sp.edit).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const sheetCounts = new Map<string, number>();
  for (const r of (sheetCountsRes.data ?? []) as { sheet: string }[]) {
    sheetCounts.set(r.sheet, (sheetCounts.get(r.sheet) ?? 0) + 1);
  }
  const totalCount = [...sheetCounts.values()].reduce((s, n) => s + n, 0);
  const sortedSheets = SHEETS.filter(([s]) => sheetCounts.has(s)).map(
    ([s, l]) => [s, l, sheetCounts.get(s)!] as const,
  );

  const allCategories = [
    ...new Set(
      ((allCatsRes.data ?? []) as { category: string | null }[])
        .map((r) => r.category)
        .filter((c): c is string => !!c),
    ),
  ].sort();

  let editing: Site | null = null;
  if (sp.edit) {
    if (!editRes.data) notFound();
    editing = editRes.data as Site;
  }

  // 3) 카테고리 카운트 (선택 시트 내)
  const activeSheet = sp.sheet ?? "";
  const isAll = !activeSheet;
  let catCounts: Array<[string, number]> = [];
  if (!isAll) {
    const catRes = await supabase
      .from("monitoring_sites")
      .select("category")
      .eq("sheet", activeSheet);
    const map = new Map<string, number>();
    for (const r of (catRes.data ?? []) as { category: string | null }[]) {
      const c = r.category ?? "—";
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    catCounts = [...map.entries()].sort((a, b) => b[1] - a[1]);
  }

  // 4) 메인 리스트
  let listQuery = supabase
    .from("monitoring_sites")
    .select("id, sheet, section, category, name, url, description, display_order")
    .order("sheet")
    .order("display_order");
  if (!isAll) listQuery = listQuery.eq("sheet", activeSheet);
  if (sp.cat && sp.cat !== "all" && !isAll) {
    listQuery = listQuery.eq("category", sp.cat);
  }
  if (search) {
    const safe = search.replace(/%/g, "");
    listQuery = listQuery.or(`name.ilike.%${safe}%,search_text.ilike.%${safe}%`);
  }
  const { data: sites, error } = await listQuery.limit(500);

  const grouped = new Map<string, Site[]>();
  for (const s of (sites ?? []) as Site[]) {
    const key = isAll ? s.sheet : (s.section ?? "—");
    const arr = grouped.get(key) ?? [];
    arr.push(s);
    grouped.set(key, arr);
  }

  // 신규 폼 기본값 = 현재 활성 시트
  const newDefaultSheet = activeSheet || SHEETS[0][0];

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-900">
            🔗 자료 사이트
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Wilson 정리 호주 유학·생활·취업 사이트. 카톡 응대 출처 검색 + FAQ·매뉴얼 출처 인용용.
            총 <span className="font-bold text-navy-900">{totalCount}</span>개.
          </p>
        </div>
        {!showForm && (
          <Link
            href="/admin/sites?new=1"
            className="rounded-full bg-gold-600 px-4 py-2 text-xs font-semibold text-white hover:bg-gold-500"
          >
            + 신규 사이트
          </Link>
        )}
      </header>

      {sp.err && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">⚠️ {sp.err}</p>
      )}
      {sp.ok && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">✅ 저장됨</p>
      )}

      {/* 폼 (편집 또는 신규) */}
      {showForm && (
        <section className="rounded-2xl border border-gold-600/40 bg-white p-5 shadow-sm ring-2 ring-gold-600/20">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy-900">
              {editing ? `✏️ 편집: ${editing.name}` : "+ 신규 사이트 추가"}
            </h2>
            <Link
              href="/admin/sites"
              className="text-xs text-ink-500 hover:underline"
            >
              취소 / 닫기
            </Link>
          </div>
          <SiteForm
            key={editing?.id ?? "new"}
            editing={editing}
            defaultSheet={newDefaultSheet}
            allCategories={allCategories}
          />
        </section>
      )}

      {/* 검색 + 시트 탭 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
        <form action="/admin/sites" className="flex gap-2">
          {activeSheet && <input type="hidden" name="sheet" value={activeSheet} />}
          {sp.cat && <input type="hidden" name="cat" value={sp.cat} />}
          <input
            name="q"
            defaultValue={search}
            placeholder="🔍 사이트명 · 설명 검색 (예: SEEK / 시드니대 / 485)"
            className="flex-1 rounded-md border border-cream-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-gold-400"
          >
            검색
          </button>
          {(search || activeSheet || sp.cat) && (
            <Link
              href="/admin/sites"
              className="rounded-md border border-cream-300 px-3 py-2 text-xs text-ink-500 hover:bg-cream-100"
            >
              초기화
            </Link>
          )}
        </form>

        <nav className="mt-3 flex flex-wrap gap-1.5">
          <Link
            href={`/admin/sites${search ? `?q=${encodeURIComponent(search)}` : ""}`}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              isAll
                ? "bg-navy-900 text-white"
                : "border border-cream-300 text-navy-700 hover:bg-cream-100"
            }`}
          >
            전체 {totalCount}
          </Link>
          {sortedSheets.map(([sheet, label, n]) => {
            const active = activeSheet === sheet;
            const qs = new URLSearchParams();
            qs.set("sheet", sheet);
            if (search) qs.set("q", search);
            return (
              <Link
                key={sheet}
                href={`/admin/sites?${qs.toString()}`}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  active
                    ? "bg-navy-900 text-white"
                    : "border border-cream-300 text-navy-700 hover:bg-cream-100"
                }`}
              >
                {label} {n}
              </Link>
            );
          })}
        </nav>

        {!isAll && catCounts.length > 1 && (
          <nav className="mt-2 flex flex-wrap gap-1 border-t border-cream-200 pt-2">
            <Link
              href={`/admin/sites?sheet=${encodeURIComponent(activeSheet)}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              className={`rounded-full px-2 py-0.5 text-[10px] ${
                !sp.cat || sp.cat === "all"
                  ? "bg-gold-600 text-white"
                  : "border border-cream-300 text-ink-700"
              }`}
            >
              모든 카테고리
            </Link>
            {catCounts.map(([c, n]) => (
              <Link
                key={c}
                href={`/admin/sites?sheet=${encodeURIComponent(activeSheet)}&cat=${encodeURIComponent(c)}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  sp.cat === c
                    ? "bg-gold-600 text-white"
                    : "border border-cream-300 text-ink-700 hover:bg-cream-100"
                }`}
              >
                {c} {n}
              </Link>
            ))}
          </nav>
        )}
      </section>

      {error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          ⚠️ {error.message}
        </p>
      )}

      {!error && (sites?.length ?? 0) === 0 && (
        <p className="rounded-2xl border border-cream-300 bg-white p-6 text-center text-sm text-ink-500">
          — 결과 없음. 검색어·필터를 바꿔보세요.
        </p>
      )}

      {(sites?.length ?? 0) > 0 && (
        <p className="text-xs text-ink-500">
          {sites?.length}건 표시 {sites?.length === 500 && "(최대 500건 제한 — 검색·필터로 좁혀주세요)"}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {[...grouped.entries()].map(([groupKey, items]) => (
          <section
            key={groupKey}
            className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm"
          >
            <h2 className="border-b border-cream-200 pb-2 text-sm font-semibold text-navy-900">
              {isAll ? (SHEET_LABEL[groupKey] ?? groupKey) : groupKey}
              <span className="ml-2 text-[11px] font-normal text-ink-500">
                {items.length}건
              </span>
            </h2>
            <ul className="mt-2 divide-y divide-cream-200">
              {items.map((s) => {
                const isEditing = sp.edit === s.id;
                return (
                  <li
                    key={s.id}
                    className={`py-2.5 ${isEditing ? "bg-gold-100/40 -mx-2 px-2 rounded" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {s.category && (
                            <span className="rounded bg-cream-200 px-1.5 py-0.5 text-[9px] font-medium text-ink-700">
                              {s.category}
                            </span>
                          )}
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-navy-900 hover:text-gold-600 hover:underline"
                          >
                            {s.name}
                          </a>
                          <ExternalLink className="size-3 text-ink-300" aria-hidden />
                        </div>
                        {s.description && (
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-700">
                            {s.description}
                          </p>
                        )}
                        <p className="mt-0.5 truncate text-[10px] text-ink-500">
                          {s.url}
                        </p>
                      </div>
                      <Link
                        href={`/admin/sites?edit=${s.id}`}
                        className="shrink-0 rounded-md border border-cream-300 px-2 py-1 text-[10px] text-navy-700 hover:bg-cream-100"
                        aria-label="편집"
                      >
                        <Pencil className="size-3" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function SiteForm({
  editing,
  defaultSheet,
  allCategories,
}: {
  editing: Site | null;
  defaultSheet: string;
  allCategories: string[];
}) {
  const isNew = !editing;
  return (
    <div className="flex flex-col gap-3">
      <form action={upsertMonitoringSiteAction} className="flex flex-col gap-3">
        {editing && <input type="hidden" name="id" value={editing.id} />}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">시트 *</span>
            <select
              name="sheet"
              defaultValue={editing?.sheet ?? defaultSheet}
              required
              className="rounded-md border border-cream-300 bg-white px-2 py-1 text-sm"
            >
              {SHEETS.map(([key, label]) => (
                <option key={key} value={key}>
                  {label} — {key}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">
              섹션 (선택 / 시트 내 그룹)
            </span>
            <input
              name="section"
              defaultValue={editing?.section ?? ""}
              placeholder="종합 한인 커뮤니티 / Group of Eight (G8)"
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">
              카테고리 (선택 / 태그)
            </span>
            <input
              name="category"
              defaultValue={editing?.category ?? ""}
              list="site-cat-list"
              placeholder="NSW / 종합 커뮤니티 / 485"
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
            <datalist id="site-cat-list">
              {allCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">
              정렬 (작을수록 먼저 / 비우면 자동)
            </span>
            <input
              name="display_order"
              type="number"
              defaultValue={editing?.display_order != null ? String(editing.display_order) : ""}
              placeholder="자동"
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">사이트명 *</span>
          <input
            name="name"
            defaultValue={editing?.name ?? ""}
            required
            placeholder="호주나라 (HojuNara)"
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">URL *</span>
          <input
            name="url"
            type="url"
            defaultValue={editing?.url ?? ""}
            required
            placeholder="https://www.example.com"
            className="rounded-md border border-cream-300 px-2 py-1 text-sm font-mono"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">설명 (한 줄)</span>
          <input
            name="description"
            defaultValue={editing?.description ?? ""}
            placeholder="호주 최대 한인 커뮤니티. 구인구직, 부동산, 중고거래, 생활정보"
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          />
        </label>

        <div className="flex justify-end">
          <Button type="submit" size="sm">
            {isNew ? "+ 추가" : "저장"}
          </Button>
        </div>
      </form>

      {!isNew && editing && (
        <form
          action={deleteMonitoringSiteAction}
          className="flex justify-end pt-2 border-t border-cream-200"
        >
          <input type="hidden" name="id" value={editing.id} />
          <button type="submit" className="text-[11px] text-error hover:underline">
            🗑️ 이 사이트 삭제
          </button>
        </form>
      )}
    </div>
  );
}
