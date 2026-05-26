import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden bg-cream-100">
      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
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

            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-700 sm:text-lg">
              <strong className="text-ink-900">{t("subtitleBold")}</strong>
              <br />
              {t("subtitleBody")}
            </p>

            <div className="mt-8">
              <a
                href="#diagnose"
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-10 py-5 text-lg font-extrabold text-white shadow-lg transition hover:bg-gold-500 hover:shadow-xl sm:text-xl"
              >
                내 고민 확인하기 <span aria-hidden>↓</span>
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-ink-600">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white/70 px-3 py-1.5">
                <span className="size-1.5 rounded-full bg-gold-600" />
                {t("trust1")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white/70 px-3 py-1.5">
                <span className="size-1.5 rounded-full bg-gold-600" />
                {t("trust2")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white/70 px-3 py-1.5">
                <span className="size-1.5 rounded-full bg-gold-600" />
                {t("trust3")}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-lg">
            <img
              src="/hero-campus.jpg"
              alt="호주 대학교 캠퍼스에서 대화하는 학생들"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce text-ink-400">
        <a href="#offers" aria-label="스크롤">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
