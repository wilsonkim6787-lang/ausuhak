import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden bg-cream-100">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 size-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201,150,42,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-gold-600/30 bg-gold-600/10 px-4 py-2 text-xs font-bold tracking-wider text-gold-600 sm:text-[13px]">
              <span className="size-1.5 animate-pulse rounded-full bg-gold-600" />
              {t("badge")}
            </div>

            <h1 className="font-display text-[clamp(36px,5.5vw,64px)] font-bold leading-[1.15] tracking-tight text-navy-900">
              {t("titleLine1")}
              <br />
              {t("titlePrefix")}
              <span className="italic text-gold-600">{t("titleEm")}</span>
              {t("titleSuffix")}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
              <strong className="text-navy-900">{t("subtitleBold")}</strong>
              <br />
              {t("subtitleBody")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href="#diagnose"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-7 py-4 text-base font-semibold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
              >
                {t("ctaDiagnose")} <span aria-hidden>→</span>
              </a>
              <a
                href="https://pf.kakao.com/_GadTX"
                target="_blank"
                rel="noopener noreferrer"
                data-kakao-source="hero"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-navy-800 px-6 py-4 text-base font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-cream-100 sm:text-lg"
              >
                {t("ctaStory")}
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {([1, 2, 3] as const).map((i) => (
                <div key={i} className="text-center sm:text-left">
                  <div className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                    {t(`stat${i}Num` as const)}
                    <span className="text-lg text-gold-600">
                      {t(`stat${i}Unit` as const)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-ink-500 sm:text-sm">
                    {t(`stat${i}Label` as const)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {([1, 2, 3] as const).map((i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1.5 text-xs font-medium text-navy-800 sm:text-sm"
                >
                  <span className="text-gold-600">✓</span>
                  {t(`trustPill${i}` as const)}
                </span>
              ))}
            </div>

            <p className="mt-6 text-xs text-ink-500">{t("businessHours")}</p>
          </div>

          <div className="hidden lg:block">
            <div
              className="flex aspect-[4/5] items-center justify-center rounded-3xl border-2 border-dashed border-cream-300 bg-cream-200 text-center"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(201,150,42,0.04) 0, rgba(201,150,42,0.04) 12px, rgba(201,150,42,0.08) 12px, rgba(201,150,42,0.08) 24px)",
              }}
            >
              <div className="p-8">
                <p className="text-xs font-bold tracking-wider text-gold-600">
                  HERO IMAGE PLACEHOLDER
                </p>
                <p className="mt-2 text-sm text-ink-700">
                  Wilson 프로필 또는 호주 캠퍼스
                  <br />
                  4:5 세로 비율
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
