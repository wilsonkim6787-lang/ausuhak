import Link from "next/link";
import { useTranslations } from "next-intl";

// PART F-2 / PART E-16 site_settings 동적 로드 (Phase 1.7에서 DB 연결)
// PART N-11: 자매학교 EC 어학원·화상영어 = 푸터 로고만 (카드/FAQ X)
// PART 0-1: Wilson 개인 카톡 ID 노출 X / 채널 URL만

export default function Footer() {
  const t = useTranslations("Footer");
  const kakaoUrl = "https://pf.kakao.com/_GadTX";

  return (
    <footer className="mt-auto bg-navy-900 pb-20 text-cream-100 sm:pb-0">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          {/* Column 1: 브랜드 */}
          <div>
            <p className="font-display text-2xl font-bold tracking-wide text-cream-100">
              ausuhak.com (호주유학)
            </p>
            <p className="mt-3 text-sm leading-relaxed text-cream-200">
              {t("tagline")}
            </p>

            {/* QEAC 자격 배지 (추후 공식 로고 이미지로 교체 가능) */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gold-500/40 bg-gold-500/10 px-3.5 py-2">
              <span aria-hidden className="text-base leading-none">🛡️</span>
              <span className="text-[11px] font-bold tracking-wider text-gold-400">
                QEAC E240 · 호주 정부 인증
              </span>
            </div>
          </div>

          {/* Column 2: 연락 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
              {t("contactEyebrow")}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-kakao-source="footer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#FEE500] px-4 py-2 text-sm font-semibold text-[#3C1E1E] transition hover:scale-[1.02]"
                >
                  <span aria-hidden>{"\u{1F4AC}"}</span>
                  카카오 채널로 1:1 상담
                </a>
              </li>
              <li>
                <a
                  href="tel:010-9848-7789"
                  className="inline-flex items-center gap-2 text-cream-200 transition hover:text-gold-400"
                >
                  <span aria-hidden>{"\u{1F4DE}"}</span> 010-9848-7789
                </a>
              </li>
              <li>
                <Link
                  href="/consult"
                  className="inline-flex items-center gap-2 text-cream-200 transition hover:text-gold-400"
                >
                  <span aria-hidden>{"\u{1F4E5}"}</span> 무료 상담 신청
                </Link>
              </li>
              <li>
                <a
                  href="https://blog.naver.com/momstudy100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-cream-200 transition hover:text-gold-400"
                >
                  <span aria-hidden>{"\u{1F4D7}"}</span> 네이버 블로그
                </a>
              </li>
              <li className="whitespace-pre-line text-cream-200">
                <span aria-hidden>{"\u{23F0}"}</span> {t("hoursValue")}
              </li>
              <li className="text-cream-200">
                <span aria-hidden>{"\u{1F4CD}"}</span> {t("addressValue")}
              </li>
            </ul>
          </div>

          {/* Column 3: 자매 서비스 — EC 로고 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
              {t("sisterEyebrow")}
            </p>
            <a
              href="https://educennow.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-xl bg-cream-100 px-4 py-3 shadow-sm ring-1 ring-cream-300/30 transition hover:shadow-md"
            >
              <img
                src="/ec-logo.png"
                alt="Education Center — 출국 전 영어 준비 학원·화상영어 학습 센터"
                className="h-9 w-auto"
                loading="lazy"
              />
            </a>
            <p className="mt-3 text-sm leading-relaxed text-cream-200">
              {t("sisterBody")}
            </p>
          </div>
        </div>

        {/* 하단 라인 */}
        <div className="mt-12 space-y-3 border-t border-cream-100/15 pt-6 text-xs text-cream-200/60">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-cream-200">© 2026 ausuhak.com</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-gold-500">
                {t("privacy")}
              </Link>
              <Link href="/terms" className="hover:text-gold-500">
                {t("terms")}
              </Link>
              <Link href="/en" className="hover:text-gold-500">
                {t("languageToggle")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
