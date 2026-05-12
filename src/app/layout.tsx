import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ausuhak.com"),
  title: "ausuhak.com (호주유학) | Wilson 19년 + 호주 학교 교직원 경력",
  description:
    "호주 유학 19년 Wilson Kim (QEAC E240) + 호주 학교 교직원 경력. 950명+ 누적 학생. 검정고시·워홀러·대졸 모두 호주 명문대 진학 가능.",
  keywords: [
    "호주유학",
    "호주 영주권",
    "호주 간호사",
    "호주 의대",
    "검정고시 호주유학",
    "호주 워홀 후 유학",
    "호주 유학 비용",
    "호주 학생비자 500",
    "ausuhak",
  ],
  openGraph: {
    title: "ausuhak.com (호주유학) — Wilson 19년 + 호주 학교 교직원 경력",
    description:
      "검정고시·워홀러·대졸 모두 호주 명문대 진학. Wilson Kim (QEAC E240) · 950명+ 누적 학생.",
    url: "https://ausuhak.com",
    siteName: "ausuhak.com",
    locale: "ko_KR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
