import { useTranslations } from "next-intl";

export default function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative min-h-[520px] overflow-hidden sm:min-h-[600px] lg:min-h-[680px]">
      <img
        src="/hero-campus.jpg"
        alt="호주 대학교 캠퍼스에서 대화하는 학생들"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/85 via-navy-900/70 to-navy-900/40" />

      <div className="container relative z-10 mx-auto flex max-w-5xl items-center px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <div className="max-w-xl">
          <span className="inline-block rounded-full border border-gold-500/40 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-400 backdrop-blur-sm">
            {t("badge")}
          </span>

          <p className="mt-6 text-lg font-medium text-cream-200 sm:text-xl">
            {t("titleLine1")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {t("titlePrefix")}
            <span className="text-gold-400">{t("titleEm")}</span>
            {t("titleSuffix")}
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-cream-200/90 sm:text-lg">
            <strong className="text-white">{t("subtitleBold")}</strong>
            <br />
            {t("subtitleBody")}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#diagnose"
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-10 py-5 text-lg font-extrabold text-white shadow-lg transition hover:bg-gold-500 hover:shadow-xl sm:text-xl"
            >
              내 고민 확인하기 <span aria-hidden>↓</span>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-cream-200/80">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-gold-400" />
              {t("trust1")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-gold-400" />
              {t("trust2")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-gold-400" />
              {t("trust3")}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/60">
        <a href="#offers" aria-label="스크롤">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
