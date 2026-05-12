import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버 (Server Component / API Route / Server Action) 전용 Supabase 클라이언트
// - anon 키 사용 (사용자 세션 기반 / RLS 적용)
// - 쿠키로 인증 상태 동기화
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component에서 setAll 호출 = 무시 (middleware/proxy에서 처리)
          }
        },
      },
    },
  );
}
