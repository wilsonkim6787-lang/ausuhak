"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

const ITEMS = [
  { icon: "\u{1F4DD}", titleKey: "item1Title", bodyKey: "item1Body" },
  { icon: "\u{1F3E0}", titleKey: "item2Title", bodyKey: "item2Body" },
  { icon: "\u{1F4C5}", titleKey: "item3Title", bodyKey: "item3Body" },
  { icon: "\u{26A0}\u{FE0F}", titleKey: "item4Title", bodyKey: "item4Body" },
  { icon: "\u{1F4B5}", titleKey: "item5Title", bodyKey: "item5Body" },
  { icon: "\u{1F3AF}", titleKey: "item6Title", bodyKey: "item6Body" },
] as const;

export default function ParentConcerns() {
  const t = useTranslations("ParentConcerns");
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-white">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-navy-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <ul className="mx-auto mt-12 max-w-3xl space-y-3">
          {ITEMS.map((it, i) => {
            const isOpen = open === i;
            return (
              <li
                key={i}
                className="overflow-hidden rounded-2xl border border-cream-300 bg-cream-100 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 px-5 py-5 text-left transition hover:bg-cream-200 sm:px-7 sm:py-6"
                >
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-xl"
                  >
                    {it.icon}
                  </span>
                  <span className="flex-1 text-base font-semibold text-navy-900 sm:text-lg">
                    {t(it.titleKey)}
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
                  <div className="border-t border-cream-300 px-5 py-5 text-sm leading-relaxed text-ink-700 sm:px-7 sm:py-6 sm:text-base">
                    {t(it.bodyKey)}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border-l-4 border-gold-600 bg-gold-100 p-7 sm:p-8">
          <p className="text-base font-bold text-navy-900 sm:text-lg">
            {t("ctaTitle")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-700 sm:text-base">
            {t("ctaBody")}
          </p>
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="parent-concerns"
            className="mt-5 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-7 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg"
          >
            {t("ctaKakao")} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
