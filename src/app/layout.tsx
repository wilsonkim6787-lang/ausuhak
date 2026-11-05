import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/noto-serif-kr/500.css";
import TrackClicks from "@/components/TrackClicks";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { SITE } from "@/lib/site";
import { jsonLdScript, organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "호주유학 | AusUhak(호주유학)", template: "%s | AusUhak(호주유학)" },
  description: SITE.description,
  applicationName: SITE.name,
  formatDetection: { telephone: true, email: true, address: false },
  verification: {
    // Fill in after registering in Google Search Console / Naver Search Advisor.
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1F24",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(organizationJsonLd())} />
        {children}
        <TrackClicks />
        <Analytics />
      </body>
    </html>
  );
}
