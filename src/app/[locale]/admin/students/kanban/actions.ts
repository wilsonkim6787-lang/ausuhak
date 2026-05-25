"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import { logActivity } from "@/lib/audit/log";

const VALID_LEAD: readonly string[] = [
  "lead", "contacted", "pro", "contract", "visa", "onsite", "pr",
];

export async function updateLeadStatusAction(
  studentId: string,
  newStatus: string,
): Promise<{ ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한 없음" };
  if (!studentId) return { error: "studentId 누락" };
  if (!VALID_LEAD.includes(newStatus)) return { error: "lead_status 값 오류" };

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("students")
    .select("lead_status")
    .eq("id", studentId)
    .single();

  const fromStatus = before?.lead_status ?? null;
  if (fromStatus === newStatus) return { ok: true };

  const { error } = await supabase
    .from("students")
    .update({ lead_status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", studentId);
  if (error) return { error: `저장 실패: ${error.message}` };

  await logActivity({
    action_type: "update_student",
    target_table: "students",
    target_id: studentId,
    details: { field: "lead_status", from: fromStatus, to: newStatus },
  });

  revalidatePath("/admin/students/kanban");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  return { ok: true };
}
