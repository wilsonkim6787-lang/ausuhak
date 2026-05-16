// /admin/faqs 통합 관리 — 3 탭 (internal_faqs / public_faqs / staff_manuals).
// admin/layout 이 이미 super_admin 가드 (page 자체엔 추가 가드 X).
// 현 라운드 풀 CRUD: staff_manuals / internal_faqs 부분 편집 / public_faqs 정적 노출 안내.

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { FAQ_CATEGORIES, getTotalCount as getPublicFaqTotal } from "@/data/faqs";
import {
  upsertStaffManualAction,
  deleteStaffManualAction,
  updateInternalFaqAction,
} from "./actions";

type Tab = "internal" | "public" | "staff";
const TABS: { key: Tab; label: string; count?: number }[] = [
  { key: "internal", label: "🔴 internal_faqs (견적 엔진)" },
  { key: "public", label: "🟢 public_faqs (학생용 JSON)" },
  { key: "staff", label: "🟡 staff_manuals (직원 매뉴얼)" },
];

export default async function AdminFaqsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    edit?: string;
    cat?: string;
    q?: string;
    new?: string;
  }>;
}) {
  const sp = await searchParams;
  const tab: Tab = (["internal", "public", "staff"].includes(sp.tab ?? "")
    ? sp.tab
    : "staff") as Tab;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy-900">
          📚 FAQ 통합 관리
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          3 데이터셋 중앙 관리. Wilson 만 편집 가능.
        </p>
      </header>

      {/* 탭 네비 */}
      <nav className="flex flex-wrap gap-2 border-b border-cream-300" role="tablist">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/faqs?tab=${t.key}`}
            role="tab"
            aria-selected={tab === t.key}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition ${
              tab === t.key
                ? "border-gold-600 text-navy-900"
                : "border-transparent text-ink-500 hover:text-navy-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "internal" && <InternalSection sp={sp} />}
      {tab === "public" && <PublicSection />}
      {tab === "staff" && <StaffSection sp={sp} />}
    </div>
  );
}

// ─── internal_faqs 부분 편집 (question/card_text/internal_data/wilson_note) ───
async function InternalSection({
  sp,
}: {
  sp: { edit?: string; cat?: string; q?: string };
}) {
  const supabase = await createClient();
  const search = (sp.q ?? "").trim();

  let listQuery = supabase
    .from("internal_faqs")
    .select("id, faq_id, module_type, category, question")
    .order("module_type")
    .order("category");
  if (sp.cat && sp.cat !== "all") listQuery = listQuery.eq("module_type", sp.cat);
  if (search) {
    const safe = search.replace(/%/g, "");
    listQuery = listQuery.or(`question.ilike.%${safe}%,faq_id.ilike.%${safe}%`);
  }

  // 리스트 + 편집 대상 병렬 fetch
  const [listRes, editRes] = await Promise.all([
    listQuery.limit(200),
    sp.edit
      ? supabase
          .from("internal_faqs")
          .select("id, faq_id, module_type, category, question, card_text, internal_data, wilson_note")
          .eq("id", sp.edit)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);
  const rows = listRes.data;
  const error = listRes.error;
  const editingRow = editRes.data ?? null;

  const moduleTypes = [
    { key: "scenario", label: "시나리오" },
    { key: "school", label: "학교" },
    { key: "region", label: "지역" },
    { key: "major", label: "전공" },
    { key: "visa_pr", label: "비자/PR" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <section className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
        <form action="/admin/faqs" className="flex gap-2">
          <input type="hidden" name="tab" value="internal" />
          {sp.cat && <input type="hidden" name="cat" value={sp.cat} />}
          <input
            name="q"
            defaultValue={search}
            placeholder="검색 (질문·faq_id)"
            className="flex-1 rounded-md border border-cream-300 px-2 py-1 text-xs"
          />
          <button type="submit" className="rounded-md bg-navy-900 px-3 py-1 text-xs font-semibold text-gold-400">
            🔍
          </button>
        </form>

        <nav className="mt-3 flex flex-wrap gap-1">
          <Link
            href={`/admin/faqs?tab=internal${search ? `&q=${encodeURIComponent(search)}` : ""}`}
            className={`rounded-full px-2.5 py-0.5 text-[11px] ${
              !sp.cat || sp.cat === "all" ? "bg-navy-900 text-white" : "border border-cream-300 text-navy-700"
            }`}
          >
            전체
          </Link>
          {moduleTypes.map((m) => (
            <Link
              key={m.key}
              href={`/admin/faqs?tab=internal&cat=${m.key}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                sp.cat === m.key ? "bg-navy-900 text-white" : "border border-cream-300 text-navy-700"
              }`}
            >
              {m.label}
            </Link>
          ))}
        </nav>

        {error && <p className="mt-3 text-xs text-error">{error.message}</p>}
        <ul className="mt-3 divide-y divide-cream-200 max-h-[60vh] overflow-y-auto">
          {(rows ?? []).map((r) => {
            const row = r as { id: string; faq_id: string; module_type: string; category: string | null; question: string | null };
            return (
              <li key={row.id}>
                <Link
                  href={`/admin/faqs?tab=internal&edit=${row.id}${sp.cat ? `&cat=${sp.cat}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                  className={`block px-2 py-2 text-xs transition hover:bg-cream-100 ${
                    sp.edit === row.id ? "bg-gold-100" : ""
                  }`}
                >
                  <p className="font-semibold text-navy-900 truncate">{row.question || "(질문 없음)"}</p>
                  <p className="mt-0.5 text-[10px] text-ink-500 font-mono">
                    {row.module_type} · {row.category ?? "—"} · {row.faq_id}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-center text-[10px] text-ink-500">
          최대 200건 표시. {rows?.length ?? 0}건.
        </p>
      </section>

      <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
        {!editingRow ? (
          <p className="text-sm text-ink-500">← 항목 선택 시 편집 (question · card_text · internal_data · wilson_note 4 필드. matching arrays 등 고급 필드는 Supabase 대시보드에서 직접).</p>
        ) : (
          <InternalEditForm
            key={String(editingRow.id ?? "new")}
            row={editingRow as Record<string, string | null>}
          />
        )}
      </section>
    </div>
  );
}

function InternalEditForm({ row }: { row: Record<string, string | null> }) {
  return (
    <form action={updateInternalFaqAction} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={row.id ?? ""} />
      <div>
        <p className="text-[10px] font-mono text-ink-500">
          {row.module_type} · {row.category ?? "—"} · {row.faq_id}
        </p>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-navy-900">Question</span>
        <input
          name="question"
          defaultValue={row.question ?? ""}
          className="rounded-md border border-cream-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-navy-900">card_text (✅ 학생 노출)</span>
        <textarea
          name="card_text"
          defaultValue={row.card_text ?? ""}
          rows={4}
          className="rounded-md border border-cream-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-navy-900">internal_data (🔴 직원만)</span>
        <textarea
          name="internal_data"
          defaultValue={row.internal_data ?? ""}
          rows={4}
          className="rounded-md border border-cream-300 px-2 py-1 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-navy-900">wilson_note (🔴🔴 Wilson 만)</span>
        <textarea
          name="wilson_note"
          defaultValue={row.wilson_note ?? ""}
          rows={3}
          className="rounded-md border border-cream-300 px-2 py-1 text-sm"
        />
      </label>
      <div className="flex justify-end">
        <Button type="submit" size="sm">
          저장
        </Button>
      </div>
    </form>
  );
}

// ─── public_faqs (wilson-faqs.json) 안내 ─────────────────
function PublicSection() {
  const total = getPublicFaqTotal();
  return (
    <section className="flex flex-col gap-3">
      <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
        <h2 className="font-display text-base font-bold text-navy-900">
          학생용 FAQ {total}개 (wilson-faqs.json 정적 파일)
        </h2>
        <p className="mt-2 text-sm text-ink-700 leading-relaxed">
          현재 학생용 FAQ ({total}개) 는 <code className="rounded bg-cream-100 px-1 py-0.5 text-xs">src/data/wilson-faqs.json</code> 정적 파일로 관리됩니다. 메인 페이지·<code className="rounded bg-cream-100 px-1 py-0.5 text-xs">/faq</code> 에 노출 중.
        </p>
        <p className="mt-2 text-sm text-ink-700 leading-relaxed">
          🤖 <strong>업데이트 방법</strong>: Wilson 이 카톡으로 변경 요청 → Claude 가 JSON 파일 수정 + git 푸시 → Vercel 자동 배포 (5분 이내 라이브). DB UI 편집은 향후 마이그레이션 (`public_faqs` 테이블) 에서 활성화 예정.
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {FAQ_CATEGORIES.map((cat, i) => (
          <li
            key={i}
            className="rounded-xl border border-cream-300 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-sm font-semibold text-navy-900">
              {cat.icon} {cat.name}
            </p>
            <p className="mt-0.5 text-xs text-ink-500">{cat.items.length}개 항목</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── staff_manuals 풀 CRUD ──────────────────────────────
async function StaffSection({
  sp,
}: {
  sp: { edit?: string; cat?: string; q?: string; new?: string };
}) {
  const supabase = await createClient();
  const search = (sp.q ?? "").trim();
  const showNew = sp.new === "1";

  // 리스트 쿼리 빌드
  let listQuery = supabase
    .from("staff_manuals")
    .select("id, number, category, title")
    .order("number");
  if (sp.cat && sp.cat !== "all") {
    if (sp.cat === "미분류") listQuery = listQuery.is("category", null);
    else listQuery = listQuery.eq("category", sp.cat);
  }
  if (search) {
    const safe = search.replace(/%/g, "");
    listQuery = listQuery.or(`title.ilike.%${safe}%,search_text.ilike.%${safe}%`);
  }

  // 카테고리 카운트 + 리스트 + 편집 대상 병렬 fetch (3 queries 동시)
  const [catRowsRes, listRes, editRes] = await Promise.all([
    supabase.from("staff_manuals").select("category"),
    listQuery.limit(200),
    sp.edit
      ? supabase
          .from("staff_manuals")
          .select("id, number, category, title, content")
          .eq("id", sp.edit)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const catCounts = new Map<string, number>();
  for (const r of (catRowsRes.data ?? []) as { category: string | null }[]) {
    const c = r.category ?? "미분류";
    catCounts.set(c, (catCounts.get(c) ?? 0) + 1);
  }
  const sortedCats = [...catCounts.entries()].sort((a, b) => b[1] - a[1]);
  const totalCount = sortedCats.reduce((s, [, n]) => s + n, 0);

  const manuals = listRes.data;
  const listError = listRes.error;
  let editing: Record<string, unknown> | null = null;
  if (sp.edit) {
    if (!editRes.data) notFound();
    editing = editRes.data;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <section className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-navy-900">총 {totalCount}</p>
          <Link
            href="/admin/faqs?tab=staff&new=1"
            className="rounded-full bg-gold-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-gold-500"
          >
            + 신규
          </Link>
        </div>

        <form action="/admin/faqs" className="mt-3 flex gap-2">
          <input type="hidden" name="tab" value="staff" />
          {sp.cat && <input type="hidden" name="cat" value={sp.cat} />}
          <input
            name="q"
            defaultValue={search}
            placeholder="검색"
            className="flex-1 rounded-md border border-cream-300 px-2 py-1 text-xs"
          />
          <button type="submit" className="rounded-md bg-navy-900 px-3 py-1 text-xs font-semibold text-gold-400">
            🔍
          </button>
        </form>

        <nav className="mt-3 flex flex-wrap gap-1">
          <Link
            href={`/admin/faqs?tab=staff${search ? `&q=${encodeURIComponent(search)}` : ""}`}
            className={`rounded-full px-2.5 py-0.5 text-[11px] ${
              !sp.cat || sp.cat === "all" ? "bg-navy-900 text-white" : "border border-cream-300 text-navy-700"
            }`}
          >
            전체 {totalCount}
          </Link>
          {sortedCats.map(([c, n]) => (
            <Link
              key={c}
              href={`/admin/faqs?tab=staff&cat=${encodeURIComponent(c)}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                sp.cat === c ? "bg-navy-900 text-white" : "border border-cream-300 text-navy-700"
              }`}
            >
              {c} {n}
            </Link>
          ))}
        </nav>

        {listError && <p className="mt-3 text-xs text-error">{listError.message}</p>}
        <ul className="mt-3 divide-y divide-cream-200 max-h-[60vh] overflow-y-auto">
          {(manuals ?? []).map((m) => {
            const row = m as { id: string; number: number; category: string | null; title: string };
            return (
              <li key={row.id}>
                <Link
                  href={`/admin/faqs?tab=staff&edit=${row.id}${sp.cat ? `&cat=${sp.cat}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                  className={`block px-2 py-2 text-xs transition hover:bg-cream-100 ${
                    sp.edit === row.id ? "bg-gold-100" : ""
                  }`}
                >
                  <p className="text-navy-900">
                    <span className="font-mono font-bold text-gold-600">#{row.number}</span>{" "}
                    <span className="font-medium">{row.title}</span>
                  </p>
                  {row.category && (
                    <p className="mt-0.5 text-[10px] text-ink-500">{row.category}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-center text-[10px] text-ink-500">최대 200건 표시. {manuals?.length ?? 0}건.</p>
      </section>

      <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
        {!editing && !showNew ? (
          <p className="text-sm text-ink-500">← 항목 선택 시 편집 / 또는 우상단 "+ 신규" 클릭</p>
        ) : (
          <StaffManualForm
            key={editing ? String(editing.id) : "new"}
            row={(editing ?? null) as Record<string, string | number | null> | null}
            sortedCats={sortedCats}
          />
        )}
      </section>
    </div>
  );
}

function StaffManualForm({
  row,
  sortedCats,
}: {
  row: Record<string, string | number | null> | null;
  sortedCats: Array<[string, number]>;
}) {
  const isNew = !row;
  return (
    <div className="flex flex-col gap-3">
      <form action={upsertStaffManualAction} className="flex flex-col gap-3">
        {!isNew && row && <input type="hidden" name="id" value={String(row.id ?? "")} />}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">번호 (선택)</span>
            <input
              name="number"
              type="number"
              defaultValue={row?.number != null ? String(row.number) : ""}
              placeholder={isNew ? "비우면 자동" : ""}
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">카테고리</span>
            <input
              name="category"
              defaultValue={row?.category != null ? String(row.category) : ""}
              list="cat-list"
              placeholder="예: 비자, 학력_검정고시"
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
            <datalist id="cat-list">
              {sortedCats.map(([c]) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">제목</span>
          <input
            name="title"
            defaultValue={row?.title != null ? String(row.title) : ""}
            required
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">본문 (markdown)</span>
          <textarea
            name="content"
            defaultValue={row?.content != null ? String(row.content) : ""}
            required
            rows={20}
            className="rounded-md border border-cream-300 px-2 py-1 text-sm font-mono"
          />
        </label>
        <div className="flex items-center justify-between">
          <Button type="submit" size="sm">
            {isNew ? "+ 추가" : "저장"}
          </Button>
        </div>
      </form>

      {!isNew && row && (
        <form action={deleteStaffManualAction} className="flex justify-end pt-2 border-t border-cream-200">
          <input type="hidden" name="id" value={String(row.id ?? "")} />
          <button
            type="submit"
            className="text-[11px] text-error hover:underline"
          >
            🗑️ 이 항목 삭제
          </button>
        </form>
      )}
    </div>
  );
}
