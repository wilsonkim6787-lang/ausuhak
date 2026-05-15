import Link from "next/link";
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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("FaqPage");
  const total = getTotalCount();

  return (
    <>
      {locale === "en" ? <HeaderEn /> : <Header />}
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

        <nav
          aria-label="FAQ 카테고리"
          className="sticky top-0 z-20 border-b border-cream-300 bg-cream-100/95 backdrop-blur"
        >
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <ul className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FAQ_CATEGORIES.map((c, i) => (
                <li key={i}>
                  <a
                    href={`#cat-${i}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-navy-900 shadow-sm transition hover:bg-cream-200"
                  >
                    <span aria-hidden>{c.icon}</span>
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          {FAQ_CATEGORIES.map((cat, i) => (
            <section
              key={i}
              id={`cat-${i}`}
              className="scroll-mt-20 py-12 sm:py-16"
            >
              <div className="mb-6 flex items-center gap-3">
                <span aria-hidden className="text-3xl">
                  {cat.icon}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-ink-500">
                    {cat.items.length}개 질문
                  </p>
                </div>
              </div>
              <FaqAccordion items={cat.items} />
            </section>
          ))}
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
                data-kakao-source="faq-page"
                className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-3.5 text-base font-semibold text-navy-900 shadow-md transition hover:bg-gold-500 hover:shadow-lg"
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
