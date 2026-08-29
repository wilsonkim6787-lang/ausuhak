import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { getPublicContact } from "@/lib/settings/publicContact";

// PART F-2 / PART E-16 site_settings 동적 로드 — 어드민 "사이트 설정" 저장분을 반영.
// 값이 비어 있으면(미입력) 기존 i18n/기본값으로 폴백.
// PART N-11: 자매학교 EC 어학원·화상영어 = 푸터 로고만 (카드/FAQ X)
// PART 0-1: Wilson 개인 카톡 ID 노출 X / 채널 URL만
// 레이아웃: 브랜드 | 상담(행동) | 안내(정보) | 자매 서비스 4열 — 아이콘 고정폭 정렬.

function IconRow({
  icon,
  children,
  multiline = false,
}: {
  icon: string;
  children: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <span className={`flex gap-2 ${multiline ? "items-start" : "items-center"}`}>
      <span
        aria-hidden
        className={`w-5 shrink-0 text-center text-sm opacity-70 ${multiline ? "leading-6" : "leading-none"}`}
      >
        {icon}
      </span>
      <span className="min-w-0">{children}</span>
    </span>
  );
}

const DEFAULT_PHONE = "010-9848-7789";
const DEFAULT_KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const locale = await getLocale();
  const contact = await getPublicContact(locale);

  const kakaoUrl = contact.kakaoUrl ?? DEFAULT_KAKAO_URL;
  const phone = contact.phone ?? DEFAULT_PHONE;
  const phoneTel = phone.replace(/[^\d+]/g, "");
  const hoursText = contact.businessHours
    ? contact.holidays
      ? `${contact.businessHours}\n${contact.holidays}`
      : contact.businessHours
    : t("hoursValue");
  const addressText = contact.address ?? t("addressValue");

  return (
    <footer className="mt-auto bg-navy-900 pb-20 text-cream-100 sm:pb-0">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr] lg:gap-8">
          {/* Column 1: 브랜드 */}
          <div>
            <p className="font-display text-2xl font-bold tracking-wide text-cream-100">
              ausuhak.com <span className="whitespace-nowrap">(호주유학)</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream-200">
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

          {/* Column 2: 상담 (행동) */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
              {t("contactEyebrow")}
            </p>
            <div className="mt-4 flex w-full max-w-[230px] flex-col gap-2.5">
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-kakao-source="footer"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#FEE500] px-4 py-2.5 text-sm font-bold text-[#3C1E1E] shadow-sm transition hover:scale-[1.02]"
              >
                <span aria-hidden>{"\u{1F4AC}"}</span>
                카카오 1:1 상담
              </a>
              <Link
                href="/consult"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-gold-500"
              >
                <span aria-hidden>{"\u{1F4E5}"}</span>
                무엇이든 물어보세요
              </Link>
            </div>
            <p className="mt-2.5 text-[11px] text-cream-200/70">
              질문은 무료 · 영업일 24시간 내 답변
            </p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <a
                  href={`tel:${phoneTel}`}
                  className="text-cream-200 transition hover:text-gold-400"
                >
                  <IconRow icon={"\u{1F4DE}"}>{phone}</IconRow>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: 안내 (정보) */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
              안내
            </p>
            <ul className="mt-4 space-y-2.5 break-keep text-sm text-cream-200">
              <li>
                <a
                  href="https://blog.naver.com/momstudy100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-gold-400"
                >
                  <IconRow icon={"\u{1F4D7}"}>네이버 블로그</IconRow>
                </a>
              </li>
              <li>
                <IconRow icon={"\u{23F0}"} multiline>
                  <span className="whitespace-pre-line leading-6">{hoursText}</span>
                </IconRow>
              </li>
              <li>
                <IconRow icon={"\u{1F4CD}"} multiline>
                  <span className="leading-6">{addressText}</span>
                </IconRow>
              </li>
            </ul>
          </div>

          {/* Column 4: 자매 서비스 — EC 로고 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-500">
              {t("sisterEyebrow")}
            </p>
            <a
              href="https://educennow.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-lg bg-white/95 px-3 py-2 ring-1 ring-white/15 transition hover:ring-gold-500/60"
            >
              <img
                src="/ec-logo.png"
                alt="Education Center — 출국 전 영어 준비 학원·화상영어 학습 센터"
                className="h-7 w-auto"
                loading="lazy"
              />
            </a>
            <p className="mt-3 max-w-[240px] break-keep text-[13px] leading-relaxed text-cream-200/90">
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
