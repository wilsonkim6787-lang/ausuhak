"use server";

// 직원 → 학생 메시지 전송 (staff 포털). RLS student_messages_staff_all.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

export async function sendStaffMessageAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  const id = String(formData.get("student_id") ?? "");
  if (!user || (user.role !== "staff" && user.role !== "super_admin")) {
    redirect("/staff/students");
  }
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (!id || body.length < 1) redirect(`/staff/students/${id}`);

  const supabase = await createClient();
  const { error } = await supabase.from("student_messages").insert({
    student_id: id,
    sender_role: "staff",
    sender_id: user.id,
    body,
  });
  if (error) {
    redirect(`/staff/students/${id}?merr=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/staff/students/${id}`);
  revalidatePath(`/admin/students/${id}/messages`);
  revalidatePath("/mypage/notifications");
  redirect(`/staff/students/${id}#messages`);
}
