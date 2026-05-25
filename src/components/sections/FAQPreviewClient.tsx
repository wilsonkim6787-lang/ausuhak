"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import FaqAccordion from "@/components/faq/FaqAccordion";
import type { FaqItem } from "@/data/faqs";

interface CategoryPreview {
  icon: string;
  name: string;
  items: FaqItem[];
}

interface Props {
  categories: CategoryPreview[];
  labels: {
    eyebrow: string;
    title: string;
    subtitle: string;
    seeAllLabel: string;
    ctaTitle: string;
    ctaBody: string;
    ctaKakao: string;
  };
}

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default function FAQPreviewClient({ categories, labels }: Props) {
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  const activeCat = categories[active];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const hits: { cat: CategoryPreview; catIdx: number; item: FaqItem }[] = [];
    categories.forEach((c, ci) => {
      c.items.forEach((it) => {
        if (
          it.q.toLowerCase().includes(q) ||
          it.a.toLowerCase().includes(q)
        ) {
          hits.push({ cat: c, catIdx: ci, item: it });
        }
      });
    });
    return hits;
  }, [query, categories]);

  return (
    <section id="faq" className="bg-cream-100">
      <div className="container mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {labels.eyebrow}
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-navy-900 sm:text-5xl">
            {labels.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
            {labels.subtitle}
          </p>
        </div>

        {/* 검색바 */}
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-ink-400"
            >
              🔍
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="키워드 검색 (예: 검정고시, 간호, 학비, IELTS)"
              className="w-full rounded-full border border-cream-300 bg-white py-3.5 pl-11 pr-5 text-sm shadow-sm transition focus:border-gold-600 focus:outline-none focus:ring-2 focus:ring-gold-600/20 sm:text-base"
            />
          </div>
        </div>

        {/* 검색 결과 모드 */}
        {filtered !== null ? (
          <div className="mx-auto mt-10 max-w-3xl">
            <p className="mb-5 text-center text-sm text-ink-500">
              {filtered.length === 0 ? (
                <>
                  &lsquo;<strong className="text-navy-900">{query}</strong>&rsquo; 검색 결과 없음 — 카카오 상담에서 직접 문의해주세요
                </>
              ) : (
                <>
                  &lsquo;<strong className="text-navy-900">{query}</strong>&rsquo; 검색 결과 <strong className="text-gold-600">{filtered.length}</strong>건
                </>
              )}
            </p>
            {filtered.length > 0 && (
              <FaqAccordion
                items={filtered.slice(0, 12).map((h) => ({
                  q: `${h.cat.icon} ${h.item.q}`,
                  a: h.item.a,
                }))}
              />
            )}
            <div className="mt-8 rounded-2xl bg-cream-200 px-6 py-7 text-center sm:px-8">
              <p className="text-sm font-semibold text-ink-900 sm:text-base">
                {filtered.length === 0
                  ? "원하는 답을 못 찾으셨나요?"
                  : "더 자세한 상담이 필요하신가요?"}
              </p>
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg"
              >
                카카오 상담하기 <span aria-hidden>→</span>
              </a>
              <p className="mt-3 text-xs text-ink-500">1차 카톡 상담은 무료입니다</p>
            </div>
          </div>
        ) : (
          <>
            {/* 카테고리 그리드 */}
            <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((c, i) => {
                const isActive = active === i;
                return (
                  <li key={c.name}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-pressed={isActive}
                      className={`flex h-full w-full flex-col items-start gap-1 rounded-2xl border-2 px-4 py-3.5 text-left transition ${
                        isActive
                          ? "border-gold-600 bg-gold-600 text-white shadow-md"
                          : "border-cream-300 bg-white text-navy-900 hover:border-gold-600/50 hover:bg-cream-100/60"
                      }`}
                    >
                      <span aria-hidden className="text-2xl">
                        {c.icon}
                      </span>
                      <span className="text-sm font-semibold leading-tight sm:text-[15px]">
                        {c.name.replace(/[🌱💰🎓🏥🍳💼🛂🏠👨‍👩‍👧📞]\s*/g, "")}
                      </span>
                      <span
                        className={`text-[11px] font-medium ${
                          isActive ? "text-cream-100/80" : "text-ink-500"
                        }`}
                      >
                        {c.items.length}개
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* 활성 카테고리 헤더 + 리스트 */}
            <div className="mx-auto mt-10 max-w-3xl">
              <div className="mb-5 flex items-baseline justify-between gap-3 border-b border-cream-300 pb-3">
                <div className="flex items-center gap-2.5">
                  <span aria-hidden className="text-2xl">
                    {activeCat.icon}
                  </span>
                  <h3 className="font-display text-xl font-bold text-navy-900 sm:text-2xl">
                    {activeCat.name.replace(/[🌱💰🎓🏥🍳💼🛂🏠👨‍👩‍👧📞]\s*/g, "")}
                  </h3>
                </div>
                <Link
                  href={`/faq?cat=${active}`}
                  className="shrink-0 text-xs font-semibold text-gold-600 transition hover:text-gold-500 sm:text-sm"
                >
                  {labels.seeAllLabel} <span aria-hidden>→</span>
                </Link>
              </div>
              <FaqAccordion items={activeCat.items.slice(0, 5)} />
            </div>
          </>
        )}

        {/* CTA — 검색 결과 없거나 미리보기 모드 둘 다 노출 */}
        <div className="mx-auto mt-14 max-w-3xl rounded-3xl bg-navy-900 px-6 py-8 text-center text-cream-100 sm:px-10 sm:py-10">
          <p className="font-display text-xl font-bold sm:text-2xl">
            {labels.ctaTitle}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-cream-200 sm:text-base">
            {labels.ctaBody}
          </p>
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="faq-preview"
            className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg"
          >
            {labels.ctaKakao} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
