"use server";

// 관리자/직원 → 학생 메시지 전송 (RLS student_messages_staff_all).

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

export async function sendAdminMessageAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const id = String(formData.get("student_id") ?? "");
  if (!user || (user.role !== "super_admin" && user.role !== "staff")) {
    redirect(`/admin/students/${id}/messages?err=${encodeURIComponent("권한 없음")}`);
  }
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (!id) redirect("/admin/students");
  if (body.length < 1) {
    redirect(`/admin/students/${id}/messages?err=${encodeURIComponent("메시지를 입력해주세요")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("student_messages").insert({
    student_id: id,
    sender_role: "staff",
    sender_id: user.id,
    body,
  });
  if (error) {
    redirect(`/admin/students/${id}/messages?err=${encodeURIComponent(`전송 실패: ${error.message}`)}`);
  }

  revalidatePath(`/admin/students/${id}/messages`);
  revalidatePath("/mypage/notifications");
  redirect(`/admin/students/${id}/messages`);
}
