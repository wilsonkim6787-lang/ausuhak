import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

// /admin/* = Wilson (super_admin) 전용. 미들웨어 = 1차 cookie 기반 차단.
// 실제 role 검증 = /admin/layout.tsx에서 2차 (DB의 users.role).
// PART C-1 / PART M-5 Layer 2 (API/middleware).

const intlMiddleware = createMiddleware(routing);

function isAdminPath(pathname: string): boolean {
  // /admin, /admin/*, /en/admin, /ko/admin 등 모든 locale 변형 매칭
  return /^\/(?:en\/|ko\/)?admin(?:\/|$)/.test(pathname);
}

export default async function middleware(request: NextRequest) {
  // 1) next-intl 라우팅 먼저 실행 → locale 처리된 응답 생성
  const intlResponse = intlMiddleware(request);

  // 2) intl 응답 위에 Supabase 세션 refresh (cookie 동기화)
  const { user } = await updateSession(request, intlResponse);

  // 3) /admin/* 진입 시 로그인 안 됐으면 /login으로
  if (isAdminPath(request.nextUrl.pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
