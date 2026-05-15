import Link from "next/link";
import { useTranslations } from "next-intl";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default function FinalCTA() {
  const t = useTranslations("FinalCTA");

  return (
    <section className="relative overflow-hidden bg-navy-900 text-cream-100">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 size-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201,150,42,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">
          {t("eyebrow")}
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-cream-100 sm:text-5xl">
          {t("titleLine1")}
          <br />
          <span className="italic text-gold-500">{t("titleLine2")}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-cream-200 sm:text-lg">
          {t("body")}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/diagnose"
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
          >
            {t("ctaPrimary")} <span aria-hidden>→</span>
          </Link>
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="final-cta"
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-8 py-4 text-base font-bold text-[#3C1E1E] shadow-md transition hover:scale-[1.02] sm:text-lg"
          >
            <span aria-hidden>{"\u{1F4AC}"}</span>
            {t("ctaSecondary")}
          </a>
        </div>
        <p className="mt-5 text-sm text-cream-200/80">{t("ctaNote")}</p>
      </div>
    </section>
  );
}
