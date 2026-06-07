import { getCurrentUser, type AppUser } from "./getUser";
import { createAdminClient } from "@/lib/supabase/admin";

// 진행 모델 제어 권한: super_admin 또는 해당 학생의 담당 직원(primary/shared).
// observer / 미배정 직원 / 그 외 = 불가.
// (RLS 우회 admin client 로 배정 조회 — 호출자가 권한 게이트로 사용.)
export async function canEditStudent(
  studentId: string,
): Promise<{ ok: boolean; user: AppUser | null }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, user: null };
  if (user.role === "super_admin") return { ok: true, user };
  if (user.role !== "staff") return { ok: false, user };

  const admin = createAdminClient();
  const { data } = await admin
    .from("student_assignments")
    .select("role")
    .eq("student_id", studentId)
    .eq("staff_id", user.id)
    .is("released_at", null)
    .in("role", ["primary", "shared"])
    .maybeSingle();

  return { ok: Boolean(data), user };
}
