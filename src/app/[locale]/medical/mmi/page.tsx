// MMI 40 스테이션 — 무료 체험 station id 1 (고정, Wilson 2026-05-16).
// 1분 준비 + 4분 답변 타이머 + Wilson 모범답안 reveal. 풀세트 40 = 카카오 게이트.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import MmiTrial from "@/components/medical/MmiTrial";
import {
  getMmiFreeStation,
  MMI_CATEGORY_COUNTS,
  MMI_CATEGORY_META,
  MMI_STATIONS,
} from "@/data/medical";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default async function MedicalMmiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trial = getMmiFreeStation();
  const total = MMI_STATIONS.length;

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
            🎤 MMI 무료 체험
          </h1>
          <p className="mt-2 text-sm text-ink-700">
            Multiple Mini Interview — 호주 의대 인터뷰. 1분 준비 + 4분 답변 (5분/스테이션) × 5~10 스테이션.
          </p>

          <section className="mt-7 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">
              평가 영역 (풀세트 {total} 스테이션)
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {MMI_CATEGORY_META.map((c) => (
                <li
                  key={c.key}
                  className="rounded-xl border border-cream-300 bg-cream-100/40 px-3 py-2"
                >
                  <p className="font-medium text-navy-900">{c.label}</p>
                  <p className="text-xs text-ink-500">
                    {c.desc} · {MMI_CATEGORY_COUNTS[c.key]} 스테이션
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-navy-900">
                무료 체험 1 스테이션 (Station #{trial.id})
              </h2>
              <p className="mt-1 text-xs text-ink-700">
                4분 답변 후 Wilson 모범답안 비교. 새로고침 시 동일 스테이션. 풀세트는 결제 후 즉시 열림.
              </p>
            </div>
            <MmiTrial station={trial} />
          </section>

          <section className="mt-7 rounded-2xl border border-navy-800/20 bg-navy-900 p-6 text-cream-100 shadow-sm">
            <h2 className="font-display text-lg font-bold">의대 패키지 ₩300,000</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>· MMI {total} 스테이션 풀세트 + Wilson 모범 답안</li>
              <li>· 평가 기준 4축 분석 (윤리·공감·논리·대안)</li>
              <li>· Wilson 직접 피드백 (영상 답변 가능)</li>
              <li>· ISAT 200문제 포함</li>
            </ul>
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="medical_mmi_pkg"
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
