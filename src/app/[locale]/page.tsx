import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import Hero from "@/components/sections/Hero";
import WilsonStory from "@/components/sections/WilsonStory";

// PART A A-4: 한국어 = ausuhak.com / 영문 = ausuhak.com/en
// 본격 콘텐츠는 Step 1.5 (진단 시스템) + Step 1.6 (관리자) + Step 1.7 (영문 사이트)에서 빌드

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale); // SSG 활성화 (정적 생성 최적화)
  return <HomeView />;
}

function HomeView() {
  const t = useTranslations();

  return (
    <>
      <Header />

      <main className="flex-1">
        <Hero />
        <WilsonStory />

        {/* Phase 1 진행 상황 (Step 1.5 이후 제거 예정) */}
        <section className="container mx-auto max-w-5xl border-t border-cream-300 px-4 py-16 sm:px-6">
          <h2 className="mb-2 font-display text-2xl font-semibold text-navy-900">
            {t("Progress.title")}
          </h2>
          <p className="mb-6 text-ink-700">{t("Progress.description")}</p>
          <ul className="space-y-2 text-sm text-ink-700">
            <li>{t("Progress.step1_1")}</li>
            <li>{t("Progress.step1_2")}</li>
            <li>{t("Progress.step1_3")}</li>
            <li>{t("Progress.step1_4")}</li>
            <li>{t("Progress.step1_5")}</li>
            <li>{t("Progress.step1_6")}</li>
            <li>{t("Progress.step1_7")}</li>
            <li>{t("Progress.step1_8")}</li>
          </ul>
        </section>
      </main>

      <Footer />
      <StickyKakao />
    </>
  );
}
