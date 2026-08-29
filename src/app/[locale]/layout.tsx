import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    metadataBase: new URL("https://ausuhak.com"),
    title: t("title"),
    description: t("description"),
    keywords:
      locale === "ko"
        ? [
            "호주유학",
            "호주 영주권",
            "호주 간호사",
            "호주 의대",
            "검정고시 호주유학",
            "호주 워홀 후 유학",
            "호주 유학 비용",
            "호주 학생비자 500",
            "ausuhak",
          ]
        : [
            "Korean student recruitment Australia",
            "Korean market education agency",
            "Australia education partnership Korea",
            "QEAC certified Korean consultant",
            "Wilson Kim",
            "ausuhak",
          ],
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: locale === "ko" ? "https://ausuhak.com" : "https://ausuhak.com/en",
      siteName: "ausuhak.com",
      locale: locale === "ko" ? "ko_KR" : "en_AU",
      type: "website",
    },
    robots: { index: true, follow: true },
    // 서치콘솔·서치어드바이저 소유 확인 메타태그 — Vercel 환경변수에 코드만 넣으면 됨
    // (GOOGLE_SITE_VERIFICATION / NAVER_SITE_VERIFICATION, educennow 와 동일 관례)
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      other: process.env.NAVER_SITE_VERIFICATION
        ? { "naver-site-verification": process.env.NAVER_SITE_VERIFICATION }
        : {},
    },
  };
}

// [locale] nested layout: NextIntlClientProvider 래핑 + locale 검증
// html/body는 root layout(app/layout.tsx)에서 박음 (Next.js 16 typed routes 호환)
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale); // SSG 활성화

  // Organization JSON-LD — 검색엔진에 회사 실체(전화·주소·공식 채널) 전달
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "ausuhak.com (호주유학)",
    url: "https://www.ausuhak.com",
    telephone: "+82-10-9848-7789",
    address: {
      "@type": "PostalAddress",
      streetAddress: "테헤란로6길 26, 3층 318호",
      addressLocality: "강남구",
      addressRegion: "서울특별시",
      addressCountry: "KR",
    },
    sameAs: [
      "https://blog.naver.com/momstudy100",
      "https://pf.kakao.com/_GadTX",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <NextIntlClientProvider>{children}</NextIntlClientProvider>
    </>
  );
}
