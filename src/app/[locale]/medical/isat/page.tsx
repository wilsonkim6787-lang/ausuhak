// ISAT 200문제 시스템 — 무료 체험 id 1~5 (고정, Wilson 2026-05-16).
// 풀세트 200 = 결제 잠금 / 카카오 게이트 모달.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import IsatTrial from "@/components/medical/IsatTrial";
import { getIsatFreeTrial, ISAT_CATEGORY_COUNTS } from "@/data/medical";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default async function MedicalIsatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trial = getIsatFreeTrial();
  const total =
    ISAT_CATEGORY_COUNTS.critical_reasoning +
    ISAT_CATEGORY_COUNTS.quantitative_reasoning;

  return (
    <>
      <Header />
      <main className="flex-1 bg-cream-100">
        <section className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/medical"
            className="text-xs font-semibold text-navy-700 hover:text-gold-600"
          >
            ← 의대 준비 센터
          </Link>

          <h1 className="mt-3 font-display text-3xl font-bold text-navy-900 sm:text-4xl">
            🎯 ISAT 무료 체험
          </h1>
          <p className="mt-2 text-sm text-ink-700">
            International Student Admissions Test — UNSW · Adelaide · WSU/Charles Sturt 등 호주 의대 입학 시험.
          </p>

          <section className="mt-7 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">
              시험 구성 (풀세트 {total}문제)
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
              <li>
                · Critical Reasoning (CR) {ISAT_CATEGORY_COUNTS.critical_reasoning}문제 — 논리·비판적 사고
              </li>
              <li>
                · Quantitative Reasoning (QR) {ISAT_CATEGORY_COUNTS.quantitative_reasoning}문제 — 수학·통계·그래프 해석
              </li>
              <li>· 4지선다 / 컴퓨터 시험</li>
            </ul>
          </section>

          <section className="mt-6">
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-navy-900">
                무료 체험 {trial.length}문제 (Critical Reasoning)
              </h2>
              <p className="mt-1 text-xs text-ink-700">
                선택 → 정답·해설 즉시 노출. 새로고침 시 동일 문제. 풀세트는 결제 후 즉시 열림.
              </p>
            </div>
            <IsatTrial questions={trial} />
          </section>

          <section className="mt-7 rounded-2xl border border-navy-800/20 bg-navy-900 p-6 text-cream-100 shadow-sm">
            <h2 className="font-display text-lg font-bold">의대 패키지 ₩300,000</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>· ISAT {total}문제 풀세트 + 자세한 해설</li>
              <li>· 학습 진행률 자동 추적</li>
              <li>· Wilson 직접 피드백 (오답 분석)</li>
              <li>· MMI 40 스테이션 포함</li>
            </ul>
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="medical_isat_pkg"
              className="mt-4 inline-flex rounded-full bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-500"
            >
              💬 의대 패키지 결제 문의
            </a>
          </section>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
