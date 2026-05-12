import { useTranslations } from "next-intl";

// PART N-2 / PART N-7: Wilson 19년 스토리
// "삼촌 톤" = 이 섹션에만 사용 (Hero / 카드는 X)
// 호주 학교 교직원 경력 = 진짜 차별화 (PART N-1 1️⃣)
// "100% 보장" / "Wilson 비밀·명언" X (PART 0-1 / PART M-2)
// "솔직히 / 정직하게" 부사 X (Wilson 항상 정직 / PART N-2)
export default function WilsonStory() {
  const t = useTranslations("WilsonStory");

  const milestones = [
    { year: "2007", label: t("milestone1") },
    { year: "2010", label: t("milestone2") },
    { year: "2015~", label: t("milestone3") },
    { year: "2020", label: t("milestone4") },
    { year: "2026", label: t("milestone5") },
  ];

  return (
    <section id="wilson-story" className="bg-cream-200">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        {/* 섹션 타이틀 */}
        <div className="mb-12 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-navy-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("intro")}
          </p>
        </div>

        {/* 본문: 좌측 = 인용 박스 / 우측 = 19년 흐름 */}
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          {/* 좌측: Wilson 인용 박스 (Gold 100 배경) */}
          <div>
            <div className="rounded-3xl border-l-4 border-gold-600 bg-gold-100 p-8 shadow-sm sm:p-10">
              <span
                aria-hidden
                className="block font-display text-5xl leading-none text-gold-600"
              >
                &ldquo;
              </span>
              <blockquote className="mt-2 font-display text-xl italic leading-relaxed text-navy-800 sm:text-2xl">
                {t("quote")}
              </blockquote>
              <footer className="mt-6 text-sm font-semibold text-ink-700">
                — Wilson Kim · QEAC E240
              </footer>
            </div>

            {/* 호주 학교 교직원 경력 = 진짜 차별화 (PART N-1 ⭐) */}
            <div className="mt-8 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wider text-gold-600">
                {t("staffEyebrow")}
              </p>
              <p className="mt-3 text-base leading-relaxed text-ink-900">
                {t("staffDescription")}
              </p>
            </div>
          </div>

          {/* 우측: 19년 흐름 타임라인 */}
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-wider text-navy-700">
              {t("timelineEyebrow")}
            </p>
            <ol className="space-y-5 border-l-2 border-cream-300 pl-6">
              {milestones.map((m) => (
                <li key={m.year} className="relative">
                  {/* Dot */}
                  <span
                    aria-hidden
                    className="absolute -left-[31px] top-1.5 size-3.5 rounded-full border-2 border-cream-100 bg-gold-600"
                  />
                  <div>
                    <span className="font-display text-lg font-bold text-navy-900">
                      {m.year}
                    </span>
                    <p className="mt-1 text-sm leading-relaxed text-ink-700">
                      {m.label}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* 케어 메시지 (입학까지 X / 졸업까지 + 그 이후) */}
            <div className="mt-10 rounded-xl bg-navy-900 p-6 text-cream-100 sm:p-7">
              <p className="text-sm font-bold uppercase tracking-wider text-gold-500">
                {t("careEyebrow")}
              </p>
              <p className="mt-3 text-base leading-relaxed">{t("careMessage")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
