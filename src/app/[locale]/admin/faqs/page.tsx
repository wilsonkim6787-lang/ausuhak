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
const TABS: { key: Tab; label: string }[] = [
  { key: "internal", label: "🔴 internal_faqs (견적 엔진)" },
  { key: "public",   label: "🟢 public_faqs (학생용 JSON)" },
  { key: "staff",    label: "🟡 staff_manuals (직원 매뉴얼)" },
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
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          관리자 · FAQ
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
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
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
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

// ─── 공통 UI 헬퍼 ───────────────────────────────────────────
function SearchBox({
  defaultQ,
  hiddenFields,
  placeholder,
}: {
  defaultQ: string;
  hiddenFields: { name: string; value: string }[];
  placeholder: string;
}) {
  return (
    <form action="/admin/faqs" className="flex gap-2">
      {hiddenFields.map((h) => (
        <input key={h.name} type="hidden" name={h.name} value={h.value} />
      ))}
      <input
        name="q"
        defaultValue={defaultQ}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none transition focus:border-gold-500 focus:bg-white"
      />
      <button
        type="submit"
        className="rounded-lg bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy-700"
      >
        🔍 검색
      </button>
    </form>
  );
}

function CategoryChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-navy-900 bg-navy-900 text-white"
          : "border-cream-300 bg-white text-navy-700 hover:border-navy-300 hover:bg-cream-100"
      }`}
    >
      <span>{label}</span>
      {count != null && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            active ? "bg-white/20 text-white" : "bg-cream-200 text-ink-700"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function FormLabel({
  children,
  required,
  hint,
  tone,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  tone?: "default" | "warning" | "danger";
}) {
  const color =
    tone === "danger"
      ? "text-error"
      : tone === "warning"
        ? "text-gold-700"
        : "text-navy-900";
  return (
    <div className="flex items-baseline justify-between">
      <span className={`text-xs font-bold ${color}`}>
        {children}
        {required && <span className="ml-1 text-error">*</span>}
      </span>
      {hint && <span className="text-[10px] text-ink-400">{hint}</span>}
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
    { key: "school",   label: "학교" },
    { key: "region",   label: "지역" },
    { key: "major",    label: "전공" },
    { key: "visa_pr",  label: "비자/PR" },
  ];

  const hidden = [{ name: "tab", value: "internal" }];
  if (sp.cat) hidden.push({ name: "cat", value: sp.cat });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      {/* 리스트 */}
      <section className="flex flex-col gap-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
        <SearchBox defaultQ={search} hiddenFields={hidden} placeholder="질문·faq_id 검색" />

        <div className="flex flex-wrap gap-2">
          <CategoryChip
            href={`/admin/faqs?tab=internal${search ? `&q=${encodeURIComponent(search)}` : ""}`}
            label="전체"
            active={!sp.cat || sp.cat === "all"}
          />
          {moduleTypes.map((m) => (
            <CategoryChip
              key={m.key}
              href={`/admin/faqs?tab=internal&cat=${m.key}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              label={m.label}
              active={sp.cat === m.key}
            />
          ))}
        </div>

        {error && <p className="text-xs text-error">{error.message}</p>}
        <ul className="max-h-[60vh] divide-y divide-cream-200 overflow-y-auto rounded-xl border border-cream-200 bg-cream-100/30">
          {(rows ?? []).map((r) => {
            const row = r as { id: string; faq_id: string; module_type: string; category: string | null; question: string | null };
            const active = sp.edit === row.id;
            return (
              <li key={row.id}>
                <Link
                  href={`/admin/faqs?tab=internal&edit=${row.id}${sp.cat ? `&cat=${sp.cat}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                  className={`block px-3 py-2.5 text-xs transition ${
                    active ? "bg-gold-100" : "hover:bg-cream-100"
                  }`}
                >
                  <p className="truncate font-semibold text-navy-900">
                    {row.question || "(질문 없음)"}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-ink-500">
                    {row.module_type} · {row.category ?? "—"} · {row.faq_id}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="text-center text-[10px] text-ink-500">
          최대 200건 표시 · 현재 {rows?.length ?? 0}건
        </p>
      </section>

      {/* 편집 패널 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        {!editingRow ? (
          <EmptyEditState
            label="← 항목 선택 시 편집"
            hint="4 필드 (question · card_text · internal_data · wilson_note). matching arrays 등 고급 필드는 Supabase 대시보드에서 직접."
          />
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

function EmptyEditState({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-cream-300 bg-cream-100/30 py-12 text-center">
      <p className="text-2xl">📋</p>
      <p className="text-sm font-semibold text-navy-900">{label}</p>
      {hint && <p className="mx-auto max-w-md text-xs text-ink-500 leading-relaxed">{hint}</p>}
    </div>
  );
}

function InternalEditForm({ row }: { row: Record<string, string | null> }) {
  return (
    <form action={updateInternalFaqAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={row.id ?? ""} />
      <div className="rounded-lg border border-cream-300 bg-cream-100/50 px-3 py-2">
        <p className="font-mono text-[11px] text-ink-700">
          {row.module_type} · {row.category ?? "—"} · {row.faq_id}
        </p>
      </div>

      <FieldGroup>
        <FormLabel>Question</FormLabel>
        <input
          name="question"
          defaultValue={row.question ?? ""}
          className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none transition focus:border-gold-500 focus:bg-white"
        />
      </FieldGroup>

      <FieldGroup>
        <FormLabel tone="default" hint="학생 노출">card_text ✅</FormLabel>
        <textarea
          name="card_text"
          defaultValue={row.card_text ?? ""}
          rows={5}
          className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-gold-500 focus:bg-white"
        />
      </FieldGroup>

      <FieldGroup>
        <FormLabel tone="warning" hint="🔴 직원만">internal_data</FormLabel>
        <textarea
          name="internal_data"
          defaultValue={row.internal_data ?? ""}
          rows={5}
          className="rounded-lg border border-gold-400/40 bg-gold-100/30 px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-gold-600"
        />
      </FieldGroup>

      <FieldGroup>
        <FormLabel tone="danger" hint="🔴🔴 Wilson 만">wilson_note</FormLabel>
        <textarea
          name="wilson_note"
          defaultValue={row.wilson_note ?? ""}
          rows={4}
          className="rounded-lg border border-error/30 bg-error/5 px-3 py-2.5 text-sm leading-relaxed outline-none transition focus:border-error"
        />
      </FieldGroup>

      <div className="flex justify-end border-t border-cream-200 pt-3">
        <Button type="submit" size="sm">
          💾 저장
        </Button>
      </div>
    </form>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5">{children}</label>;
}

// ─── public_faqs (wilson-faqs.json) 안내 ─────────────────
function PublicSection() {
  const total = getPublicFaqTotal();
  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl border border-success/30 bg-success/5 p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          학생용 FAQ {total}개 (wilson-faqs.json 정적 파일)
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          현재 학생용 FAQ ({total}개) 는{" "}
          <code className="rounded bg-cream-100 px-1.5 py-0.5 font-mono text-xs">src/data/wilson-faqs.json</code> 정적 파일로 관리됩니다. 메인 페이지·
          <code className="rounded bg-cream-100 px-1.5 py-0.5 font-mono text-xs">/faq</code> 에 노출 중.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          🤖 <strong>업데이트 방법</strong>: Wilson 이 카톡으로 변경 요청 → Claude 가 JSON 파일 수정 + git 푸시 → Vercel 자동 배포 (5분 이내 라이브). DB UI 편집은 향후 마이그레이션(<code className="rounded bg-cream-100 px-1.5 py-0.5 font-mono text-xs">public_faqs</code> 테이블)에서 활성화 예정.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {FAQ_CATEGORIES.map((cat, i) => (
          <li
            key={i}
            className="rounded-xl border border-cream-300 bg-white px-4 py-3 shadow-sm transition hover:shadow-md"
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

  const hidden = [{ name: "tab", value: "staff" }];
  if (sp.cat) hidden.push({ name: "cat", value: sp.cat });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      {/* 리스트 */}
      <section className="flex flex-col gap-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-navy-900">
            전체 <span className="font-display text-base">{totalCount}</span>개
          </p>
          <Link
            href="/admin/faqs?tab=staff&new=1"
            className="rounded-full bg-gold-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-gold-500"
          >
            + 신규 매뉴얼
          </Link>
        </div>

        <SearchBox defaultQ={search} hiddenFields={hidden} placeholder="제목·본문 검색" />

        <div className="flex flex-wrap gap-2">
          <CategoryChip
            href={`/admin/faqs?tab=staff${search ? `&q=${encodeURIComponent(search)}` : ""}`}
            label="전체"
            count={totalCount}
            active={!sp.cat || sp.cat === "all"}
          />
          {sortedCats.map(([c, n]) => (
            <CategoryChip
              key={c}
              href={`/admin/faqs?tab=staff&cat=${encodeURIComponent(c)}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              label={c}
              count={n}
              active={sp.cat === c}
            />
          ))}
        </div>

        {listError && <p className="text-xs text-error">{listError.message}</p>}
        <ul className="max-h-[60vh] divide-y divide-cream-200 overflow-y-auto rounded-xl border border-cream-200 bg-cream-100/30">
          {(manuals ?? []).map((m) => {
            const row = m as { id: string; number: number; category: string | null; title: string };
            const active = sp.edit === row.id;
            return (
              <li key={row.id}>
                <Link
                  href={`/admin/faqs?tab=staff&edit=${row.id}${sp.cat ? `&cat=${sp.cat}` : ""}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                  className={`flex items-baseline gap-2 px-3 py-2.5 text-xs transition ${
                    active ? "bg-gold-100" : "hover:bg-cream-100"
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold text-gold-600">#{row.number}</span>
                  <span className="flex-1 truncate font-medium text-navy-900">{row.title}</span>
                  {row.category && (
                    <span className="shrink-0 rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium text-navy-700">
                      {row.category}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="text-center text-[10px] text-ink-500">
          최대 200건 표시 · 현재 {manuals?.length ?? 0}건
        </p>
      </section>

      {/* 편집 패널 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        {!editing && !showNew ? (
          <EmptyEditState
            label="← 매뉴얼 선택 또는 + 신규"
            hint="번호·카테고리·제목·본문 (markdown) 4 필드. 검색 텍스트는 저장 시 자동 생성."
          />
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
    <div className="flex flex-col gap-4">
      <form action={upsertStaffManualAction} className="flex flex-col gap-4">
        {!isNew && row && <input type="hidden" name="id" value={String(row.id ?? "")} />}

        <div className="grid grid-cols-3 gap-4">
          <FieldGroup>
            <FormLabel hint="비우면 자동">번호</FormLabel>
            <input
              name="number"
              type="number"
              defaultValue={row?.number != null ? String(row.number) : ""}
              placeholder={isNew ? "auto" : ""}
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm font-mono outline-none transition focus:border-gold-500 focus:bg-white"
            />
          </FieldGroup>
          <div className="col-span-2">
            <FieldGroup>
              <FormLabel>카테고리</FormLabel>
              <input
                name="category"
                defaultValue={row?.category != null ? String(row.category) : ""}
                list="cat-list"
                placeholder="예: 비자, 학력_검정고시"
                className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none transition focus:border-gold-500 focus:bg-white"
              />
              <datalist id="cat-list">
                {sortedCats.map(([c]) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </FieldGroup>
          </div>
        </div>

        <FieldGroup>
          <FormLabel required>제목</FormLabel>
          <input
            name="title"
            defaultValue={row?.title != null ? String(row.title) : ""}
            required
            className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm font-semibold outline-none transition focus:border-gold-500 focus:bg-white"
          />
        </FieldGroup>

        <FieldGroup>
          <FormLabel required hint="markdown · ## 헤더 · **굵게** · - 리스트">본문</FormLabel>
          <textarea
            name="content"
            defaultValue={row?.content != null ? String(row.content) : ""}
            required
            rows={20}
            placeholder={"## 시작\n매뉴얼 내용을 markdown 으로 작성합니다.\n\n## 1단계\n- 항목 1\n- 항목 2\n\n**굵게**, *기울임*, [텍스트](url) 사용 가능."}
            className="rounded-lg border border-cream-300 bg-cream-100/60 px-4 py-3 font-mono text-[13px] leading-[1.7] outline-none transition focus:border-gold-500 focus:bg-white"
          />
        </FieldGroup>

        <div className="flex items-center justify-between border-t border-cream-200 pt-3">
          <p className="text-[11px] text-ink-500">
            저장 시 검색 텍스트 자동 생성 · 직원은 /staff/manuals 에서 조회
          </p>
          <Button type="submit" size="sm">
            {isNew ? "+ 추가" : "💾 저장"}
          </Button>
        </div>
      </form>

      {!isNew && row && (
        <form action={deleteStaffManualAction} className="flex justify-end">
          <input type="hidden" name="id" value={String(row.id ?? "")} />
          <button
            type="submit"
            className="text-[11px] text-error hover:underline"
          >
            🗑️ 이 매뉴얼 삭제
          </button>
        </form>
      )}
    </div>
  );
}
