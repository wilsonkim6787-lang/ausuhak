"use client";

import { useState } from "react";
import Link from "next/link";

interface CategoryPreview {
  icon: string;
  name: string;
  questions: string[];
}

interface Props {
  categories: CategoryPreview[];
  total: number;
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

export default function FAQPreviewClient({ categories, total, labels }: Props) {
  const [active, setActive] = useState(0);
  const activeCat = categories[active];
  const remaining = total - active * 0; // total은 전체 / per-category remaining 계산은 active 카테고리 기준
  void remaining;

  return (
    <section id="faq" className="bg-cream-200">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
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

        <div className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-3">
          {categories.map((c, i) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                active === i
                  ? "bg-navy-900 text-cream-100 shadow-md"
                  : "bg-white text-ink-700 hover:bg-cream-100"
              }`}
            >
              <span aria-hidden>{c.icon}</span>
              {c.name}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white p-7 shadow-sm sm:p-9">
          <ul className="divide-y divide-cream-300">
            {activeCat.questions.map((q, i) => (
              <li key={i} className="flex items-start gap-3 py-4">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-600"
                />
                <span className="text-base text-navy-900 sm:text-lg">{q}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-center">
            <Link
              href={`/faq?cat=${active}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gold-600 hover:text-gold-500"
            >
              {labels.seeAllLabel} ({total}개) <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-navy-900 p-8 text-center text-cream-100 sm:p-10">
          <p className="font-display text-xl font-bold sm:text-2xl">
            {labels.ctaTitle}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cream-200 sm:text-base">
            {labels.ctaBody}
          </p>
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="faq-preview"
            className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-3.5 text-base font-semibold text-navy-900 shadow-md transition hover:bg-gold-500 hover:shadow-lg"
          >
            {labels.ctaKakao} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
