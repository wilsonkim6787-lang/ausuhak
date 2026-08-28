"use server";

// 학생 → 관리자 메시지 전송. 학생 세션 검증 후 service role 로 기록
// (mypage 데이터 접근 패턴과 동일 — RLS 는 직원 전용으로 유지).

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/auth/requireStudent";
import { createAdminClient } from "@/lib/supabase/admin";

export type SendMessageState = { ok?: boolean; error?: string };

export async function sendStudentMessageAction(
  _prev: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const { student, user } = await requireStudent();
  if (!student.id) return { error: "학생 정보를 찾을 수 없습니다." };

  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (body.length < 1) return { error: "메시지를 입력해주세요." };

  const admin = createAdminClient();
  const { error } = await admin.from("student_messages").insert({
    student_id: student.id,
    sender_role: "student",
    sender_id: user.id,
    body,
  });
  if (error) {
    return { error: "전송에 실패했습니다. 잠시 후 다시 시도하거나 카카오로 문의해주세요." };
  }

  revalidatePath("/mypage/notifications");
  return { ok: true };
}
