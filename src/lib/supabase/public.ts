import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// 공개 데이터 전용 Supabase 클라이언트 (성능 핵심).
// - 쿠키를 읽지 않음 → 페이지가 정적 렌더링/ISR 가능해져 방문자에게 캐시로 즉시 응답
// - anon 키 = RLS의 익명 공개 정책만 통과 (published 콘텐츠 등)
// 로그인 상태가 필요한 화면은 기존 server.ts(createClient)를 그대로 사용.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
