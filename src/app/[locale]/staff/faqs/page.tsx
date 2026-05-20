// 직원용 내부 FAQ 검색 (PART G).
// internal_faqs_staff 뷰 = card_text + internal_data (wilson_note는 차단됨).
// 검색 쿼리(q) = question / card_text / internal_data / matching_keywords 부분 일치.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/requireStaff";
import { renderAnswer } from "@/components/faq/answerRenderer";

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

const MODULE_ICON: Record<string, string> = {
  scenario: "🎯",
  school: "🎓",
  region: "📍",
  major: "💼",
  visa_pr: "🛂",
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
    const pattern = `%${q}%`;
    query = query.or(
      `question.ilike.${pattern},card_text.ilike.${pattern},internal_data.ilike.${pattern},category.ilike.${pattern},faq_id.ilike.${pattern}`,
    );
  }

  const { data, error } = await query;
  const rows = (data ?? []) as FaqRow[];

  const buildHref = (mod: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (mod) params.set("module", mod);
    const qs = params.toString();
    return `/staff/faqs${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-3xl font-bold text-navy-900">
            🔍 내부 FAQ
          </h1>
          <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-medium text-navy-700">
            직원 전용
          </span>
        </div>
        <p className="text-sm text-ink-700">
          총 <strong className="text-navy-900">84개</strong> · 시나리오 36 · 학교 24 · 지역 8 · 전공 10 · 비자&amp;PR 5. Wilson 전용 메모는 자동 마스킹.
        </p>
      </header>

      {/* 검색바 */}
      <form method="get" className="space-y-4">
        <input type="hidden" name="module" value={moduleFilter} />
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
            defaultValue={q}
            placeholder="키워드 / 질문 / 카테고리 / faq_id"
            className="w-full rounded-full border border-cream-300 bg-white py-3.5 pl-11 pr-28 text-sm text-navy-900 shadow-sm transition focus:border-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-600/20 sm:text-base"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            검색
          </button>
        </div>

        {/* 모듈 필터 = pill 버튼 */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildHref("")}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition sm:text-sm ${
              !moduleFilter
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-cream-300 bg-white text-navy-700 hover:border-gold-600/50"
            }`}
          >
            전체
          </Link>
          {Object.entries(MODULE_LABEL).map(([k, v]) => {
            const isActive = moduleFilter === k;
            return (
              <Link
                key={k}
                href={buildHref(k)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition sm:text-sm ${
                  isActive
                    ? "border-gold-600 bg-gold-600 text-white"
                    : "border-cream-300 bg-white text-navy-700 hover:border-gold-600/50"
                }`}
              >
                <span aria-hidden>{MODULE_ICON[k]}</span>
                {v}
              </Link>
            );
          })}
        </div>
      </form>

      {error && (
        <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error">
          FAQ 조회 실패: {error.message}
        </p>
      )}

      {/* 결과 카운트 */}
      <div className="flex items-baseline justify-between border-b border-cream-300 pb-2">
        <p className="text-sm text-ink-700">
          결과 <strong className="text-navy-900">{rows.length}</strong>건
          {q && (
            <>
              {" "}
              · &ldquo;<strong className="text-gold-600">{q}</strong>&rdquo;
            </>
          )}
          {moduleFilter && (
            <>
              {" "}
              · {MODULE_LABEL[moduleFilter] ?? moduleFilter}
            </>
          )}
        </p>
        {(q || moduleFilter) && (
          <Link
            href="/staff/faqs"
            className="text-xs font-medium text-ink-500 transition hover:text-navy-900"
          >
            필터 초기화 ✕
          </Link>
        )}
      </div>

      {/* 결과 리스트 */}
      {rows.length === 0 && !error ? (
        <div className="rounded-2xl border border-cream-300 bg-cream-100/40 px-6 py-12 text-center">
          <p className="text-3xl">🔎</p>
          <p className="mt-3 text-sm font-medium text-navy-900">
            일치하는 FAQ 가 없습니다
          </p>
          <p className="mt-1 text-xs text-ink-500">
            검색어를 다르게 시도하거나 필터를 초기화해보세요.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((f) => (
            <FaqCard key={f.id} faq={f} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FaqCard({ faq }: { faq: FaqRow }) {
  return (
    <li className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm transition hover:border-gold-600/40 hover:shadow-md">
      {/* 헤더 = 태그 + question */}
      <div className="border-b border-cream-300 bg-cream-100/40 px-5 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-navy-900 px-2.5 py-0.5 text-[11px] font-bold text-gold-400">
            <span aria-hidden>{MODULE_ICON[faq.module_type] ?? "📄"}</span>
            {MODULE_LABEL[faq.module_type] ?? faq.module_type}
          </span>
          {faq.category && (
            <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-medium text-navy-700">
              {faq.category}
            </span>
          )}
          <span className="ml-auto font-mono text-[10px] text-ink-400">
            {faq.faq_id}
          </span>
        </div>
        {faq.question && (
          <p className="mt-2.5 font-display text-base font-semibold text-navy-900 sm:text-lg">
            {faq.question}
          </p>
        )}
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
        {/* 학생 카드 (markdown 렌더) */}
        {faq.card_text && (
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
              ✅ 학생 노출 (card_text)
            </p>
            <div className="rounded-xl border border-success/20 bg-success/5 px-4 py-4">
              {renderAnswer(faq.card_text)}
            </div>
          </div>
        )}

        {/* 직원 전용 (그대로) */}
        {faq.internal_data && (
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-error">
              🔴 직원 전용 (internal_data)
            </p>
            <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-4">
              {renderAnswer(faq.internal_data)}
            </div>
          </div>
        )}

        {/* 매칭 키워드 */}
        {faq.matching_keywords && faq.matching_keywords.length > 0 && (
          <div className="border-t border-cream-200 pt-3">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
              매칭 키워드
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {faq.matching_keywords.slice(0, 12).map((k, i) => (
                <li
                  key={i}
                  className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[10px] text-navy-700"
                >
                  #{k}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
}
