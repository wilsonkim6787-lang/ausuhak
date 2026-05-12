"use client";

import { createBrowserClient } from "@supabase/ssr";

// 브라우저 (클라이언트 컴포넌트) 전용 Supabase 클라이언트
// - anon 키만 사용 (RLS로 보호됨 / PART 0-4 3중 보안 DB 레벨)
// - service_role 절대 사용 X (브라우저 노출 위험)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
