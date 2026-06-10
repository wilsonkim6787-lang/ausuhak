// 케어 평가용 학생 데이터 로더 — /admin/care 페이지와 cron(api/cron/care) 공용.
// 학생 + 최근 문서 + 진행 중 비자케이스를 묶어 StudentForCare[] 로 만든다.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudentForCare } from "./rules";

type StudentRaw = {
  id: string;
  name: string | null;
  kakao_id: string | null;
  current_stage: number;
  lead_status: string | null;
  updated_at: string;
  user_id: string | null;
  photo_path: string | null;
  users: { last_login_at: string | null } | { last_login_at: string | null }[] | null;
};
type DocRow = { student_id: string; created_at: string };
type VisaRow = { student_id: string; submitted_at: string | null };

export async function loadStudentsForCare(
  client: SupabaseClient,
): Promise<StudentForCare[]> {
  const [studentsRes, docsRes, visasRes] = await Promise.all([
    client
      .from("students")
      .select(
        "id, name, kakao_id, current_stage, lead_status, updated_at, user_id, photo_path, users(last_login_at)",
      )
      .limit(2000),
    client
      .from("documents")
      .select("student_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
    client
      .from("visa_cases")
      .select("student_id, submitted_at")
      .eq("status", "submitted")
      .not("submitted_at", "is", null),
  ]);

  if (studentsRes.error) throw new Error(studentsRes.error.message);

  const latestDocByStudent = new Map<string, string>();
  for (const d of (docsRes.data ?? []) as DocRow[]) {
    if (!latestDocByStudent.has(d.student_id)) {
      latestDocByStudent.set(d.student_id, d.created_at);
    }
  }
  const visaByStudent = new Map<string, string>();
  for (const v of (visasRes.data ?? []) as VisaRow[]) {
    if (v.submitted_at && !visaByStudent.has(v.student_id)) {
      visaByStudent.set(v.student_id, v.submitted_at);
    }
  }

  return (studentsRes.data ?? []).map((s) => {
    const raw = s as StudentRaw;
    const usersField = Array.isArray(raw.users) ? raw.users[0] ?? null : raw.users;
    return {
      id: raw.id,
      name: raw.name,
      kakao_id: raw.kakao_id,
      current_stage: raw.current_stage,
      lead_status: raw.lead_status,
      updated_at: raw.updated_at,
      user_id: raw.user_id,
      photo_path: raw.photo_path,
      users: usersField ?? undefined,
      latest_document_at: latestDocByStudent.get(raw.id) ?? null,
      visa_submitted_at: visaByStudent.get(raw.id) ?? null,
    };
  });
}
