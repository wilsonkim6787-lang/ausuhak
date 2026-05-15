// PART I-1: 호주 의대 준비 센터 메인.
// /medical = 한국어 사이트 전용 / Wilson 직접 응대 (직원 위임 X).

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import { MEDICAL_ROUTES, MEDICAL_SCHOOLS, type MedicalRouteKey } from "@/lib/medical/routes";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default async function MedicalPage({
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
        {/* Hero */}
        <section className="bg-navy-900 py-14 text-cream-100 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
              MEDICAL · 의대 준비 센터
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">
              호주 의대 준비, Wilson이 직접 코칭합니다.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-cream-200 sm:text-base">
              5가지 진학 루트 · ISAT 200문제 · MMI 40 스테이션 · 21개 의대 학교 정보. <br />
              의대 학생 응대는 Wilson 직접 (직원 위임 X). 평일 10:00~18:00 KST.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/medical/isat"
                className="rounded-full bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gold-500"
              >
                🎯 ISAT 무료 체험 (10문제)
              </Link>
              <Link
                href="/medical/mmi"
                className="rounded-full border border-gold-400/40 bg-navy-800/40 px-6 py-3 text-sm font-semibold text-gold-400 transition hover:bg-navy-800"
              >
                🎤 MMI 무료 체험 (1 스테이션)
              </Link>
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-kakao-source="medical_hero"
                className="rounded-full border border-gold-400/40 bg-navy-800/40 px-6 py-3 text-sm font-semibold text-cream-100 transition hover:bg-navy-800"
              >
                💬 Wilson에게 1:1 상담
              </a>
            </div>
          </div>
        </section>

        {/* 5진학루트 */}
        <section className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            5가지 진학 루트
          </h2>
          <p className="mt-2 text-sm text-ink-700">
            본인 케이스가 어느 루트인지 헷갈리면 카톡 상담 → Wilson 19년 노하우로 함께 정리.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
            {MEDICAL_ROUTES.map((r) => <RouteCard key={r.key} route={r} />)}
          </div>
        </section>

        {/* ISAT 무료 체험 */}
        <section className="border-t border-cream-300 bg-white py-12 sm:py-16">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FreePromo
                emoji="🎯"
                title="ISAT 무료 체험 (10문제)"
                desc="Critical Reasoning 5 + Quantitative 5. 정답·해설·단어 풀이 즉시 노출. 약점 영역 자동 진단."
                cta="무료로 시작"
                href="/medical/isat"
              />
              <FreePromo
                emoji="🎤"
                title="MMI 무료 체험 (1 스테이션)"
                desc="Ethics / Communication / Teamwork / Motivation / Social. 4분 답변 + AI 채점."
                cta="무료로 시작"
                href="/medical/mmi"
              />
            </div>
          </div>
        </section>

        {/* 21개 학교 */}
        <section className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            호주 의대 21개 학교 정보
          </h2>
          <p className="mt-2 text-sm text-ink-700">
            Direct Entry · Graduate Entry MD · Joint Program 구분. 자세한 요건은 1:1 카톡 상담.
          </p>

          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {MEDICAL_SCHOOLS.map((s, i) => (
              <li
                key={i}
                className="rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm shadow-sm"
              >
                <p className="font-display font-semibold text-navy-900">{s.name}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {s.city} · {s.state}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.pathway.map((p) => (
                    <PathwayChip key={p} pathway={p} />
                  ))}
                  {s.note && (
                    <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] text-ink-700">
                      {s.note}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 결제 + 카톡 CTA */}
        <section className="bg-navy-900 py-14 text-cream-100 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              의대 패키지 ₩300,000
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200 sm:text-base">
              ISAT 200문제 전체 · MMI 40 스테이션 전체 · Wilson 직접 피드백 · 학습 진행률 자동 추적.
              <br />
              결제 안내·정확한 케이스 진단은 카톡 1:1 상담에서.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-kakao-source="medical_package_cta"
                className="rounded-full bg-gold-600 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gold-500"
              >
                💬 카톡으로 의대 패키지 문의
              </a>
            </div>
            <p className="mt-5 text-[11px] text-cream-200/70">
              ⏰ Wilson 응대 시간: 평일 10:00~18:00 KST (의대 = Wilson 직접 / 직원 위임 X)
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}

function RouteCard({ route }: { route: typeof MEDICAL_ROUTES[number] }) {
  return (
    <article className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-xs font-bold text-gold-600">
          ROUTE {route.num}
        </span>
        <span className="text-xs text-ink-500">
          {"⭐".repeat(route.difficulty)}
        </span>
      </div>
      <h3 className="mt-2 flex items-center gap-2 font-display text-lg font-bold text-navy-900">
        <span>{route.emoji}</span>
        <span>{route.title}</span>
      </h3>
      <p className="mt-1 text-xs text-ink-500">{route.subtitle}</p>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <dt className="text-ink-500">대상</dt>
        <dd className="text-navy-900">{route.target}</dd>
        <dt className="text-ink-500">기간</dt>
        <dd className="text-navy-900">{route.duration}</dd>
      </dl>

      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600">
          요건
        </p>
        <ul className="mt-1 space-y-0.5 text-xs text-ink-700">
          {route.requirements.map((r, i) => (
            <li key={i}>· {r}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600">
          진행
        </p>
        <ol className="mt-1 space-y-0.5 text-xs text-ink-700">
          {route.flow.map((step, i) => (
            <li key={i}>{i + 1}. {step}</li>
          ))}
        </ol>
      </div>

      <p className="mt-3 rounded-lg bg-cream-100 px-3 py-2 text-[11px] text-ink-700">
        🏫 {route.schoolsHint}
      </p>
    </article>
  );
}

function FreePromo({
  emoji,
  title,
  desc,
  cta,
  href,
}: {
  emoji: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-cream-300 bg-cream-100 p-6 shadow-sm">
      <p className="text-3xl">{emoji}</p>
      <h3 className="mt-2 font-display text-lg font-bold text-navy-900">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-700">{desc}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full bg-navy-900 px-5 py-2 text-xs font-semibold text-gold-400 transition hover:bg-navy-800"
      >
        {cta} →
      </Link>
    </div>
  );
}

function PathwayChip({ pathway }: { pathway: MedicalRouteKey }) {
  const label =
    pathway === "direct" ? "Direct" : pathway === "undergrad" ? "Graduate Entry" : pathway;
  const bg =
    pathway === "direct"
      ? "bg-gold-100 text-gold-600"
      : pathway === "undergrad"
      ? "bg-success/15 text-success"
      : "bg-cream-300 text-ink-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${bg}`}>
      {label}
    </span>
  );
}
