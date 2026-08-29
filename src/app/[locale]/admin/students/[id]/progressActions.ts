"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { canEditStudent } from "@/lib/auth/canEditStudent";
import { logActivity } from "@/lib/audit/log";
import {
  VALID_SUBSTEP_KEYS,
  buildStatusMap,
  deriveCurrentStage,
  isStaffDocType,
  type SubstepStatus,
} from "@/lib/progress";

const VALID_STATUS: SubstepStatus[] = ["done", "in_progress", "pending"];
const DOC_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const DOC_ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const DOC_BUCKET = "student-documents";

function nullify(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

function extOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot < 0 || dot === filename.length - 1) return "bin";
  return filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function revalidateStudent(studentId: string) {
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  revalidatePath("/admin/students/kanban");
  revalidatePath("/mypage");
}

// ─── sub-step 상태 변경 → current_stage 자동 재산출 ──────────
export async function updateSubstepStatusAction(formData: FormData): Promise<void> {
  const studentId = String(formData.get("student_id") ?? "");
  const substepKey = String(formData.get("substep_key") ?? "");
  const status = String(formData.get("status") ?? "") as SubstepStatus;
  if (!studentId || !VALID_SUBSTEP_KEYS.has(substepKey)) return;
  if (!VALID_STATUS.includes(status)) return;

  const { ok, user } = await canEditStudent(studentId);
  if (!ok || !user) return;

  const admin = createAdminClient();

  await admin.from("student_substeps").upsert(
    {
      student_id: studentId,
      substep_key: substepKey,
      status,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,substep_key" },
  );

  // 전체 sub-step + current_stage 재조회 → current_stage 재산출 후 동기화
  const [{ data: rows }, { data: student }] = await Promise.all([
    admin.from("student_substeps").select("substep_key, status").eq("student_id", studentId),
    admin.from("students").select("current_stage").eq("id", studentId).single(),
  ]);

  const currentStage = student?.current_stage ?? 1;
  const statusMap = buildStatusMap(rows ?? [], currentStage);
  const nextStage = deriveCurrentStage(statusMap);
  // stage 가 안 변해도(같은 stage 내 sub-step 이동) updated_at 은 항상 갱신 —
  // 안 하면 케어룰(inactive_5d/stage_stuck_14d)·대시보드 "단계 정체"·목록 정렬이
  // 실제로 진행 중인 학생을 방치된 것으로 오탐한다.
  await admin
    .from("students")
    .update({ current_stage: nextStage, updated_at: new Date().toISOString() })
    .eq("id", studentId);

  await logActivity({
    action_type: "update_substep",
    target_table: "students",
    target_id: studentId,
    details: { substep_key: substepKey, status, current_stage: nextStage },
  });

  revalidateStudent(studentId);
}

// ─── staff 제공 서류 업로드 (특정 sub-step 에 첨부) ──────────
export async function uploadSubstepDocAction(formData: FormData): Promise<void> {
  const studentId = String(formData.get("student_id") ?? "");
  const substepKey = String(formData.get("substep_key") ?? "");
  const docType = String(formData.get("doc_type") ?? "");
  const file = formData.get("file") as File | null;
  if (!studentId || !VALID_SUBSTEP_KEYS.has(substepKey)) return;
  if (!isStaffDocType(docType)) return; // staff 제공 서류만 이 액션으로
  if (!file || file.size === 0) return;

  const { ok, user } = await canEditStudent(studentId);
  if (!ok || !user) return;

  // 실패를 조용히 삼키지 않기 — 상세 페이지 ?err= 배너로 표시.
  // docx 는 브라우저에 따라 application/octet-stream 으로 올라와 mime 만 보면 거부됨 → 확장자 폴백.
  const fail = (msg: string): never =>
    redirect(`/admin/students/${studentId}?err=${encodeURIComponent(msg)}`);
  if (file.size > DOC_MAX_BYTES) fail("5MB 를 초과하는 파일입니다");
  if (!DOC_ALLOWED_MIME.has(file.type) && !["pdf", "jpg", "jpeg", "png", "docx"].includes(extOf(file.name))) {
    fail("PDF·JPG·PNG·DOCX 만 업로드할 수 있습니다");
  }

  const admin = createAdminClient();

  // 같은 학생·sub-step·doc_type 기존 row 조회 (교체 시 옛 파일 정리)
  const { data: existing } = await admin
    .from("documents")
    .select("id, storage_path")
    .eq("student_id", studentId)
    .eq("substep_key", substepKey)
    .eq("doc_type", docType)
    .maybeSingle();

  // 새 파일 먼저 업로드 — 성공 후 DB 반영, 옛 파일은 맨 마지막에 정리
  // (업로드 실패 시 기존 파일/row 유지 → 원본 유실 방지).
  const path = `${studentId}/${docType}-${Date.now()}.${extOf(file.name)}`;
  const buffer = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage
    .from(DOC_BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (uploadError) fail(`업로드 실패: ${uploadError.message}`);

  const payload = {
    student_id: studentId,
    substep_key: substepKey,
    doc_type: docType,
    status: "received",
    storage_path: path,
    mime_type: file.type,
    size_bytes: file.size,
    original_filename: file.name,
    uploaded_by: user.id,
    file_url: null,
  };

  if (existing?.id) {
    await admin.from("documents").update(payload).eq("id", existing.id);
  } else {
    await admin.from("documents").insert(payload);
  }

  // 새 파일이 정상 반영된 뒤에만 옛 파일 정리 (댕글링 방지).
  if (existing?.storage_path && existing.storage_path !== path) {
    await admin.storage.from(DOC_BUCKET).remove([existing.storage_path]);
  }

  await logActivity({
    action_type: "upload_document",
    target_table: "documents",
    target_id: studentId,
    details: { substep_key: substepKey, doc_type: docType, staff_provided: true },
  });

  revalidateStudent(studentId);
}

// ─── staff 제공 서류 삭제 (확인은 client 측) ────────────────
export async function deleteSubstepDocAction(formData: FormData): Promise<void> {
  const studentId = String(formData.get("student_id") ?? "");
  const docId = String(formData.get("doc_id") ?? "");
  if (!studentId || !docId) return;

  const { ok } = await canEditStudent(studentId);
  if (!ok) return;

  const admin = createAdminClient();
  const { data: doc } = await admin
    .from("documents")
    .select("storage_path, student_id")
    .eq("id", docId)
    .single();

  if (!doc || doc.student_id !== studentId) return;
  if (doc.storage_path) {
    await admin.storage.from(DOC_BUCKET).remove([doc.storage_path]);
  }
  await admin.from("documents").delete().eq("id", docId);

  revalidateStudent(studentId);
}

// ─── Lead Status (CRM 7단계) 변경 ──────────────────────────
export async function updateLeadStatusAction(formData: FormData): Promise<void> {
  const studentId = String(formData.get("student_id") ?? "");
  const leadStatus = nullify(formData.get("lead_status"));
  if (!studentId) return;

  const VALID_LEAD = ["lead", "contacted", "pro", "contract", "visa", "onsite", "pr"];
  if (!leadStatus || !VALID_LEAD.includes(leadStatus)) return;

  const { ok } = await canEditStudent(studentId);
  if (!ok) return;

  const admin = createAdminClient();
  await admin
    .from("students")
    .update({ lead_status: leadStatus, updated_at: new Date().toISOString() })
    .eq("id", studentId);

  await logActivity({
    action_type: "update_lead_status",
    target_table: "students",
    target_id: studentId,
    details: { lead_status: leadStatus },
  });

  revalidateStudent(studentId);
}

// ─── 학생 제출 서류 다운로드 URL (admin/담당직원 — 5분 signed) ──
export async function getStudentDocDownloadUrl(
  studentId: string,
  documentId: string,
): Promise<{ url?: string; error?: string }> {
  const { ok } = await canEditStudent(studentId);
  if (!ok) return { error: "권한 없음" };

  const admin = createAdminClient();
  const { data: doc } = await admin
    .from("documents")
    .select("storage_path, student_id")
    .eq("id", documentId)
    .single();
  if (!doc?.storage_path || doc.student_id !== studentId) return { error: "파일 없음" };

  const { data, error } = await admin.storage
    .from(DOC_BUCKET)
    .createSignedUrl(doc.storage_path, 300);
  if (error || !data) return { error: "URL 생성 실패" };
  return { url: data.signedUrl };
}
