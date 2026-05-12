import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// PART C 권한 체크는 추후 Step 1.8 (관리자 페이지) 빌드 시 추가
// 지금은 i18n 라우팅만
export default createMiddleware(routing);

export const config = {
  // 모든 경로에 적용 / 단, API·정적 파일·favicon·sitemap·robots 제외
  matcher: [
    "/((?!api|_next|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
