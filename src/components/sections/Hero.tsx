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
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              {t("badge")}
            </span>

            <p className="mt-4 text-lg font-medium text-ink-700 sm:text-xl">
              {t("titleLine1")}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink-900 sm:text-5xl">
              {t("titlePrefix")}
              <span className="text-gold-600">{t("titleEm")}</span>
              {t("titleSuffix")}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
              <strong className="text-ink-900">{t("subtitleBold")}</strong>
              <br />
              {t("subtitleBody")}
            </p>

            <div className="mt-8">
              <a
                href="https://pf.kakao.com/_GadTX"
                target="_blank"
                rel="noopener noreferrer"
                data-kakao-source="hero"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
              >
                {t("ctaStory")} <span aria-hidden>→</span>
              </a>
            </div>
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
