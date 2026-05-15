import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { requireStudent } from "@/lib/auth/requireStudent";
import StickyKakao from "@/components/layout/StickyKakao";
import MypageNav from "@/components/mypage/MypageNav";

export default async function MypageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { user } = await requireStudent();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/92 backdrop-blur-md">
        <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2.5">
            <span className="font-display text-lg font-bold tracking-tight text-navy-900 sm:text-[20px]">
              ausuhak
              <span className="italic text-gold-600">.com</span>
            </span>
            <span className="hidden text-[11px] font-medium text-ink-500 sm:inline">
              마이페이지
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-navy-700 transition hover:text-gold-600"
          >
            ← 메인으로
          </Link>
        </div>
      </header>

      <main className="container mx-auto flex max-w-5xl flex-col sm:flex-row">
        <div className="w-full shrink-0 sm:w-56">
          <MypageNav userName={user.name} />
        </div>
        <div className="flex-1 bg-cream-100 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
      <StickyKakao />
    </>
  );
}
