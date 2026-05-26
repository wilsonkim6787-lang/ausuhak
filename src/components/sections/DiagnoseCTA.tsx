"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FAQ_CATEGORIES } from "@/data/faqs";
import FaqAccordion from "@/components/faq/FaqAccordion";

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

function searchFaqs(query: string) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hits: { q: string; a: string }[] = [];
  FAQ_CATEGORIES.forEach((cat) => {
    cat.items.forEach((item) => {
      const text = `${item.q} ${item.a}`.toLowerCase();
      if (words.some((w) => text.includes(w))) {
        hits.push({ q: `${cat.icon} ${item.q}`, a: item.a });
      }
    });
  });
  return hits.slice(0, 8);
}

export default function DiagnoseCTA() {
  const t = useTranslations("DiagnoseCTA");
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const activeQuery = selected || query.trim();

  const results = useMemo(() => {
    if (!activeQuery) return null;
    return searchFaqs(activeQuery);
  }, [activeQuery]);

  const onSearch = () => {
    setSelected(null);
    setQuery(query.trim());
  };

  const onCardClick = (q: string) => {
    setQuery("");
    setSelected(q);
  };

  const onBack = () => {
    setSelected(null);
    setQuery("");
  };

  return (
    <section id="diagnose" className="bg-cream-200">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold tracking-wide text-gold-600 sm:text-3xl">
            {t("eyebrow")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("title")}
          </p>
        </div>

        {/* 검색창 */}
        <div className="mx-auto mt-10 max-w-2xl">
          <div className="flex overflow-hidden rounded-xl border border-cream-300 bg-white shadow-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
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

        {/* 결과 모드 */}
        {results !== null ? (
          <div className="mx-auto mt-10 max-w-3xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-ink-500">
                &lsquo;<strong className="text-ink-900">{activeQuery}</strong>&rsquo;
                {results.length > 0
                  ? <> 관련 FAQ <strong className="text-gold-600">{results.length}</strong>건</>
                  : <> 검색 결과 없음</>}
              </p>
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-semibold text-gold-600 transition hover:text-gold-500"
              >
                ← 돌아가기
              </button>
            </div>

            {results.length > 0 && <FaqAccordion items={results} />}

            <div className="mt-8 rounded-2xl bg-white px-6 py-7 text-center sm:px-8">
              <p className="text-sm font-semibold text-ink-900 sm:text-base">
                {results.length === 0
                  ? "원하는 답을 못 찾으셨나요?"
                  : "더 자세한 상담이 필요하신가요?"}
              </p>
              <a
                href={KAKAO}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg"
              >
                카카오 상담하기 <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* 고민 카드 10개 */}
            <div className="mt-12 grid gap-3 sm:grid-cols-2">
              {CONCERNS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => onCardClick(c.q)}
                  className="flex items-start gap-3 rounded-xl border border-cream-300 bg-white px-5 py-4 text-left transition hover:border-gold-600/50 hover:shadow-sm"
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
                </button>
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
            </div>
          </>
        )}
      </div>
    </section>
  );
}
