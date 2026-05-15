import Link from "next/link";
import { useTranslations } from "next-intl";

const CONCERNS = [
  { icon: "\u{1F4DA}", key: "concern1" },
  { icon: "\u{1F4DD}", key: "concern2" },
  { icon: "\u{1F4B0}", key: "concern3" },
  { icon: "\u{1FA7A}", key: "concern4" },
  { icon: "\u{1F3E0}", key: "concern5" },
  { icon: "\u{1F6EB}", key: "concern6" },
] as const;

export default function ConcernQuestions() {
  const t = useTranslations("ConcernQuestions");

  return (
    <section className="bg-cream-200">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-navy-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONCERNS.map((c) => (
            <div
              key={c.key}
              className="flex items-start gap-4 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-7"
            >
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-xl"
              >
                {c.icon}
              </span>
              <p className="text-base font-medium leading-relaxed text-navy-900 sm:text-lg">
                {t(c.key as "concern1")}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/diagnose"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-semibold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
          >
            {t("ctaPrimary")} <span aria-hidden>→</span>
          </Link>
          <a
            href="https://pf.kakao.com/_GadTX"
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="concerns"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-navy-800 bg-white px-8 py-4 text-base font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-cream-100 sm:text-lg"
          >
            {t("ctaSecondary")}
          </a>
        </div>
      </div>
    </section>
  );
}
