"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

export type CreateStudentState = { error?: string };

// PART D-3 students.age_range CHECK 제약
function ageToRange(age: number | null): string | null {
  if (age == null) return null;
  if (age < 18) return "18미만";
  if (age <= 24) return "18-24";
  if (age <= 32) return "25-32";
  if (age <= 39) return "33-39";
  return "40+";
}

function nullify(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

export async function createStudentAction(
  _prev: CreateStudentState,
  formData: FormData,
): Promise<CreateStudentState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") {
    return { error: "권한이 없습니다." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "이름은 필수 입력입니다." };
  }

  const ageRaw = nullify(formData.get("age"));
  const age = ageRaw ? parseInt(ageRaw, 10) : null;
  if (age != null && (isNaN(age) || age < 0 || age > 120)) {
    return { error: "나이가 올바르지 않습니다." };
  }

  const isMedical = formData.get("is_medical") === "on";
  const medicalPathway = isMedical ? nullify(formData.get("medical_pathway")) : null;

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
    medical_pathway: medicalPathway,
    current_stage: 1,
    lead_status: "lead",
    source: nullify(formData.get("source")) ?? "kakao_direct",
  };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return { error: `저장 실패: ${error.message}` };
  }

  revalidatePath("/admin/students");
  redirect(`/admin/students/${data.id}`);
}
