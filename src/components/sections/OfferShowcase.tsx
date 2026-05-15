import { useTranslations } from "next-intl";

interface OfferCard {
  school: string;
  major: string;
  year: string;
  initials: string;
}

const OFFERS: OfferCard[] = [
  { school: "The University of Sydney", major: "Bachelor of Nursing", year: "2025", initials: "K.J.Y" },
  { school: "UNSW Sydney", major: "Bachelor of Commerce", year: "2025", initials: "L.S.H" },
  { school: "The University of Melbourne", major: "Bachelor of Science", year: "2024", initials: "P.M.J" },
  { school: "Monash University", major: "Master of IT", year: "2025", initials: "C.D.W" },
  { school: "The University of Queensland", major: "Bachelor of Engineering", year: "2024", initials: "J.H.S" },
  { school: "Australian National University", major: "Bachelor of Arts", year: "2025", initials: "K.E.J" },
  { school: "The University of Adelaide", major: "Bachelor of Nursing", year: "2024", initials: "S.Y.B" },
  { school: "University of Newcastle", major: "Doctor of Medicine (FSM)", year: "2025", initials: "L.J.H" },
  { school: "La Trobe University", major: "Bachelor of Nursing", year: "2024", initials: "C.M.K" },
];

export default function OfferShowcase() {
  const t = useTranslations("OfferShowcase");

  return (
    <section id="offers" className="bg-cream-100">
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

          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-gold-600/30 bg-gold-600/10 px-4 py-2 text-xs font-bold tracking-wider text-gold-600 sm:text-[13px]">
            <span className="size-1.5 animate-pulse rounded-full bg-gold-600" />
            {t("statusBadge")}
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((o, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="relative flex aspect-[4/5] items-center justify-center border-b border-cream-300"
                style={{
                  background:
                    "repeating-linear-gradient(135deg, #FBF7EE 0, #FBF7EE 10px, #F5EFD9 10px, #F5EFD9 20px)",
                }}
              >
                <div className="text-center">
                  <div className="font-display text-4xl text-gold-600 opacity-50">
                    {"\u{1F4DC}"}
                  </div>
                  <p className="mt-3 text-[11px] font-bold tracking-[0.2em] text-ink-500">
                    {t("placeholderLabel")}
                  </p>
                  <p className="mt-1 text-[10px] text-ink-500">
                    {o.year} OFFER
                  </p>
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-navy-900/85 px-3 py-1 text-[10px] font-bold tracking-wider text-cream-100">
                  {o.initials}
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-bold tracking-wider text-gold-600">
                  {o.year}
                </p>
                <p className="mt-1.5 text-sm font-bold leading-snug text-navy-900 sm:text-base">
                  {o.school}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-700 sm:text-sm">
                  {o.major}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border-l-4 border-gold-600 bg-gold-100 p-6 sm:p-7">
          <p className="text-sm leading-relaxed text-ink-900 sm:text-base">
            {t("statusNote")}
          </p>
        </div>

        <div className="mt-10 text-center">
          <a
            href="https://pf.kakao.com/_GadTX"
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="offers"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-semibold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
          >
            {t("ctaPrimary")} <span aria-hidden>→</span>
          </a>
          <p className="mt-4 text-sm text-ink-500">{t("ctaNote")}</p>
        </div>
      </div>
    </section>
  );
}
