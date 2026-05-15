// PART I-3: ISAT 200문제 시스템.
// Wilson이 200문제 작성·검수 후 isat_questions 테이블에 import 예정.
// 현재 = 무료 체험 안내 + 카톡 CTA placeholder.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default async function MedicalIsatPage({
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
            <h2 className="font-display text-lg font-bold text-navy-900">시험 구성</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
              <li>· Critical Reasoning (CR) 100문제 — 논리·비판적 사고</li>
              <li>· Quantitative Reasoning (QR) 100문제 — 수학·통계·그래프 해석</li>
              <li>· 4지선다 / 컴퓨터 시험</li>
            </ul>
          </section>

          <section className="mt-5 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">무료 체험 10문제</h2>
            <p className="mt-2 text-sm text-ink-700">
              CR 5문제 + QR 5문제. 정답·해설·단어 풀이 즉시 노출. 약점 영역 자동 진단 후 학습 방향 제안.
            </p>
            <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-xs text-ink-700">
              🚧 시험 문제 모듈은 Wilson 검수 단계입니다. 현재는 카톡으로 직접 문의해주세요 — Wilson이 케이스별 약점 진단 + 학습 플랜을 즉시 안내합니다.
            </div>

            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="medical_isat_pending"
              className="mt-5 inline-flex rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
            >
              💬 ISAT 학습 1:1 상담
            </a>
          </section>

          <section className="mt-5 rounded-2xl border border-navy-800/20 bg-navy-900 p-6 text-cream-100 shadow-sm">
            <h2 className="font-display text-lg font-bold">의대 패키지 ₩300,000</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>· ISAT 200문제 전체 + 자세한 해설</li>
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
