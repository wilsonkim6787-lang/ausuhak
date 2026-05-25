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
            <h1 className="mt-2 whitespace-nowrap font-display text-[clamp(18px,4.5vw,48px)] font-bold leading-tight text-ink-900">
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
            <img
              src="/hero-campus.png"
              alt="호주 대학교 캠퍼스에서 대화하는 학생들"
              className="rounded-3xl object-cover shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
