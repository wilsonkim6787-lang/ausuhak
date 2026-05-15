import Link from "next/link";
import { useTranslations } from "next-intl";

export default function DiagnoseCTA() {
  const t = useTranslations("DiagnoseCTA");

  const bullets = [
    t("bullet1"),
    t("bullet2"),
    t("bullet3"),
    t("bullet4"),
    t("bullet5"),
    t("bullet6"),
  ];

  return (
    <section className="relative overflow-hidden bg-navy-900 text-cream-100">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 size-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201,150,42,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">
              {t("eyebrow")}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-cream-100 sm:text-5xl">
              {t("titleLine1")}
              <br />
              <span className="italic text-gold-500">{t("titleLine2")}</span>
              <span aria-hidden>.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-cream-200 sm:text-lg">
              {t("subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/diagnose"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-7 py-3.5 text-base font-semibold text-navy-900 shadow-md transition hover:bg-gold-500 hover:shadow-lg"
              >
                {t("ctaPrimary")}
              </Link>
              <a
                href="https://pf.kakao.com/_GadTX"
                target="_blank"
                rel="noopener noreferrer"
                data-kakao-source="diagnose-cta"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-cream-100/40 px-6 py-3.5 text-base font-semibold text-cream-100 transition hover:bg-cream-100 hover:text-navy-900"
              >
                {t("ctaSecondary")}
              </a>
            </div>
          </div>

          <div>
            <div className="rounded-3xl border border-cream-100/15 bg-navy-800/60 p-7 backdrop-blur-sm sm:p-9">
              <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
                {t("listEyebrow")}
              </p>
              <ul className="mt-5 space-y-4">
                {bullets.map((b, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-500"
                    />
                    <span className="text-sm leading-relaxed text-cream-200 sm:text-base">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-cream-100/15 pt-5 text-xs text-cream-200/70">
                {t("note")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
