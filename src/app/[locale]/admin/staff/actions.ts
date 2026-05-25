"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import { logActivity } from "@/lib/audit/log";

export type PermActionState = { ok?: boolean; error?: string };

// staff_permissions 16 키 일괄 update.
// FormData: perm:<permission_key> = "on" (체크된 것만) / 안 박힌 키 = false.
export async function updateStaffPermissionsAction(
  _prev: PermActionState,
  formData: FormData,
): Promise<PermActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한 없음" };

  const staffId = String(formData.get("staff_id") ?? "");
  if (!staffId) return { error: "staff_id 누락" };

  const VALID_KEYS = [
    "view_all_students", "edit_student_info", "check_documents", "upload_offer",
    "confirm_payment", "write_shared_memo", "view_manuals", "edit_manuals",
    "view_internal_faqs", "edit_internal_faqs", "write_blog", "publish_blog",
    "send_kakao_alert", "create_quote", "view_stats", "manage_other_staff_permissions",
  ] as const;

  const supabase = await createClient();
  const now = new Date().toISOString();

  const rows = VALID_KEYS.map((key) => {
    const checked = formData.get(`perm:${key}`) === "on";
    return {
      user_id: staffId,
      permission_key: key,
      value: checked,
      granted_by: user.id,
      granted_at: now,
      revoked_at: checked ? null : now,
    };
  });

  const { error } = await supabase
    .from("staff_permissions")
    .upsert(rows, { onConflict: "user_id,permission_key" });
  if (error) return { error: `저장 실패: ${error.message}` };

  await logActivity({
    action_type: "update_student", // 신규 action_type 추가 없이 재사용
    target_table: "staff_permissions",
    target_id: staffId,
    details: {
      action: "permissions_updated",
      enabled_count: rows.filter((r) => r.value).length,
    },
  });

  revalidatePath(`/admin/staff/${staffId}`);
  revalidatePath("/admin/staff");
  return { ok: true };
}
