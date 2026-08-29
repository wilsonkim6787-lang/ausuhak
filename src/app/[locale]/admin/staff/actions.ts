"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/getUser";
import { logActivity } from "@/lib/audit/log";
import { ALL_PERM_KEYS, STAFF_GRADES } from "@/lib/staff/grades";
import { likeEscape } from "@/lib/utils/likeEscape";

export type PermActionState = { ok?: boolean; error?: string };
export type CreateStaffState = {
  ok?: boolean;
  error?: string;
  // 성공 시 Wilson 가 카톡으로 직원에게 전달할 비밀번호 설정 link
  recoveryUrl?: string;
  email?: string;
  isNewAccount?: boolean;
};

// 신규 직원 생성 — auth.users 에 직접 생성 + role='staff' 로 승격.
// 결제 자동 회원가입과 동일 패턴 (admin API 활용).
export async function createStaffAction(
  _prev: CreateStaffState,
  formData: FormData,
): Promise<CreateStaffState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한 없음" };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  if (!email) return { error: "이메일 필수" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "이메일 형식 오류" };

  const admin = createAdminClient();

  // 1) 이미 public.users 에 같은 이메일이 있는지 (case-insensitive)
  //    likeEscape 필수 — email 의 '_'/'%' 가 와일드카드로 작동해 엉뚱한 계정과
  //    매칭되면 그 계정을 staff 로 바꿔버림 (권한 오연결).
  const { data: existing, error: lookupErr } = await admin
    .from("users")
    .select("id, role")
    .ilike("email", likeEscape(email))
    .maybeSingle();
  if (lookupErr) {
    // maybeSingle 은 2건 이상이면 에러 — 신규 생성으로 새지 않도록 여기서 중단.
    return { error: `계정 조회 실패: ${lookupErr.message}` };
  }

  // 자가 잠금 방지: 최고 관리자(super_admin) 계정은 staff 로 강등하지 않음.
  // (유일한 super_admin 이 강등되면 /admin 접근이 막혀 DB 직접 수정 없이 복구 불가)
  if (existing?.role === "super_admin") {
    return { error: "이미 최고 관리자(super_admin) 계정입니다. 직원으로 강등할 수 없습니다." };
  }

  let userId: string | null = existing?.id ?? null;
  let isNewAccount = false;

  if (!userId) {
    // 2) 신규 — auth.users 에 createUser → trigger 가 public.users 자동 생성 (role='student')
    const random = "ausuhak_" + crypto.randomUUID().slice(0, 16);
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email,
      password: random,
      email_confirm: true,
      user_metadata: name ? { name } : undefined,
    });
    if (cErr || !created.user) {
      return { error: `직원 계정 생성 실패: ${cErr?.message ?? "unknown"}` };
    }
    userId = created.user.id;
    isNewAccount = true;
  }

  // 3) public.users.role = 'staff' 로 승격 + 이름 update
  const { error: updErr } = await admin
    .from("users")
    .update({
      role: "staff",
      name: name || null,
    })
    .eq("id", userId);
  if (updErr) {
    return { error: `role 변경 실패: ${updErr.message}` };
  }

  // 4) 비밀번호 설정 link 발급 (직원이 직접 설정)
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  const recoveryUrl = linkData?.properties?.action_link;
  if (linkErr || !recoveryUrl) {
    return {
      ok: true,
      email,
      isNewAccount,
      error: `직원 등록은 완료되었으나 비밀번호 link 발급 실패: ${linkErr?.message}. 직원에게 /login → "비밀번호 찾기" 안내해주세요.`,
    };
  }

  await logActivity({
    action_type: "update_student",
    target_table: "users",
    target_id: userId,
    details: { action: "staff_created_or_promoted", email, is_new_account: isNewAccount },
  });

  revalidatePath("/admin/staff");
  return { ok: true, recoveryUrl, email, isNewAccount };
}

// 등급 프리셋 한 번에 적용 — 등급의 권한 묶음을 staff_permissions 16키로 upsert.
// FormData: staff_id, grade(등급 key). 적용 후에도 개별 체크박스로 미세조정 가능.
export async function applyStaffGradeAction(
  _prev: PermActionState,
  formData: FormData,
): Promise<PermActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한 없음" };

  const staffId = String(formData.get("staff_id") ?? "");
  const gradeKey = String(formData.get("grade") ?? "");
  const grade = STAFF_GRADES.find((g) => g.key === gradeKey);
  if (!staffId) return { error: "staff_id 누락" };
  if (!grade) return { error: "등급 정보를 찾을 수 없습니다." };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const permSet = new Set<string>(grade.perms);

  const rows = ALL_PERM_KEYS.map((key) => {
    const checked = permSet.has(key);
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
  if (error) return { error: `등급 적용 실패: ${error.message}` };

  await logActivity({
    action_type: "update_student",
    target_table: "staff_permissions",
    target_id: staffId,
    details: { action: "grade_applied", grade: grade.key, label: grade.label },
  });

  revalidatePath(`/admin/staff/${staffId}`);
  revalidatePath("/admin/staff");
  return { ok: true };
}

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
