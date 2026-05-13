import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import DiagnoseForm from "@/components/diagnose/DiagnoseForm";

export default async function DiagnosePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream-100">
        <section className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-600/30 bg-gold-600/10 px-3 py-1 text-xs font-bold tracking-wider text-gold-600">
              <span className="size-1.5 animate-pulse rounded-full bg-gold-600" />
              30초 진단
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">
              호주 유학 경로 진단
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-700 sm:text-base">
              6가지 질문에 답하면, Wilson 19년 + 호주 학교 교직원 경력 기반으로
              <br className="hidden sm:block" />
              가장 맞는 학교·경로·비자를 카드 7장으로 정리해드립니다.
            </p>
          </div>

          <DiagnoseForm />

          <p className="mt-6 text-center text-xs text-ink-500">
            * 진단 결과는 Wilson 검수 정본 (109교 · 36차단룰 · 24Alert · 83시나리오 FAQ) 기반.
            <br />* 정확한 케이스 판단은 1:1 카톡 상담으로 확정합니다.
          </p>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
