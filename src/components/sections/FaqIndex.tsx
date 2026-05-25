// 메인 페이지 FAQ 카테고리 인덱스 — DiagnoseCTA 대체.
// FAQ_CATEGORIES (10 카테고리) 카드 그리드. 각 카드 → /faq?cat=N

import Link from "next/link";
import { FAQ_CATEGORIES, getTotalCount } from "@/data/faqs";

export default function FaqIndex() {
  const total = getTotalCount();

  return (
    <section className="bg-cream-100 py-16 sm:py-20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wider text-gold-600">
          자주 묻는 질문
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">
          내 상황에 맞는 질문부터 골라보세요
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
          Wilson 이 19년 동안 가장 많이 받은 질문 {total}개. 10 카테고리.
          본인 상황과 가까운 카테고리부터 시작하세요.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FAQ_CATEGORIES.map((c, i) => (
            <li key={i}>
              <Link
                href={`/faq?cat=${i}`}
                className="group flex h-full items-start gap-3 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-600 hover:shadow-md"
              >
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-xl"
                >
                  {c.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base font-bold text-navy-900 group-hover:text-gold-600">
                    {c.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {c.items.length}개 질문
                  </p>
                </div>
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

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-full border border-navy-900 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-navy-900 hover:text-white"
          >
            📚 전체 카테고리 보기
          </Link>
          <p className="text-xs text-ink-500">
            답을 못 찾으시면 Wilson 카카오 1:1 상담에서 직접 안내합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
