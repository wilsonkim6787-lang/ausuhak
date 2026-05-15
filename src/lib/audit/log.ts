// PART K 3.5: activity_logs 기록 헬퍼.
// Server Component / Server Action / API Route 어디서든 호출 가능.
// 실패해도 호출자의 메인 로직은 절대 안 깨지게 silent (catch + console.error).

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

export type ActionType =
  // 인증
  | "login"
  | "logout"
  | "signup"
  | "password_recovery"
  // 조회 (민감 page 진입 시)
  | "view_student"
  | "view_quote"
  | "view_payment"
  // 변경
  | "create_payment"
  | "confirm_payment"
  | "refund_payment"
  | "create_quote"
  | "update_quote"
  | "update_student"
  | "advance_stage"
  | "upload_document"
  | "verify_document"
  // 보안
  | "unauthorized_access"
  | "role_mismatch"
  | "rls_denied"
  // 자동화 (Phase 3 후속)
  | "cron_run"
  | "sync_youtube"
  | "monitor_site";

export type LogInput = {
  action_type: ActionType;
  target_table?: string | null;
  target_id?: string | null;
  details?: Record<string, unknown>;
  // user_id를 명시할 수 있는 경우 (auth 실패 케이스 등에서)
  user_id?: string | null;
};

// 메인 진입점.
// - getCurrentUser()로 user_id 자동 캡처
// - X-Forwarded-For / User-Agent 캡처
// - 실패는 console.error로만 (호출자 로직 깨면 안 됨)
export async function logActivity(input: LogInput): Promise<void> {
  try {
    const supabase = await createClient();

    let userId = input.user_id ?? null;
    if (userId === null) {
      const u = await getCurrentUser();
      userId = u?.id ?? null;
    }

    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    const ua = h.get("user-agent") ?? null;

    await supabase.from("activity_logs").insert({
      user_id: userId,
      action_type: input.action_type,
      target_table: input.target_table ?? null,
      target_id: input.target_id ?? null,
      details: input.details ?? {},
      ip_address: ip,
      user_agent: ua,
    });
  } catch (err) {
    // 로그 실패가 메인 로직을 깨면 안 됨. console.error만.
    console.error("[activity_logs] insert failed:", err);
  }
}

// 권한 위반 단축: requireStudent/requireStaff에서 잘못된 role 진입 시 호출.
export async function logUnauthorized(
  path: string,
  expectedRole: "super_admin" | "staff" | "student",
  actualRole: string | null,
  userId: string | null,
): Promise<void> {
  return logActivity({
    action_type: actualRole ? "role_mismatch" : "unauthorized_access",
    details: { path, expected_role: expectedRole, actual_role: actualRole },
    user_id: userId,
  });
}
