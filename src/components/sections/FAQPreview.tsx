"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function FAQPreview() {
  const t = useTranslations("FAQPreview");
  const [open, setOpen] = useState<number | null>(0);

  const items = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
  ];

  return (
    <section id="faq" className="bg-cream-200">
      <div className="container mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mb-12 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-navy-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("intro")}
          </p>
        </div>

        <ul className="space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li
                key={i}
                className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-cream-100 sm:px-7 sm:py-6"
                >
                  <span className="text-base font-semibold text-navy-900 sm:text-lg">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className={`shrink-0 font-display text-2xl text-gold-600 transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-cream-300 px-6 py-5 sm:px-7 sm:py-6">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink-700 sm:text-base">
                      {item.a}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-12 rounded-2xl border border-cream-300 bg-white p-7 text-center shadow-sm sm:p-9">
          <p className="font-display text-xl font-bold text-navy-900 sm:text-2xl">
            {t("ctaTitle")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-700 sm:text-base">
            {t("ctaBody")}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="https://pf.kakao.com/_GadTX"
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="faq-preview"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-7 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg"
            >
              {t("ctaKakao")}
            </a>
            <Link
              href="/diagnose"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-navy-800 px-6 py-3.5 text-base font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-cream-100"
            >
              {t("ctaDiagnose")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
