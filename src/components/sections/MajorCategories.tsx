"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

const CATEGORIES = [
  { icon: "\u{1FA7A}", titleKey: "cat1Title", tagKey: "cat1Tag", bodyKey: "cat1Body" },
  { icon: "\u{1F3E5}", titleKey: "cat2Title", tagKey: "cat2Tag", bodyKey: "cat2Body" },
  { icon: "\u{1F4BB}", titleKey: "cat3Title", tagKey: "cat3Tag", bodyKey: "cat3Body" },
  { icon: "\u{1F373}", titleKey: "cat4Title", tagKey: "cat4Tag", bodyKey: "cat4Body" },
  { icon: "\u{1F3EB}", titleKey: "cat5Title", tagKey: "cat5Tag", bodyKey: "cat5Body" },
  { icon: "\u{1F4DA}", titleKey: "cat6Title", tagKey: "cat6Tag", bodyKey: "cat6Body" },
  { icon: "\u{1F6EB}", titleKey: "cat7Title", tagKey: "cat7Tag", bodyKey: "cat7Body" },
] as const;

export default function MajorCategories() {
  const t = useTranslations("MajorCategories");
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-cream-100">
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

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border transition ${
                  isOpen
                    ? "border-gold-600 bg-white shadow-lg"
                    : "border-cream-300 bg-white shadow-sm hover:-translate-y-1 hover:border-gold-600 hover:shadow-md"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-4 p-6 text-left sm:p-7"
                >
                  <span
                    aria-hidden
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-2xl"
                  >
                    {c.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-lg font-bold text-navy-900 sm:text-xl">
                      {t(c.titleKey)}
                    </p>
                    <p className="mt-1 inline-flex items-center rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-semibold text-navy-800">
                      {t(c.tagKey)}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className={`shrink-0 font-display text-xl text-gold-600 transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-cream-300 px-6 py-5 text-sm leading-relaxed text-ink-700 sm:px-7 sm:py-6">
                    {t(c.bodyKey)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl bg-navy-900 p-8 text-center text-cream-100 sm:p-10">
          <p className="font-display text-xl font-bold sm:text-2xl">
            {t("ctaTitle")}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/diagnose"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-7 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-gold-500"
            >
              {t("ctaPrimary")} <span aria-hidden>→</span>
            </Link>
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="majors"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-cream-100/40 px-6 py-3.5 text-base font-semibold text-cream-100 transition hover:bg-cream-100 hover:text-navy-900"
            >
              {t("ctaSecondary")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
