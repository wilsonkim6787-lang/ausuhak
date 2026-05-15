import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import HeaderEn from "@/components/layout/HeaderEn";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import Hero from "@/components/sections/Hero";
import WilsonStory from "@/components/sections/WilsonStory";
import OfferShowcase from "@/components/sections/OfferShowcase";
import DiagnoseCTA from "@/components/sections/DiagnoseCTA";
import MedicalCTA from "@/components/sections/MedicalCTA";
import FAQPreview from "@/components/sections/FAQPreview";
import EnglishLanding from "@/components/sections/EnglishLanding";

// PART A A-4: 한국어 = ausuhak.com / 영문 = ausuhak.com/en
// 한글 = Hero + WilsonStory (Step 1.4 / 추후 카드 결과 등 확장)
// 영문 = EnglishLanding (Step 1.7 / 학교 파트너용 1페이지 Long Scroll)
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale === "en") {
    return (
      <>
        <HeaderEn />
        <EnglishLanding />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <WilsonStory />
        <OfferShowcase />
        <DiagnoseCTA />
        <MedicalCTA />
        <FAQPreview />
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
