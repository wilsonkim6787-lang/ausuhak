import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/hero-campus.jpg"
          alt="호주 대학교 캠퍼스에서 대화하는 학생들"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream-100/95 via-cream-100/80 to-cream-100/40" />
      </div>

      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
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

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-700 sm:text-lg">
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
      </div>
    </section>
  );
}
