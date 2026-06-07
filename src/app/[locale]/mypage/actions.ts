"use server";

import { requireStudent } from "@/lib/auth/requireStudent";
import { createAdminClient } from "@/lib/supabase/admin";

const DOC_BUCKET = "student-documents";

// 학생 본인 서류(staff 가 제공한 '받음' 서류) 다운로드 URL.
// 소유권 확인(student.id 일치) 후 5분 signed URL.
export async function getMyDocumentDownloadUrl(
  documentId: string,
): Promise<{ url?: string; error?: string }> {
  const { student } = await requireStudent();
  if (!student.id) return { error: "학생 정보 없음" };

  const admin = createAdminClient();
  const { data: doc } = await admin
    .from("documents")
    .select("storage_path, student_id")
    .eq("id", documentId)
    .single();

  if (!doc?.storage_path || doc.student_id !== student.id) {
    return { error: "파일 없음" };
  }

  const { data, error } = await admin.storage
    .from(DOC_BUCKET)
    .createSignedUrl(doc.storage_path, 300);
  if (error || !data) return { error: "URL 생성 실패" };
  return { url: data.signedUrl };
}
