// 유학 비용 계산기 — 공개 리드 장치. 과정·도시·기간 → 예상 비용 + 상담 CTA.

import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import CostCalculator from "./CostCalculator";

export const metadata: Metadata = {
  title: "호주 유학 비용 계산기 | ausuhak.com",
  description:
    "어학연수·TAFE·대학·대학원 호주 유학 비용을 과정·도시·기간별로 계산해보세요. 학비, 생활비, 건강보험(OSHC)까지 한 번에.",
};

export default async function CostPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="flex-1 pb-20 sm:pb-0">
        <section className="bg-navy-900 py-14 text-cream-100 sm:py-20">
          <div className="container mx-auto max-w-5xl px-4 sm:px-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-cream-200 transition hover:text-gold-500"
            >
              <span aria-hidden>←</span> 메인으로
            </Link>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">
              호주 유학 비용 계산기
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream-200 sm:text-lg">
              과정·도시·기간만 고르면 학비부터 생활비, 건강보험까지 예상 비용이 바로 나옵니다.
            </p>
          </div>
        </section>

        <section className="bg-cream-100">
          <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            <CostCalculator />
          </div>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
