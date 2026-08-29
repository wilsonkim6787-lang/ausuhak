// 상담 신청 — 공개 접수 폼. 접수는 /admin/consults 에 쌓인다.

import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import ConsultForm from "./ConsultForm";

export const metadata: Metadata = {
  title: "무엇이든 물어보세요 | ausuhak.com",
  description:
    "호주 유학, 궁금한 것 무엇이든 물어보세요 — 이름과 연락처만 남기면 영업일 24시간 안에 답변드립니다. 어학연수부터 대학·의대까지.",
};

export default async function ConsultPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { locale } = await params;
  const { from } = await searchParams;
  setRequestLocale(locale);
  const source = from === "cost" ? "cost" : "web";

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
              무엇이든 물어보세요
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream-200 sm:text-lg">
              학교·비용·비자·영어… 짧은 질문도 환영합니다. 이름과 연락처만 남기면
              영업일 기준 24시간 안에 답변드립니다. 물론 무료입니다.
            </p>
          </div>
        </section>

        <section className="bg-cream-100">
          <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
            <ConsultForm source={source} />
          </div>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
