import Link from "next/link";
import { useTranslations } from "next-intl";

// PART F-2 / PART E-16 site_settings 동적 로드 (Phase 1.7에서 DB 연결)
// PART N-11: 자매학교 EC 어학원·화상영어 = 푸터 로고만 (카드/FAQ X)
// PART 0-1: Wilson 개인 카톡 ID 노출 X / 채널 URL만
export default function Footer() {
  const t = useTranslations("Footer");
  const kakaoUrl = "https://pf.kakao.com/_GadTX";

  return (
    <footer className="mt-auto bg-navy-900 text-cream-100">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          {/* Column 1: 브랜드 */}
          <div>
            <p className="font-display text-xl font-bold">
              ausuhak<span className="italic text-gold-500">.com</span>
              <span className="ml-1 text-sm font-medium text-cream-300">
                (호주유학)
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-cream-300">
              {t("tagline")}
            </p>

            {/* QEAC 배지 placeholder */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-cream-300/20 bg-white/5 px-3 py-2">
              <span className="size-2 rounded-full bg-gold-500" />
              <span className="text-[11px] font-bold tracking-wider text-gold-500">
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
                💬{" "}
                <a
                  href={kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-kakao-source="footer"
                  className="text-cream-100 underline-offset-2 hover:underline"
                >
                  pf.kakao.com/_GadTX
                </a>
              </li>
              <li className="text-cream-300">
                ⏰ {t("hoursValue")}
              </li>
            </ul>
          </div>

          {/* Column 3: 자매 서비스 (PART N-11 / 푸터 로고만) */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
              {t("sisterEyebrow")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex aspect-[3/2] items-center justify-center rounded-lg border border-cream-300/20 bg-white/5 p-3 text-center text-[10px] font-semibold tracking-wider text-cream-300">
                EC 어학원
                <br />
                (로고)
              </div>
              <div className="flex aspect-[3/2] items-center justify-center rounded-lg border border-cream-300/20 bg-white/5 p-3 text-center text-[10px] font-semibold tracking-wider text-cream-300">
                EC 화상영어
                <br />
                (로고)
              </div>
            </div>
          </div>
        </div>

        {/* 하단 라인 */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-cream-300/10 pt-6 text-xs text-cream-300 sm:flex-row sm:items-center">
          <p>© 2026 ausuhak.com</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gold-500">
              {t("privacy")}
            </a>
            <a href="#" className="hover:text-gold-500">
              {t("terms")}
            </a>
            <Link href="/en" className="hover:text-gold-500">
              {t("languageToggle")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
