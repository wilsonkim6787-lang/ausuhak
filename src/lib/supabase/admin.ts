import { createClient } from "@supabase/supabase-js";

// 관리자 (Server Action / API Route 中 RLS 우회 필요한 경우) 전용 클라이언트
// - service_role 키 사용 (RLS 우회 / DB 전체 권한)
// - 절대 클라이언트 컴포넌트에서 import X (브라우저 노출 시 DB 통째로 노출 위험)
// - Wilson Super Admin / 마이그레이션 / 데이터 임포트 / 시스템 트리거 전용
// PART 0-4 3중 보안 / PART M-5 Layer 1

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY missing in .env.local");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
