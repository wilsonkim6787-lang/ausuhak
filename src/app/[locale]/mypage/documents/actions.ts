"use server";

// 학생 본인 서류 업로드 (024 주석의 'Phase 5 학생 본인 업로드' 구현).
// storage 정책은 super_admin 전용 유지 — 학생은 서버(service role) 경유로만 쓰기.

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/auth/requireStudent";
import { createAdminClient } from "@/lib/supabase/admin";
import { STUDENT_DOC_TYPES } from "@/lib/progress";

export type UploadDocState = { ok?: boolean; error?: string; docType?: string };

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const BUCKET = "student-documents";

function extOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return "bin";
  return filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
}

export async function uploadMyDocAction(
  _prev: UploadDocState,
  formData: FormData,
): Promise<UploadDocState> {
  const { student, user } = await requireStudent();
  const docType = String(formData.get("doc_type") ?? "");
  const file = formData.get("file") as File | null;

  if (!student.id) return { error: "학생 정보를 찾을 수 없습니다.", docType };
  if (!(STUDENT_DOC_TYPES as readonly string[]).includes(docType)) {
    return { error: "잘못된 서류 종류입니다.", docType };
  }
  if (!file || file.size === 0) return { error: "파일을 선택해주세요.", docType };
  if (file.size > MAX_BYTES) return { error: "5MB 이하 파일만 업로드할 수 있습니다.", docType };
  if (!ALLOWED_MIME.has(file.type)) {
    return { error: "PDF·JPG·PNG·DOCX 파일만 업로드할 수 있습니다.", docType };
  }

  const admin = createAdminClient();

  // 같은 종류의 기존 row (최신 1개) — 재업로드면 파일 교체 + row 갱신
  const { data: existing } = await admin
    .from("documents")
    .select("id, storage_path, substep_key")
    .eq("student_id", student.id)
    .eq("doc_type", docType)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const path = `${student.id}/${docType}-${Date.now()}.${extOf(file.name)}`;
  const buffer = await file.arrayBuffer();
  const { error: upErr } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (upErr) {
    return { error: `업로드 실패: ${upErr.message}`, docType };
  }

  if (existing?.storage_path) {
    await admin.storage.from(BUCKET).remove([existing.storage_path]);
  }

  const payload = {
    storage_path: path,
    file_url: null,
    mime_type: file.type,
    size_bytes: file.size,
    original_filename: file.name.slice(0, 200),
    status: "submitted", // 검토 중
    note: null, // 이전 보완 요청 사유 초기화
    uploaded_by: user.id,
    substep_key: existing?.substep_key ?? "a_docs",
  };

  const res = existing
    ? await admin.from("documents").update(payload).eq("id", existing.id)
    : await admin
        .from("documents")
        .insert({ ...payload, student_id: student.id, doc_type: docType });
  if (res.error) {
    return { error: `저장 실패: ${res.error.message}`, docType };
  }

  revalidatePath("/mypage/documents");
  revalidatePath("/mypage");
  return { ok: true, docType };
}
