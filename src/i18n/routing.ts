import { defineRouting } from "next-intl/routing";

// PART A A-4: 한국어 기본 (prefix 없음) / 영문 = /en (1페이지만)
export const routing = defineRouting({
  locales: ["ko", "en"],
  defaultLocale: "ko",
  // 'as-needed' = 기본 locale(ko)은 URL prefix 없음
  // 예: ausuhak.com (한국어) / ausuhak.com/en (영문)
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
