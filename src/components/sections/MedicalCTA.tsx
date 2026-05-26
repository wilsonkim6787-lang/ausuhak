import { useTranslations } from "next-intl";

export default function MedicalCTA() {
  const t = useTranslations("MedicalCTA");

  const cards = [
    {
      icon: t("card1Icon"),
      eyebrow: t("card1Eyebrow"),
      title: t("card1Title"),
      body: t("card1Body"),
      tag1: t("card1Tag1"),
      tag2: t("card1Tag2"),
      href: "/medical.html#isat",
    },
    {
      icon: t("card2Icon"),
      eyebrow: t("card2Eyebrow"),
      title: t("card2Title"),
      body: t("card2Body"),
      tag1: t("card2Tag1"),
      tag2: t("card2Tag2"),
      href: "/medical.html#mmi",
    },
    {
      icon: t("card3Icon"),
      eyebrow: t("card3Eyebrow"),
      title: t("card3Title"),
      body: t("card3Body"),
      tag1: t("card3Tag1"),
      tag2: t("card3Tag2"),
      href: "/medical.html#strategy",
    },
  ];

  return (
    <section className="bg-white">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-bold leading-tight text-navy-900 sm:text-5xl lg:text-6xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {cards.map((c) => (
            <a
              key={c.eyebrow}
              href={c.href}
              className="group flex flex-col rounded-2xl border border-cream-300 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-gold-600 hover:shadow-lg sm:p-8"
            >
              <p className="text-[11px] font-bold tracking-[0.15em] text-gold-600">
                {c.eyebrow}
              </p>
              <h3 className="mt-2 text-lg font-bold text-navy-900 group-hover:text-gold-600 sm:text-xl">
                {c.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-700">
                {c.body}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-navy-800">
                  {c.tag1}
                </span>
                <span className="inline-flex items-center rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-navy-800">
                  {c.tag2}
                </span>
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-gold-600">
                자세히 보기 <span aria-hidden className="transition group-hover:translate-x-1">→</span>
              </span>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/medical.html"
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
          >
            {t("ctaPrimary")} <span aria-hidden>→</span>
          </a>
          <p className="mt-4 text-sm text-ink-500">{t("ctaSubtext")}</p>
        </div>
      </div>
    </section>
  );
}
