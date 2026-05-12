import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// Root layout (Next.js 16 필수 / html + body).
// 동적 lang 속성은 [locale]/layout.tsx에서 처리할 수 없으므로 default "ko".
// 영문 페이지 lang="en" 처리는 Step 1.9 영문 사이트 빌드 시 client-side로 보완.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
