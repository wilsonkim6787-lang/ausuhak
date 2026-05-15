"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const CATEGORIES = [
  { icon: "\u{1F331}", key: "cat1" },
  { icon: "\u{1F4B0}", key: "cat2" },
  { icon: "\u{1F393}", key: "cat3" },
  { icon: "\u{1F3E5}", key: "cat4" },
  { icon: "\u{1F373}", key: "cat5" },
  { icon: "\u{1F4BC}", key: "cat6" },
  { icon: "\u{1F6C2}", key: "cat7" },
  { icon: "\u{1F3E0}", key: "cat8" },
  { icon: "\u{1F46A}", key: "cat9" },
  { icon: "\u{1F4DE}", key: "cat10" },
] as const;

export default function FAQPreview() {
  const t = useTranslations("FAQPreview");
  const [active, setActive] = useState(0);

  const questions = [t("q1"), t("q2"), t("q3"), t("q4"), t("q5")];

  return (
    <section id="faq" className="bg-cream-200">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-navy-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-3">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.key}
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
              {t(c.key as "cat1")}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white p-7 shadow-sm sm:p-9">
          <ul className="divide-y divide-cream-300">
            {questions.map((q, i) => (
              <li key={i} className="flex items-start gap-3 py-4">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-600"
                />
                <span className="text-base text-navy-900 sm:text-lg">{q}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-ink-500">
            {t("moreLabel")}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-navy-900 p-8 text-center text-cream-100 sm:p-10">
          <p className="font-display text-xl font-bold sm:text-2xl">
            {t("ctaTitle")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cream-200 sm:text-base">
            {t("ctaBody")}
          </p>
          <a
            href="https://pf.kakao.com/_GadTX"
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="faq-preview"
            className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-3.5 text-base font-semibold text-navy-900 shadow-md transition hover:bg-gold-500 hover:shadow-lg"
          >
            {t("ctaKakao")} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
