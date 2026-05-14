"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

export type ActionState = { ok?: boolean; error?: string };

function nullify(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

function ageToRange(age: number | null): string | null {
  if (age == null) return null;
  if (age < 18) return "18미만";
  if (age <= 24) return "18-24";
  if (age <= 32) return "25-32";
  if (age <= 39) return "33-39";
  return "40+";
}

// ─── Tab 1: 기본 정보 업데이트 ──────────────────────────────
export async function updateStudentBasicAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한이 없습니다." };

  const id = String(formData.get("student_id") ?? "");
  if (!id) return { error: "student_id 누락." };

  const name = nullify(formData.get("name"));
  if (!name) return { error: "이름은 필수입니다." };

  const ageRaw = nullify(formData.get("age"));
  const age = ageRaw ? parseInt(ageRaw, 10) : null;
  if (age != null && (isNaN(age) || age < 0 || age > 120)) {
    return { error: "나이가 올바르지 않습니다." };
  }

  const isMedical = formData.get("is_medical") === "on";

  const payload = {
    name,
    kakao_id: nullify(formData.get("kakao_id")),
    phone:    nullify(formData.get("phone")),
    email:    nullify(formData.get("email")),
    age,
    age_range: ageToRange(age),
    education: nullify(formData.get("education")),
    english_level: nullify(formData.get("english_level")),
    preferred_region: nullify(formData.get("preferred_region")),
    major: nullify(formData.get("major")),
    budget_range: nullify(formData.get("budget_range")),
    is_medical: isMedical,
    medical_pathway: isMedical ? nullify(formData.get("medical_pathway")) : null,
    source: nullify(formData.get("source")),
    updated_at: new Date().toISOString(),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("students").update(payload).eq("id", id);
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath(`/admin/students/${id}`);
  revalidatePath("/admin/students");
  return { ok: true };
}

// ─── Tab 2: Stage / Lead Status 업데이트 ───────────────────
export async function updateStudentStageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한이 없습니다." };

  const id = String(formData.get("student_id") ?? "");
  if (!id) return { error: "student_id 누락." };

  const stageRaw = formData.get("current_stage");
  const stage = stageRaw ? parseInt(String(stageRaw), 10) : null;
  if (!stage || stage < 1 || stage > 12) {
    return { error: "Stage는 1~12 사이여야 합니다." };
  }

  const leadStatus = nullify(formData.get("lead_status"));
  const VALID_LEAD = ["lead", "contacted", "pro", "contract", "visa", "onsite", "pr"];
  if (leadStatus && !VALID_LEAD.includes(leadStatus)) {
    return { error: "Lead Status 값이 올바르지 않습니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({
      current_stage: stage,
      lead_status: leadStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath(`/admin/students/${id}`);
  revalidatePath("/admin/students");
  return { ok: true };
}

// ─── Tab 3: 메모 추가 (PART 0-4 3중 보안) ───────────────────
export async function addNoteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한이 없습니다." };

  const studentId = String(formData.get("student_id") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "shared_with_assigned");
  const tagsRaw = String(formData.get("tags") ?? "").trim();

  if (!studentId) return { error: "student_id 누락." };
  if (!content) return { error: "메모 내용을 입력해주세요." };
  if (!["shared_with_assigned", "wilson_only"].includes(visibility)) {
    return { error: "visibility 값이 올바르지 않습니다." };
  }

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : null;

  const supabase = await createClient();
  const { error } = await supabase.from("student_notes").insert({
    student_id: studentId,
    author_id: user.id,
    visibility,
    content,
    tags,
  });
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath(`/admin/students/${studentId}/notes`);
  return { ok: true };
}

// 메모 숨김 (soft delete / 감사 추적 보존)
export async function hideNoteAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return;

  const noteId = String(formData.get("note_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!noteId) return;

  const supabase = await createClient();
  await supabase
    .from("student_notes")
    .update({ hidden_at: new Date().toISOString() })
    .eq("id", noteId);

  revalidatePath(`/admin/students/${studentId}/notes`);
}

// ─── Tab 4: 학교 지원 ──────────────────────────────────────
export async function addApplicationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한이 없습니다." };

  const studentId = String(formData.get("student_id") ?? "");
  const schoolId = nullify(formData.get("school_id"));
  const program = nullify(formData.get("program"));
  const status = nullify(formData.get("status")) ?? "preparing";
  const appliedAt = nullify(formData.get("applied_at"));
  const notes = nullify(formData.get("notes"));

  if (!studentId) return { error: "student_id 누락." };
  if (!schoolId && !program) return { error: "학교 또는 프로그램은 입력해야 합니다." };

  const VALID_STATUS = ["preparing", "applied", "offer_received", "accepted", "rejected", "withdrawn"];
  if (!VALID_STATUS.includes(status)) return { error: "status 값이 올바르지 않습니다." };

  const supabase = await createClient();
  const { error } = await supabase.from("school_applications").insert({
    student_id: studentId,
    school_id: schoolId,
    program,
    status,
    applied_at: appliedAt,
    notes,
  });
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath(`/admin/students/${studentId}/applications`);
  return { ok: true };
}

export async function updateApplicationStatusAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return;

  const appId = String(formData.get("application_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!appId || !status) return;

  const supabase = await createClient();
  const payload: Record<string, string> = { status };
  if (status === "offer_received") {
    payload.offer_received_at = new Date().toISOString();
  }
  await supabase.from("school_applications").update(payload).eq("id", appId);

  revalidatePath(`/admin/students/${studentId}/applications`);
}

export async function deleteApplicationAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return;

  const appId = String(formData.get("application_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!appId) return;

  const supabase = await createClient();
  await supabase.from("school_applications").delete().eq("id", appId);

  revalidatePath(`/admin/students/${studentId}/applications`);
}

// ─── Tab 5: 서류 체크리스트 ────────────────────────────────
// 8 doc_type 고정 (PART D-3 문서):
//   passport / transcript / english_score / financial /
//   gs_statement / recommendation / personal_statement / other
export async function upsertDocumentAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return;

  const studentId = String(formData.get("student_id") ?? "");
  const docType = String(formData.get("doc_type") ?? "");
  const docId = nullify(formData.get("doc_id"));
  const status = nullify(formData.get("status")) ?? "pending";
  const fileUrl = nullify(formData.get("file_url"));
  const note = nullify(formData.get("note"));
  if (!studentId || !docType) return;

  const supabase = await createClient();
  if (docId) {
    // 기존 행 update
    const payload: Record<string, string | null> = { status, file_url: fileUrl, note };
    if (status === "verified" || status === "received") {
      payload.checked_by = user.id;
    }
    await supabase.from("documents").update(payload).eq("id", docId);
  } else {
    // 신규 insert
    await supabase.from("documents").insert({
      student_id: studentId,
      doc_type: docType,
      status,
      file_url: fileUrl,
      uploaded_by: user.id,
      checked_by: status === "verified" || status === "received" ? user.id : null,
      note,
    });
  }

  revalidatePath(`/admin/students/${studentId}/documents`);
}

// ─── Tab 8: 마감일 (Critical Deadlines) ────────────────────
export async function addDeadlineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한이 없습니다." };

  const studentId = String(formData.get("student_id") ?? "");
  const deadlineType = nullify(formData.get("deadline_type"));
  const deadlineDate = nullify(formData.get("deadline_date"));
  const note = nullify(formData.get("note"));

  if (!studentId) return { error: "student_id 누락." };
  if (!deadlineType) return { error: "마감일 유형을 선택해주세요." };
  if (!deadlineDate) return { error: "마감일 날짜를 입력해주세요." };

  const VALID = ["offer_acceptance", "tuition", "visa", "coe", "oshc", "isat_test", "mmi_interview", "gamsat", "departure"];
  if (!VALID.includes(deadlineType)) return { error: "유형 값이 올바르지 않습니다." };

  const supabase = await createClient();
  const { error } = await supabase.from("critical_deadlines").insert({
    student_id: studentId,
    deadline_type: deadlineType,
    deadline_date: deadlineDate,
    note,
  });
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath(`/admin/students/${studentId}/deadlines`);
  return { ok: true };
}

export async function completeDeadlineAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return;

  const deadlineId = String(formData.get("deadline_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!deadlineId) return;

  const supabase = await createClient();
  await supabase
    .from("critical_deadlines")
    .update({ status: "completed" })
    .eq("id", deadlineId);

  revalidatePath(`/admin/students/${studentId}/deadlines`);
}

export async function deleteDeadlineAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return;

  const deadlineId = String(formData.get("deadline_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!deadlineId) return;

  const supabase = await createClient();
  await supabase.from("critical_deadlines").delete().eq("id", deadlineId);

  revalidatePath(`/admin/students/${studentId}/deadlines`);
}
