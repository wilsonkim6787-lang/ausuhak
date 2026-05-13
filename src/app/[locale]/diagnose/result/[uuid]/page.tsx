import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import {
  BlocksBanner, Card1Schools, Card2Region, Card3Pathway,
  Card4Major, Card5Visa, Card6Wilson, Card7Next,
} from "@/components/diagnose/Cards";
import { matchDiagnose } from "@/lib/matching";
import { decodeInput } from "@/lib/matching/token";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ locale: string; uuid: string }>;
}) {
  const { locale, uuid } = await params;
  setRequestLocale(locale);

  const input = decodeInput(decodeURIComponent(uuid));
  if (!input) notFound();

  const result = matchDiagnose(input);

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream-100">
        <section className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-600/30 bg-gold-600/10 px-3 py-1 text-xs font-bold tracking-wider text-gold-600">
              <span className="size-1.5 rounded-full bg-success" />
              진단 완료
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">
              {input.education} · {input.major} · {input.preferred_region}
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              만 {input.age}세 · 영어 {input.english_level} · 예산 {input.budget_range}
            </p>
            {result.is_medical && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-2.5 py-1 text-xs font-bold text-gold-400">
                의대 트랙 ({result.medical_pathway})
              </p>
            )}
          </div>

          {/* 차단/주의 배너 */}
          {(result.blocks_hard.length + result.blocks_soft.length > 0) && (
            <div className="mb-8">
              <BlocksBanner hard={result.blocks_hard} soft={result.blocks_soft} />
            </div>
          )}

          {/* 카드 7장 */}
          <div className="space-y-5">
            <Card1Schools data={result.cards.card1_schools} />
            <Card2Region data={result.cards.card2_region} />
            <Card3Pathway data={result.cards.card3_pathway} />
            <Card4Major data={result.cards.card4_major} />
            <Card5Visa data={result.cards.card5_visa_pr} />
            <Card6Wilson data={result.cards.card6_wilson} />
            <Card7Next data={result.cards.card7_next} kakaoUrl={KAKAO_URL} />
          </div>

          <p className="mt-8 text-center text-xs text-ink-500">
            * 이 결과는 Wilson 검수 정본 데이터 (109교 · 36차단룰 · 24Alert · 83시나리오 FAQ) 기반의 1차 매칭입니다.
            <br />* 학비·정원·정책은 실시간 변동될 수 있어 1:1 카톡 상담으로 최종 확정합니다.
          </p>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
