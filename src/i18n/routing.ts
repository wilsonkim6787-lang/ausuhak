import { defineRouting } from "next-intl/routing";

// PART A A-4: 한국어 기본 (prefix 없음) / 영문 = /en (1페이지만)
export const routing = defineRouting({
  locales: ["ko", "en"],
  defaultLocale: "ko",
  // 'as-needed' = 기본 locale(ko)은 URL prefix 없음
  // 예: ausuhak.com (한국어) / ausuhak.com/en (영문)
  localePrefix: "as-needed",
  // 브라우저 Accept-Language 자동감지 OFF — / 는 무조건 KO. EN은 명시적 /en 이동만.
  // Why: 한국 학생·학부모가 영어 브라우저 쓰는 경우(macOS 영어 설정 등)에 /en 으로 빠지는 문제 방지.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
