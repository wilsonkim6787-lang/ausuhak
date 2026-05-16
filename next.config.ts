import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Next.js 16 typed routes 비활성화
  // 이유: next-intl localePrefix:"as-needed" 패턴은 root "/"가 동적으로 [locale]=ko로 rewrite됨.
  // typed routes는 file system 기반 검증이라 root에 page.tsx 없음을 에러로 처리 → 충돌.
  // next-intl의 middleware/proxy가 routing을 책임지므로 typed routes 없이 동작 OK.
  typedRoutes: false,
  // 서버 액션 본문 크기 — admin documents 5MB 파일 업로드 (Migration 024)
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default withNextIntl(nextConfig);
