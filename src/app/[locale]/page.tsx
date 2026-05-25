import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import HeaderEn from "@/components/layout/HeaderEn";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import NoticePopup from "@/components/layout/NoticePopup";
import Hero from "@/components/sections/Hero";
import WilsonStory from "@/components/sections/WilsonStory";
import OfferShowcase from "@/components/sections/OfferShowcase";
import FaqIndex from "@/components/sections/FaqIndex";
import MedicalCTA from "@/components/sections/MedicalCTA";
import FAQPreview from "@/components/sections/FAQPreview";
import EnglishLanding from "@/components/sections/EnglishLanding";
import { createClient } from "@/lib/supabase/server";

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

  // 공지 팝업 fetch (active=true 일 때만 마운트)
  const supabase = await createClient();
  const { data: noticeRows } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["notice_active", "notice_title", "notice_body", "notice_version"]);
  const noticeMap = new Map(
    (noticeRows ?? []).map((r) => [r.key as string, r.value as string | null]),
  );
  const noticeActive = noticeMap.get("notice_active") === "true";
  const noticeTitle = noticeMap.get("notice_title") ?? "";
  const noticeBody = noticeMap.get("notice_body") ?? "";
  const noticeVersion = parseInt(noticeMap.get("notice_version") ?? "1", 10) || 1;

  return (
    <>
      <Header />
      <main className="flex-1 pb-20 sm:pb-0">
        <Hero />
        <FaqIndex />
        <WilsonStory />
        <OfferShowcase />
        <MedicalCTA />
        <FAQPreview />
      </main>
      <Footer />
      <StickyKakao />
      {noticeActive && noticeBody && (
        <NoticePopup title={noticeTitle} body={noticeBody} version={noticeVersion} />
      )}
    </>
  );
}
