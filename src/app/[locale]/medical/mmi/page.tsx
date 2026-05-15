// PART I-4: MMI 40 스테이션 시스템.
// mmi_scenarios 테이블 + Wilson 모범답안 작성 후 활성화.
// 현재 = 무료 체험 안내 + 카톡 CTA placeholder.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

const CATEGORIES = [
  { key: "ethics", label: "Ethics", desc: "윤리 딜레마", count: 8 },
  { key: "communication", label: "Communication", desc: "의사 소통", count: 8 },
  { key: "teamwork", label: "Teamwork", desc: "팀워크", count: 8 },
  { key: "motivation", label: "Motivation", desc: "의대 동기", count: 6 },
  { key: "social", label: "Social", desc: "사회 이슈", count: 10 },
];

export default async function MedicalMmiPage({
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
            🎤 MMI 무료 체험
          </h1>
          <p className="mt-2 text-sm text-ink-700">
            Multiple Mini Interview — 호주 의대 인터뷰. 1분 준비 + 4분 답변 (5분/스테이션) × 5~10 스테이션.
          </p>

          <section className="mt-7 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">평가 영역 (40 스테이션)</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {CATEGORIES.map((c) => (
                <li
                  key={c.key}
                  className="rounded-xl border border-cream-200 bg-cream-100/40 px-3 py-2"
                >
                  <p className="font-medium text-navy-900">{c.label}</p>
                  <p className="text-xs text-ink-500">
                    {c.desc} · {c.count} 스테이션
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-5 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-navy-900">
              무료 체험 1 스테이션
            </h2>
            <p className="mt-2 text-sm text-ink-700">
              임의 1 스테이션을 풀어보고 AI 자동 채점 + Wilson 모범 답안 비교. 평가 기준 4축
              (윤리성·공감·논리·대안 제시) 점수 노출.
            </p>
            <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-xs text-ink-700">
              🚧 시나리오 + Wilson 모범답안 작성 단계입니다. 현재는 카톡으로 직접 문의해주세요 — Wilson이 시나리오 1개를 즉시 보내드리고 답변 피드백을 직접 드립니다.
            </div>

            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="medical_mmi_pending"
              className="mt-5 inline-flex rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
            >
              💬 MMI 1 스테이션 받기
            </a>
          </section>

          <section className="mt-5 rounded-2xl border border-navy-800/20 bg-navy-900 p-6 text-cream-100 shadow-sm">
            <h2 className="font-display text-lg font-bold">의대 패키지 ₩300,000</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>· MMI 40 스테이션 전체 + Wilson 모범 답안</li>
              <li>· AI 채점 + 평가 기준 4축 점수</li>
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
