"use server";

// 새 비밀번호 설정 — 재설정 메일 링크로 들어온 복구 세션에서 실행.
// 성공 시 role 별 목적지로 이동 (login/callback 과 동일 규칙).

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit/log";

export type UpdatePasswordState = { error?: string };

export async function updatePasswordAction(
  _prev: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (password !== confirm) {
    return { error: "비밀번호가 서로 일치하지 않습니다." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "링크가 만료되었습니다. 비밀번호 찾기를 다시 요청해주세요." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("should be different")) {
      return { error: "기존과 다른 비밀번호를 입력해주세요." };
    }
    return { error: `변경 실패: ${error.message}` };
  }

  await logActivity({
    action_type: "password_recovery",
    user_id: user.id,
    details: {},
  });

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  let dest = "/";
  if (profile?.role === "super_admin") dest = "/admin";
  else if (profile?.role === "staff") dest = "/staff";
  else if (profile?.role === "student") dest = "/mypage";

  revalidatePath("/", "layout");
  redirect(dest);
}
