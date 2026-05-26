import { useTranslations } from "next-intl";

export default function WilsonStory() {
  const t = useTranslations("WilsonStory");

  const methods = [
    { n: "01", title: t("method1Title"), body: t("method1Body") },
    { n: "02", title: t("method2Title"), body: t("method2Body") },
    { n: "03", title: t("method3Title"), body: t("method3Body") },
    { n: "04", title: t("method4Title"), body: t("method4Body") },
  ];

  return (
    <section id="story" className="relative overflow-hidden bg-cream-100">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-20 size-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201,150,42,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </span>
          <h2 className="mt-4 font-display text-4xl italic font-bold leading-tight text-navy-900 sm:text-5xl lg:text-6xl">
            &ldquo;{t("quoteTitle1")}
            <br />
            {t("quoteTitlePrefix")}
            <span className="not-italic text-gold-600">
              {t("quoteTitleEm")}
            </span>
            {t("quoteTitleSuffix")}&rdquo;
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-700">
            <strong className="text-navy-900">{t("quoteSubtitle")}</strong>
            <span className="ml-2 text-sm text-ink-500">
              — {t("quoteAuthor")}
            </span>
          </p>
        </div>

        <div className="mt-16 grid items-center gap-12 rounded-3xl bg-white p-8 shadow-sm sm:p-10 lg:grid-cols-[1fr_1.2fr]">
          <div
            className="flex aspect-[4/5] items-center justify-center rounded-2xl border-2 border-dashed border-cream-300 bg-cream-200 text-center"
            style={{
              background:
                "repeating-linear-gradient(45deg, rgba(201,150,42,0.04) 0, rgba(201,150,42,0.04) 12px, rgba(201,150,42,0.08) 12px, rgba(201,150,42,0.08) 24px)",
            }}
          >
            <div className="p-8">
              <p className="text-xs font-bold tracking-wider text-gold-600">
                WILSON 프로필
              </p>
              <p className="mt-2 text-sm text-ink-700">
                정면 프로필 사진
                <br />
                4:5 세로 비율
              </p>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center rounded-full border border-gold-600/30 bg-gold-600/10 px-4 py-1.5 text-xs font-bold tracking-wider text-gold-600">
              {t("profileBadge")}
            </span>
            <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
              {t("profileTitle1")}
              <br />
              <span className="italic text-gold-600">
                {t("profileTitleEm")}
              </span>
              {t("profileTitleSuffix")}
            </h3>
            <p className="mt-5 text-base leading-relaxed text-ink-700">
              {t("profileBody")}
            </p>
          </div>
        </div>

        <div
          className="mx-auto mt-16 max-w-3xl rounded-2xl border-l-4 border-gold-600 p-8 sm:p-10"
          style={{
            background:
              "linear-gradient(135deg, #FBF7EE 0%, #F5EFD9 100%)",
          }}
        >
          <p className="font-display text-xl italic leading-relaxed text-navy-900 sm:text-2xl">
            &ldquo;{t("honestQuote")}&rdquo;
          </p>
          <p className="mt-4 text-base leading-relaxed text-ink-700">
            {t("honestBody")}
          </p>
        </div>

        <div className="mt-20 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("methodEyebrow")}
          </span>
          <h3 className="mx-auto mt-3 max-w-3xl font-display text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">
            {t("methodHeading")}
          </h3>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {methods.map((m) => (
            <div
              key={m.n}
              className="flex flex-col rounded-2xl border border-cream-300 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-8"
            >
              <h4 className="flex items-baseline gap-3 text-lg font-bold text-ink-900 sm:text-xl">
                <span className="font-display text-2xl text-gold-600 sm:text-3xl">{m.n}</span>
                <span className="whitespace-nowrap">{m.title}</span>
              </h4>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-700 sm:text-[15px]">
                {m.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://pf.kakao.com/_GadTX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
          >
            {t("ctaTitle")} <span aria-hidden>→</span>
          </a>
          <p className="mt-4 text-sm text-ink-500">{t("ctaBody")}</p>
        </div>
      </div>
    </section>
  );
}
