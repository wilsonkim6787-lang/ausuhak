import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

// PART A A-4: 한국어 = ausuhak.com / 영문 = ausuhak.com/en
// 본격 콘텐츠는 Step 1.5 (한국어 메인) + Step 1.9 (영문 파트너 페이지)에서 빌드

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale); // SSG 활성화 (정적 생성 최적화)
  return <HomeView />;
}

function HomeView() {
  const t = useTranslations();
  const kakaoUrl = "https://pf.kakao.com/_GadTX";

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="container mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-600/30 bg-gold-100 px-4 py-2 text-xs font-bold tracking-wider text-gold-600">
            <span className="size-1.5 rounded-full bg-gold-600 animate-pulse" />
            {t("Hero.phaseTag")}
          </span>
        </div>

        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-navy-900 sm:text-6xl">
          {t("Hero.titleLine1")}
          <br />
          <span className="italic text-gold-600">{t("Hero.titleLine2")}</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-700 sm:text-xl">
          {t("Hero.subtitle1")}
          <br />
          {t("Hero.subtitle2")}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-7 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-gold-500"
          >
            {t("Hero.ctaKakao")}
          </a>
          <button
            type="button"
            disabled
            className="inline-flex min-h-[44px] cursor-not-allowed items-center justify-center gap-2 rounded-xl border-2 border-navy-800 px-6 py-3.5 text-base font-semibold text-navy-800 opacity-60"
          >
            {t("Hero.ctaDiagnose")}
          </button>
        </div>

        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-500">
          <span>{t("Hero.trust1")}</span>
          <span>{t("Hero.trust2")}</span>
          <span>{t("Hero.trust3")}</span>
        </div>

        <p className="mt-8 text-xs text-ink-500">{t("Hero.businessHours")}</p>
      </section>

      {/* Phase 1 진행 상황 */}
      <section className="container mx-auto max-w-5xl border-t border-cream-300 px-4 py-16">
        <h2 className="mb-2 font-display text-2xl font-semibold text-navy-900">
          {t("Progress.title")}
        </h2>
        <p className="mb-6 text-ink-700">{t("Progress.description")}</p>

        <ul className="space-y-2 text-sm text-ink-700">
          <li>{t("Progress.step1_1")}</li>
          <li>{t("Progress.step1_2")}</li>
          <li>{t("Progress.step1_3")}</li>
          <li>{t("Progress.step1_4")}</li>
          <li>{t("Progress.step1_5")}</li>
          <li>{t("Progress.step1_6")}</li>
          <li>{t("Progress.step1_7")}</li>
          <li>{t("Progress.step1_8")}</li>
          <li>{t("Progress.step1_9")}</li>
          <li>{t("Progress.step1_10")}</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-cream-300 bg-navy-900 text-cream-100">
        <div className="container mx-auto max-w-5xl px-4 py-12">
          <p className="font-display text-xl font-semibold">{t("Footer.brand")}</p>
          <p className="mt-1 text-sm text-cream-300">{t("Footer.tagline")}</p>

          <div className="mt-6 space-y-1.5 text-sm">
            <p>
              {t("Footer.kakaoLabel")}{" "}
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-500 hover:underline"
              >
                pf.kakao.com/_GadTX
              </a>
            </p>
            <p>
              {t("Footer.hoursLabel")} {t("Footer.hoursValue")}
            </p>
          </div>

          <p className="mt-8 text-xs text-cream-300">{t("Footer.copyright")}</p>
        </div>
      </footer>
    </main>
  );
}
