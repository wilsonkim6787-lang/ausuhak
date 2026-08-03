import { getImageProps } from "next/image";
import { useTranslations } from "next-intl";
import heroCampus from "../../../public/hero-campus.jpg";
import heroPoster from "../../../public/hero-poster.jpg";
import HeroVideo from "./HeroVideo";

export default function Hero() {
  const t = useTranslations("Hero");

  // 모바일: 캠퍼스 사진 / 데스크탑(≥640px, 영상 재생 구간): 영상 첫 프레임.
  // 영상이 동일 프레임 위로 이어 재생되므로 사진→영상 전환이 보이지 않는다.
  // (<picture> 분기라 preload 링크는 못 쓰지만 최상단 SSR 마크업이라 발견 지연 없음)
  const common = {
    alt: "시드니와 호주 대학 캠퍼스 전경",
    fill: true,
    sizes: "100vw",
  } as const;
  const {
    props: { srcSet: posterSrcSet },
  } = getImageProps({ ...common, src: heroPoster });
  const { props: imgProps } = getImageProps({
    ...common,
    src: heroCampus,
    placeholder: "blur",
  });

  return (
    <section className="relative min-h-[85svh] overflow-hidden">
      <picture>
        <source media="(min-width: 640px)" srcSet={posterSrcSet} />
        {/* eslint-disable-next-line @next/next/no-img-element -- 아트 디렉션은 getImageProps+<picture> 공식 패턴 */}
        <img {...imgProps} className="object-cover" />
      </picture>
      {/* 배경 영상(데스크탑 전용) — 파일 없으면 위 이미지 유지. 제작: scripts/build-hero-video.sh */}
      <HeroVideo src="/videos/hero.mp4" />
      {/* 시네마틱 오버레이 — 상단 골드 글로우(프리미엄) + 중앙 텍스트 존 국소 음영 + 하단 다크.
          배경 영상이 눌리지 않게 전역은 옅게(정지 이미지 시절 0.92/0.5/0.28 → 0.66/0.2/0.08),
          가독성은 텍스트 뒤 라디얼 음영이 담당 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 18% 12%, rgba(201,150,42,0.20) 0%, transparent 55%), radial-gradient(ellipse 62% 52% at 50% 52%, rgba(10,22,40,0.32) 0%, transparent 68%), linear-gradient(to top, rgba(5,13,26,0.66) 0%, rgba(10,22,40,0.2) 45%, rgba(10,22,40,0.08) 100%)",
        }}
      />

      <div className="container relative z-10 mx-auto flex max-w-3xl items-center justify-center px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <div className="text-center animate-[heroRise_0.7s_ease-out_both]">
          <span className="inline-block rounded-full border border-gold-500/40 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-400 backdrop-blur-sm">
            {t("badge")}
          </span>

          <p className="mt-6 text-lg font-medium text-cream-200 sm:text-xl">
            {t("titleLine1")}
          </p>
          <h1 className="mt-3 text-balance font-display text-[clamp(1.2rem,5vw,2.9rem)] font-bold leading-[1.15] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
            {t("titlePrefix")}
            <span className="text-gold-400">{t("titleEm")}</span>
            {t("titleSuffix")}
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-cream-200/90 sm:text-lg">
            <strong className="text-white">{t("subtitleBold")}</strong>
            <br />
            {t("subtitleBody")}
          </p>

          <div className="mt-8">
            <a
              href="#diagnose"
              className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-10 py-5 text-lg font-extrabold text-white shadow-[0_8px_30px_rgba(201,150,42,0.45)] ring-1 ring-gold-400/40 transition hover:scale-[1.02] hover:bg-gold-500 hover:shadow-[0_10px_36px_rgba(201,150,42,0.55)] sm:text-xl"
            >
              내 상황과 비슷한 고민 찾기 <span aria-hidden>↓</span>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs font-semibold text-cream-200/80">
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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-gold-400" />
              {t("trust4")}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/60">
        <a href="#offers" aria-label="아래로 스크롤" className="inline-flex p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
