"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { canEditStudent } from "@/lib/auth/canEditStudent";
import { getCurrentUser } from "@/lib/auth/getUser";
import { logActivity } from "@/lib/audit/log";
import { buildStatusMap, deriveCurrentStage, VALID_SUBSTEP_KEYS } from "@/lib/progress";

export type CommandState = { ok?: string; error?: string };

type StageAction = {
  stage_key: string;
  label: string;
  target_substep: string | null;
  mypage_text: string | null;
  kakao_message: string | null;
  required_documents: string[] | null;
};

function render(msg: string | null, name: string): string {
  return (msg ?? "").replace(/\{name\}/g, name || "학생");
}

// 단계 적용 → 마이페이지 반영 → (성공 후에만) 카톡 발송 대기 알림 생성.
export async function applyStageCommand(
  _prev: CommandState,
  formData: FormData,
): Promise<CommandState> {
  const studentId = String(formData.get("student_id") ?? "");
  const stageKey = String(formData.get("stage_key") ?? "");
  if (!studentId || !stageKey) return { error: "학생과 단계를 선택하세요." };

  const { ok, user } = await canEditStudent(studentId);
  if (!ok || !user) return { error: "권한이 없습니다." };

  const admin = createAdminClient();

  // 단계 액션 + 학생 조회
  const [actionRes, studentRes] = await Promise.all([
    admin
      .from("stage_actions")
      .select("stage_key, label, target_substep, mypage_text, kakao_message, required_documents")
      .eq("stage_key", stageKey)
      .single(),
    admin.from("students").select("id, name, current_stage").eq("id", studentId).single(),
  ]);

  if (actionRes.error || !actionRes.data) return { error: "단계 정의를 찾을 수 없습니다." };
  if (studentRes.error || !studentRes.data) return { error: "학생을 찾을 수 없습니다." };

  const action = actionRes.data as StageAction;
  const student = studentRes.data;

  // ── 1) DB 갱신 (마이페이지 반영) ──
  // 1a. target sub-step 완료 처리 → current_stage 재산출
  if (action.target_substep && VALID_SUBSTEP_KEYS.has(action.target_substep)) {
    const up = await admin.from("student_substeps").upsert(
      {
        student_id: studentId,
        substep_key: action.target_substep,
        status: "done",
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,substep_key" },
    );
    if (up.error) return { error: `단계 반영 실패: ${up.error.message}` };

    const { data: rows } = await admin
      .from("student_substeps")
      .select("substep_key, status")
      .eq("student_id", studentId);
    const statusMap = buildStatusMap(rows ?? [], student.current_stage ?? 1);
    const nextStage = deriveCurrentStage(statusMap);
    if (nextStage !== student.current_stage) {
      await admin
        .from("students")
        .update({ current_stage: nextStage, updated_at: new Date().toISOString() })
        .eq("id", studentId);
    }
  }

  // 1b. required_documents → status "requested"(요청됨) 표시 (없는 유형만)
  const reqDocs = Array.isArray(action.required_documents) ? action.required_documents : [];
  if (reqDocs.length > 0) {
    const { data: existing } = await admin
      .from("documents")
      .select("doc_type")
      .eq("student_id", studentId);
    const have = new Set((existing ?? []).map((d: { doc_type: string }) => d.doc_type));
    const toInsert = reqDocs
      .filter((dt) => !have.has(dt))
      .map((dt) => ({ student_id: studentId, doc_type: dt, status: "requested" }));
    if (toInsert.length > 0) await admin.from("documents").insert(toInsert);
  }

  // ── 2) 반영 성공 후에만 카톡 발송 대기 알림 생성 (순서 보장) ──
  const message = render(action.kakao_message, student.name ?? "");
  const notif = await admin.from("notifications").insert({
    student_id: studentId,
    channel: "kakao_manual",
    stage_key: stageKey,
    message,
    status: "pending",
    created_by: user.id,
  });
  if (notif.error) {
    return { error: `반영은 됐지만 알림 생성 실패: ${notif.error.message}` };
  }

  await logActivity({
    action_type: "update_substep",
    target_table: "students",
    target_id: studentId,
    details: { command: stageKey, label: action.label },
  });

  revalidatePath("/admin/command");
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  revalidatePath("/mypage");

  return { ok: `${student.name ?? "학생"} · ${action.label} 반영 완료. 카톡 발송 대기에 추가됨.` };
}

// 카톡 수동 발송 완료 표시 (B)
export async function markNotificationSent(formData: FormData): Promise<void> {
  const id = String(formData.get("notification_id") ?? "");
  if (!id) return;
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return;

  const admin = createAdminClient();
  await admin
    .from("notifications")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/command");
}
