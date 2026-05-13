import { useTranslations } from "next-intl";

// PART F-2 / PART O O-6: Hero 1차 화면
// 데스크톱: 좌측 콘텐츠 / 우측 이미지 (60:40)
// 모바일: 텍스트 위 / 이미지 자리 아래 (세로)
// 톤: 전문가 + 따뜻한 신뢰 (Warm Trust) / "삼촌" 표현 X
export default function Hero() {
  const t = useTranslations("Hero");
  const kakaoUrl = "https://pf.kakao.com/_GadTX";

  return (
    <section className="relative overflow-hidden bg-cream-100">
      {/* 우상단 부드러운 골드 글로우 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 size-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(201,150,42,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* 좌측 콘텐츠 */}
          <div>
            {/* 트러스트 뱃지 */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-gold-600/30 bg-gold-600/10 px-4 py-2 text-xs font-bold tracking-wider text-gold-600 sm:text-[13px]">
              <span className="size-1.5 animate-pulse rounded-full bg-gold-600" />
              {t("badge")}
            </div>

            {/* 헤드라인 (Playfair Display + 한글 Pretendard) */}
            <h1 className="font-display text-[clamp(36px,5.5vw,64px)] font-bold leading-[1.15] tracking-tight text-navy-900">
              {t("titleLine1")}
              <br />
              <span className="italic text-gold-600">{t("titleLine2")}</span>
            </h1>

            {/* 서브 헤드 */}
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
              {t("subtitle1")}
              <br />
              {t("subtitle2")}
            </p>

            {/* CTA 버튼 2개 */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-7 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg"
              >
                {t("ctaKakao")}
              </a>
              <a
                href="/diagnose"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-navy-800 px-6 py-3.5 text-base font-semibold text-navy-800 transition hover:bg-navy-800 hover:text-cream-100"
              >
                {t("ctaDiagnose")}
              </a>
            </div>

            {/* 트러스트 시그널 */}
            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-ink-500">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-navy-700">950명+</span>
                {t("trust1Suffix")}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-navy-700">QEAC E240</span>
                {t("trust2Suffix")}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-navy-700">19년</span>
                {t("trust3Suffix")}
              </span>
            </div>

            {/* 영업 시간 (PART E-16 site_settings) */}
            <p className="mt-6 text-xs text-ink-500">{t("businessHours")}</p>
          </div>

          {/* 우측 이미지 placeholder (Nano Banana는 Phase 1.7 이후) */}
          <div className="hidden lg:block">
            <div
              className="flex aspect-[4/5] items-center justify-center rounded-3xl border-2 border-dashed border-cream-300 bg-cream-200 text-center"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(201,150,42,0.04) 0, rgba(201,150,42,0.04) 12px, rgba(201,150,42,0.08) 12px, rgba(201,150,42,0.08) 24px)",
              }}
            >
              <div className="p-8">
                <p className="text-xs font-bold tracking-wider text-gold-600">
                  HERO IMAGE PLACEHOLDER
                </p>
                <p className="mt-2 text-sm text-ink-700">
                  Nano Banana 생성
                  <br />
                  호주 캠퍼스 + 동양인·다국적 학생
                  <br />
                  Golden Hour / 따뜻한 신뢰
                </p>
                <p className="mt-4 text-[11px] text-ink-500">
                  Phase 1.7에서 채움
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
