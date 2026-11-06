import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session on signed-in areas and sends signed-out
// visitors to /login. Role checks happen again in the admin/mypage layouts.
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsLogin = path.startsWith("/admin") || path.startsWith("/mypage");
  if (needsLogin && !user) {
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    to.search = "?next=" + encodeURIComponent(path);
    return NextResponse.redirect(to);
  }
  // Signed-in visitors who tap 로그인 or 가입하기 go straight to their page.
  if (user && (path === "/login" || path === "/signup")) {
    const to = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    to.pathname = next && next.startsWith("/") && !next.startsWith("//") ? next : "/mypage";
    to.search = "";
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/mypage/:path*", "/login", "/signup", "/auth/:path*"],
};
