import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Header from "@/components/layout/Header";
import HeaderEn from "@/components/layout/HeaderEn";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import FaqAccordion from "@/components/faq/FaqAccordion";
import { FAQ_CATEGORIES, getTotalCount } from "@/data/faqs";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default async function FaqPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cat?: string }>;
}) {
  const { locale } = await params;
  const { cat } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("FaqPage");
  const total = getTotalCount();
  const HeaderCmp = locale === "en" ? HeaderEn : Header;

  // 인덱스 모드 = cat 파라미터 없음
  if (cat === undefined) {
    return (
      <>
        <HeaderCmp />
        <main className="flex-1 pb-20 sm:pb-0">
          <section className="bg-navy-900 py-14 text-cream-100 sm:py-20">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm text-cream-200 transition hover:text-gold-500"
              >
                <span aria-hidden>←</span> {t("backToHome")}
              </Link>
              <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream-200 sm:text-lg">
                {t("subtitle")}
              </p>
              <p className="mt-3 text-sm font-semibold text-gold-400">
                {t("totalLabel").replace("{n}", String(total))}
              </p>
            </div>
          </section>

          <section className="bg-cream-100">
            <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
              <p className="text-center text-sm font-semibold text-ink-500">
                {t("indexHeading")}
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FAQ_CATEGORIES.map((c, i) => (
                  <li key={i}>
                    <Link
                      href={`/faq?cat=${i}`}
                      className="group flex h-full items-start gap-4 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-gold-600 hover:shadow-lg"
                    >
                      <span
                        aria-hidden
                        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-100 text-2xl"
                      >
                        {c.icon}
                      </span>
                      <div className="flex-1">
                        <p className="font-display text-lg font-bold text-navy-900 group-hover:text-gold-600 sm:text-xl">
                          {c.name}
                        </p>
                        <p className="mt-1 text-sm text-ink-500">
                          {t("itemCountLabel").replace(
                            "{n}",
                            String(c.items.length),
                          )}
                        </p>
                      </div>
                      <span
                        aria-hidden
                        className="text-gold-600 transition group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bg-cream-200">
            <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
              <div className="rounded-3xl bg-navy-900 p-8 text-center text-cream-100 sm:p-10">
                <p className="font-display text-xl font-bold sm:text-2xl">
                  {t("ctaTitle")}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-cream-200 sm:text-base">
                  {t("ctaBody")}
                </p>
                <a
                  href={KAKAO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-kakao-source="faq-index"
                  className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg"
                >
                  {t("ctaKakao")} <span aria-hidden>→</span>
                </a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <StickyKakao />
      </>
    );
  }

  // 상세 모드 = 특정 카테고리만
  const idx = Number.parseInt(cat, 10);
  if (Number.isNaN(idx) || idx < 0 || idx >= FAQ_CATEGORIES.length) {
    notFound();
  }
  const activeCat = FAQ_CATEGORIES[idx];

  return (
    <>
      <HeaderCmp />
      <main className="flex-1 pb-20 sm:pb-0">
        <section className="bg-navy-900 py-14 text-cream-100 sm:py-20">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 text-sm text-cream-200 transition hover:text-gold-500"
            >
              <span aria-hidden>←</span> {t("backToIndex")}
            </Link>
            <div className="mt-4 flex items-center gap-4">
              <span aria-hidden className="text-4xl sm:text-5xl">
                {activeCat.icon}
              </span>
              <div>
                <h1 className="font-display text-2xl font-bold leading-tight sm:text-4xl">
                  {activeCat.name}
                </h1>
                <p className="mt-1 text-sm font-semibold text-gold-400">
                  {t("itemCountLabel").replace(
                    "{n}",
                    String(activeCat.items.length),
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <nav
          aria-label="다른 카테고리"
          className="sticky top-0 z-20 border-b border-cream-300 bg-cream-100/95 backdrop-blur"
        >
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <ul className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FAQ_CATEGORIES.map((c, i) => {
                const isActive = i === idx;
                return (
                  <li key={i}>
                    <Link
                      href={`/faq?cat=${i}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-navy-900 text-cream-100 shadow-md"
                          : "bg-white text-navy-900 shadow-sm hover:bg-cream-200"
                      }`}
                    >
                      <span aria-hidden>{c.icon}</span>
                      {c.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <FaqAccordion items={activeCat.items} />
        </div>

        <section className="bg-cream-200">
          <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="rounded-3xl bg-navy-900 p-8 text-center text-cream-100 sm:p-10">
              <p className="font-display text-xl font-bold sm:text-2xl">
                {t("ctaTitle")}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-cream-200 sm:text-base">
                {t("ctaBody")}
              </p>
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-kakao-source="faq-category"
                className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg"
              >
                {t("ctaKakao")} <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
