"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const KAKAO = "https://pf.kakao.com/_GadTX";

type ConcernKey =
  | "concern1"
  | "concern2"
  | "concern3"
  | "concern4"
  | "concern5"
  | "concern6"
  | "concern7"
  | "concern8"
  | "concern9"
  | "concern10";

const CONCERNS: { icon: string; key: ConcernKey }[] = [
  { icon: "\u{1F4DA}", key: "concern1" },
  { icon: "\u{1F4DD}", key: "concern2" },
  { icon: "\u{1F4B0}", key: "concern3" },
  { icon: "\u{1FA7A}", key: "concern4" },
  { icon: "\u{1F3E5}", key: "concern5" },
  { icon: "\u{1F3DB}️", key: "concern6" },
  { icon: "\u{1F6C2}", key: "concern7" },
  { icon: "\u{1F393}", key: "concern8" },
  { icon: "\u{1F504}", key: "concern9" },
  { icon: "\u{1F6EB}", key: "concern10" },
];

export default function DiagnoseCTA() {
  const t = useTranslations("DiagnoseCTA");
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/faq?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section id="diagnose" className="bg-navy-900 text-cream-100">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">
            {t("eyebrow")}
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-cream-100 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cream-200 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* 검색창 */}
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="flex overflow-hidden rounded-xl border border-cream-100/20 bg-white shadow-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder={t("searchPlaceholder")}
              className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm text-navy-900 placeholder:text-ink-400 focus:outline-none sm:text-base"
            />
            <button
              type="button"
              onClick={onSearch}
              className="shrink-0 bg-gold-600 px-6 text-sm font-bold text-white transition hover:bg-gold-500 sm:text-base"
            >
              {t("searchButton")}
            </button>
          </div>
        </div>

        {/* 고민 카드 10개 */}
        <div className="mt-12 grid gap-3 sm:grid-cols-2">
          {CONCERNS.map((c) => (
            <a
              key={c.key}
              href={KAKAO}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-xl border border-cream-100/10 bg-navy-800/50 px-5 py-4 transition hover:border-gold-500/40 hover:bg-navy-800/80"
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-base"
              >
                {c.icon}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-cream-100 sm:text-[15px]">
                {t(c.key)}
              </span>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href={KAKAO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
          >
            {t("ctaPrimary")} <span aria-hidden>→</span>
          </a>
          <p className="mt-4 text-sm text-cream-200/70">{t("ctaSubtext")}</p>
        </div>
      </div>
    </section>
  );
}
