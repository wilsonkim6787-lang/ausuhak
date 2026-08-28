// PART I-1: 호주 의대 준비 센터 메인.
// /medical = 한국어 사이트 전용 / Wilson 직접 응대 (직원 위임 X).

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import { MEDICAL_ROUTES, MEDICAL_SCHOOLS, type MedicalRouteKey } from "@/lib/medical/routes";
import { KAKAO_URL } from "@/lib/constants";


const HERO_STATS = [
  { value: "21", label: "호주 의대" },
  { value: "5", label: "진학 루트" },
  { value: "200", label: "ISAT 문제" },
  { value: "40", label: "MMI 스테이션" },
];

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
      <main className="flex-1 bg-cream-100 pb-20 sm:pb-0">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-navy-900 text-cream-100">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 15% 0%, rgba(201,150,42,0.18) 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 100% 100%, rgba(44,79,138,0.45) 0%, transparent 55%)",
            }}
          />
          <div className="container relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
              Medical · 의대 준비 센터
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-5xl">
              호주 의대 준비,
              <br />
              <span className="text-gold-400">Wilson이 직접 코칭</span>합니다.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream-200 sm:text-base">
              막연한 정보 검색은 그만. 본인 학력에서 갈 수 있는 진학 루트부터
              ISAT·MMI 실전 준비까지 한 곳에서. 의대 학생은 Wilson이 직접 응대합니다
              (직원 위임 X).
            </p>

            {/* 스탯 칩 */}
            <dl className="mt-8 grid max-w-xl grid-cols-4 gap-3">
              {HERO_STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-2 py-3 text-center backdrop-blur-sm"
                >
                  <dt className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-0.5 text-[11px] text-cream-200/80 sm:text-xs">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/medical/isat"
                className="inline-flex min-h-[48px] items-center rounded-full bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gold-500"
              >
                🎯 ISAT 무료 체험 (10문제)
              </Link>
              <Link
                href="/medical/mmi"
                className="inline-flex min-h-[48px] items-center rounded-full border border-gold-400/40 bg-navy-800/40 px-6 py-3 text-sm font-semibold text-gold-400 transition hover:bg-navy-800"
              >
                🎤 MMI 무료 체험 (1 스테이션)
              </Link>
              <a
                href={KAKAO_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-kakao-source="medical_hero"
                className="inline-flex min-h-[48px] items-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-cream-100 transition hover:bg-white/10"
              >
                💬 Wilson에게 1:1 상담
              </a>
            </div>
          </div>
        </section>

        {/* ── 5가지 진학 루트 ── */}
        <section id="routes" className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="진학 루트"
            title="내 학력에서 갈 수 있는 5가지 길"
            desc="어느 루트인지 헷갈리면 카톡 상담 → Wilson 19년 노하우로 함께 정리합니다."
          />
          <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2">
            {MEDICAL_ROUTES.map((r) => (
              <RouteCard key={r.key} route={r} />
            ))}
          </div>
        </section>

        {/* ── ISAT / MMI 무료 체험 ── */}
        <section id="trial" className="border-y border-cream-300 bg-white py-16 sm:py-20">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6">
            <SectionHead
              eyebrow="무료 체험"
              title="결제 전에 직접 풀어보세요"
              desc="회원가입·결제 없이 바로 체험할 수 있습니다."
              center
            />
            <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
              <FreePromo
                emoji="🎯"
                title="ISAT 무료 체험"
                badge="10문제 무료"
                desc="Critical Reasoning 5 + Quantitative 5. 정답·해설·단어 풀이 즉시 노출, 약점 영역 자동 진단."
                cta="무료로 시작"
                href="/medical/isat"
              />
              <FreePromo
                emoji="🎤"
                title="MMI 무료 체험"
                badge="1 스테이션 무료"
                desc="Ethics · Communication · Teamwork · Motivation · Social. 4분 답변 + AI 채점."
                cta="무료로 시작"
                href="/medical/mmi"
              />
            </div>
          </div>
        </section>

        {/* ── 21개 의대 학교 ── */}
        <section id="schools" className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHead
            eyebrow="학교 정보"
            title="호주 의대 21개 학교"
            desc="Direct Entry · Graduate Entry MD · Joint Program 구분. 자세한 요건은 1:1 카톡 상담."
          />

          {/* 경로 범례 */}
          <div className="mt-6 flex flex-wrap gap-2">
            <PathwayChip pathway="direct" />
            <PathwayChip pathway="undergrad" />
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {MEDICAL_SCHOOLS.map((s, i) => (
              <li
                key={i}
                className="rounded-xl border border-cream-300 bg-white px-4 py-3.5 shadow-sm transition hover:border-gold-600/40 hover:shadow-md"
              >
                <p className="font-display text-[15px] font-semibold text-navy-900">
                  {s.name}
                </p>
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

        {/* ── 패키지 + 카톡 CTA (cream 위 navy 카드 — 풋터와 분리) ── */}
        <section className="bg-cream-100 py-16 sm:py-20">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-14 text-center text-cream-100 shadow-lg sm:px-10 sm:py-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(201,150,42,0.18) 0%, transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <span className="inline-flex items-center rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-400">
                  패키지
                </span>
                <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
                  의대 패키지 <span className="text-gold-400">₩300,000</span>
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream-200 sm:text-base">
                  ISAT 200문제 전체 · MMI 40 스테이션 전체 · Wilson 직접 피드백 · 학습
                  진행률 자동 추적. 결제 안내와 정확한 케이스 진단은 카톡 1:1 상담에서.
                </p>
                <div className="mt-7 flex justify-center">
                  <a
                    href={KAKAO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-kakao-source="medical_package_cta"
                    className="inline-flex min-h-[56px] items-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-gold-500 hover:shadow-xl"
                  >
                    💬 카톡으로 의대 패키지 문의 <span aria-hidden>→</span>
                  </a>
                </div>
                <p className="mt-5 text-[11px] text-cream-200/70">
                  ⏰ Wilson 응대 시간: 평일 10:00~18:00 KST · 의대 = Wilson 직접 (직원 위임 X)
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}

function SectionHead({
  eyebrow,
  title,
  desc,
  center = false,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
        {title}
      </h2>
      <p
        className={`mt-2 text-sm leading-relaxed text-ink-700 ${
          center ? "mx-auto max-w-xl" : "max-w-2xl"
        }`}
      >
        {desc}
      </p>
    </div>
  );
}

function RouteCard({ route }: { route: (typeof MEDICAL_ROUTES)[number] }) {
  return (
    <article className="flex flex-col rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-600/40 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold tracking-wider text-gold-600">
          ROUTE {route.num}
        </span>
        <span
          className="text-xs text-gold-500"
          title={`난이도 ${route.difficulty}/5`}
          aria-label={`난이도 ${route.difficulty}점 만점에 5`}
        >
          {"★".repeat(route.difficulty)}
          <span className="text-cream-300">{"★".repeat(5 - route.difficulty)}</span>
        </span>
      </div>
      <h3 className="mt-3 flex items-center gap-2 font-display text-lg font-bold text-navy-900">
        <span aria-hidden>{route.emoji}</span>
        <span>{route.title}</span>
      </h3>
      <p className="mt-1 text-xs text-ink-500">{route.subtitle}</p>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
        <dt className="font-semibold text-ink-500">대상</dt>
        <dd className="text-navy-900">{route.target}</dd>
        <dt className="font-semibold text-ink-500">기간</dt>
        <dd className="text-navy-900">{route.duration}</dd>
      </dl>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600">
            요건
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-ink-700">
            {route.requirements.map((r, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-gold-500">·</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600">
            진행
          </p>
          <ol className="mt-1.5 space-y-1 text-xs text-ink-700">
            {route.flow.map((step, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="font-bold text-gold-600">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-cream-100 px-3 py-2 text-[11px] leading-relaxed text-ink-700">
        🏫 {route.schoolsHint}
      </p>
    </article>
  );
}

function FreePromo({
  emoji,
  title,
  badge,
  desc,
  cta,
  href,
}: {
  emoji: string;
  title: string;
  badge: string;
  desc: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-cream-300 bg-cream-100 p-6 shadow-sm transition hover:border-gold-600/40 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{emoji}</span>
        <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
          {badge}
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-bold text-navy-900">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-700">{desc}</p>
      <Link
        href={href}
        className="mt-5 inline-flex w-fit items-center gap-1 rounded-full bg-navy-900 px-5 py-2.5 text-xs font-semibold text-gold-400 transition hover:bg-navy-800"
      >
        {cta} <span aria-hidden>→</span>
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
