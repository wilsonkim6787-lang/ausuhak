// Root path "/" placeholder
// next-intl proxy (src/proxy.ts)가 모든 "/" 요청을 [locale]/page.tsx로 internally rewrite하므로
// 이 페이지는 실제로 노출되지 않습니다.
// 단, Next.js 16 typed routes validator가 file system에 root page.tsx 존재를 요구하여 dummy로 추가.
export default function RootPage() {
  return null;
}
