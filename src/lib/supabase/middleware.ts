import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// 미들웨어 전용 Supabase 클라이언트
// - 매 요청마다 세션 토큰 자동 갱신 (Supabase 권장)
// - 쿠키 양쪽 동기화 (request + response)
export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabase, response };
}
