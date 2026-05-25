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

const CONCERNS: { icon: string; key: ConcernKey; q: string }[] = [
  { icon: "\u{1F4DA}", key: "concern1", q: "검정고시" },
  { icon: "\u{1F4DD}", key: "concern2", q: "영어 점수" },
  { icon: "\u{1F4B0}", key: "concern3", q: "예산 학비" },
  { icon: "\u{1FA7A}", key: "concern4", q: "간호" },
  { icon: "\u{1F3E5}", key: "concern5", q: "의대" },
  { icon: "\u{1F3DB}️", key: "concern6", q: "Go8" },
  { icon: "\u{1F6C2}", key: "concern7", q: "워홀 학생비자" },
  { icon: "\u{1F393}", key: "concern8", q: "고등학생 준비" },
  { icon: "\u{1F504}", key: "concern9", q: "중퇴 편입" },
  { icon: "\u{1F6EB}", key: "concern10", q: "영주권 전공" },
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
    <section id="diagnose" className="bg-cream-200">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-ink-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* 검색창 */}
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="flex overflow-hidden rounded-xl border border-cream-300 bg-white shadow-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder={t("searchPlaceholder")}
              className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none sm:text-base"
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
              href={`/faq?q=${encodeURIComponent(c.q)}`}
              className="flex items-start gap-3 rounded-xl border border-cream-300 bg-white px-5 py-4 transition hover:border-gold-600/50 hover:shadow-sm"
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-600/10 text-base"
              >
                {c.icon}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-ink-900 sm:text-[15px]">
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
          <p className="mt-4 text-sm text-ink-500">{t("ctaSubtext")}</p>
        </div>
      </div>
    </section>
  );
}
