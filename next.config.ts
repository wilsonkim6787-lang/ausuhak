import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Supabase storage 공개 이미지 최적화 허용 호스트 (next/image remotePatterns).
// 하드코딩 대신 NEXT_PUBLIC_SUPABASE_URL 에서 유도 → prod/preview/로컬 동일 동작.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  // Next.js 16 typed routes 비활성화
  // 이유: next-intl localePrefix:"as-needed" 패턴은 root "/"가 동적으로 [locale]=ko로 rewrite됨.
  // typed routes는 file system 기반 검증이라 root에 page.tsx 없음을 에러로 처리 → 충돌.
  // next-intl의 middleware/proxy가 routing을 책임지므로 typed routes 없이 동작 OK.
  typedRoutes: false,
  // 서버 액션 본문 크기 — admin documents 5MB 파일 업로드 (Migration 024)
  // + offers 일괄 등록(13장 ≈ 4.5MB 합산 multipart) 여유분 → 10mb
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default withNextIntl(nextConfig);
