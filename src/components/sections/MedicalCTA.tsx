import Link from "next/link";
import { useTranslations } from "next-intl";

export default function MedicalCTA() {
  const t = useTranslations("MedicalCTA");

  const stats = [
    { value: "5", label: t("stat1") },
    { value: "21", label: t("stat2") },
    { value: "ISAT", label: t("stat3") },
    { value: "MMI", label: t("stat4") },
  ];

  return (
    <section className="bg-cream-100">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              {t("eyebrow")}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-navy-900 sm:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-700 sm:text-lg">
              {t("subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href="/medical.html"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-navy-900 px-7 py-3.5 text-base font-semibold text-cream-100 shadow-md transition hover:bg-navy-800 hover:shadow-lg"
              >
                {t("ctaPrimary")}
              </a>
              <Link
                href="/medical/isat"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-navy-800 px-6 py-3.5 text-base font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-cream-100"
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm"
                >
                  <p className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border-l-4 border-gold-600 bg-gold-100 p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-gold-600">
                {t("noteEyebrow")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-900 sm:text-base">
                {t("noteBody")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
