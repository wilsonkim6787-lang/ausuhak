// 직원용 내부 FAQ 검색 (PART G).
// internal_faqs_staff 뷰 = card_text + internal_data (wilson_note는 차단됨).
// 검색 쿼리(q) = question / card_text / internal_data / matching_keywords 부분 일치.

import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/requireStaff";

type FaqRow = {
  id: string;
  faq_id: string;
  module_type: string;
  category: string | null;
  question: string | null;
  card_text: string | null;
  internal_data: string | null;
  matching_keywords: string[] | null;
};

const MODULE_LABEL: Record<string, string> = {
  scenario: "시나리오",
  school: "학교",
  region: "지역",
  major: "전공",
  visa_pr: "비자/PR",
};

export default async function StaffFaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; module?: string }>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const moduleFilter = sp.module ?? "";

  const supabase = await createClient();
  let query = supabase
    .from("internal_faqs_staff")
    .select(
      "id, faq_id, module_type, category, question, card_text, internal_data, matching_keywords",
    )
    .order("module_type", { ascending: true })
    .limit(200);

  if (moduleFilter) query = query.eq("module_type", moduleFilter);
  if (q) {
    // ILIKE on question + card_text (Postgres or() filter)
    const pattern = `%${q}%`;
    query = query.or(
      `question.ilike.${pattern},card_text.ilike.${pattern},internal_data.ilike.${pattern},category.ilike.${pattern},faq_id.ilike.${pattern}`,
    );
  }

  const { data, error } = await query;
  const rows = (data ?? []) as FaqRow[];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy-900">🔍 내부 FAQ</h1>
        <p className="mt-1 text-sm text-ink-500">
          총 84 FAQ (시나리오 36 / 학교 24 / 지역 8 / 전공 10 / 비자&PR 5). Wilson 전용 메모는 자동 마스킹.
        </p>
      </header>

      {/* 검색 폼 */}
      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="키워드 / 질문 / 카테고리 / faq_id"
          className="flex-1 rounded-lg border border-cream-300 bg-white px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-gold-500"
        />
        <select
          name="module"
          defaultValue={moduleFilter}
          className="rounded-lg border border-cream-300 bg-white px-3 py-2.5 text-sm text-navy-900 outline-none focus:border-gold-500"
        >
          <option value="">전체 모듈</option>
          {Object.entries(MODULE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
        >
          검색
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
          FAQ 조회 실패: {error.message}
        </p>
      )}

      <p className="text-xs text-ink-500">
        결과 {rows.length}건{q && ` · 검색어: "${q}"`}
        {moduleFilter && ` · 모듈: ${MODULE_LABEL[moduleFilter] ?? moduleFilter}`}
      </p>

      {rows.length === 0 && !error ? (
        <p className="rounded-2xl border border-cream-300 bg-cream-100/40 px-4 py-8 text-center text-sm text-ink-500">
          일치하는 FAQ가 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((f) => <FaqCard key={f.id} faq={f} />)}
        </ul>
      )}
    </div>
  );
}

function FaqCard({ faq }: { faq: FaqRow }) {
  return (
    <li className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold text-gold-400">
          {MODULE_LABEL[faq.module_type] ?? faq.module_type}
        </span>
        {faq.category && (
          <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium text-navy-700">
            {faq.category}
          </span>
        )}
        <span className="font-mono text-[10px] text-ink-500">{faq.faq_id}</span>
      </div>

      {faq.question && (
        <p className="mt-2 font-display text-base font-semibold text-navy-900">
          {faq.question}
        </p>
      )}

      {faq.card_text && (
        <div className="mt-2 rounded-lg border border-cream-200 bg-cream-100/40 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-success">
            ✅ 학생 카드 (card_text)
          </p>
          <p className="whitespace-pre-line text-sm text-ink-700">{faq.card_text}</p>
        </div>
      )}

      {faq.internal_data && (
        <div className="mt-2 rounded-lg border border-error/20 bg-error/5 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-error">
            🔴 직원 전용 (internal_data) — 학생 노출 X
          </p>
          <p className="whitespace-pre-line text-sm text-ink-700">{faq.internal_data}</p>
        </div>
      )}

      {faq.matching_keywords && faq.matching_keywords.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {faq.matching_keywords.slice(0, 8).map((k, i) => (
            <li
              key={i}
              className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] text-navy-700"
            >
              #{k}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
