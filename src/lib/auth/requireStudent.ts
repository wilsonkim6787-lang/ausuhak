import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, type AppUser } from "./getUser";
import { logUnauthorized } from "@/lib/audit/log";

export type StudentRow = {
  id: string;
  user_id: string;
  name: string | null;
  current_stage: number;
  is_medical: boolean;
  medical_pathway: string | null;
  lead_status: string | null;
  age: number | null;
  education: string | null;
  english_level: string | null;
  preferred_region: string | null;
  major: string | null;
  budget_range: string | null;
  card_result: unknown;
  diagnose_uuid: string | null;
};

// /mypage/* 가드: 로그인된 student 유저 + 본인 students row를 함께 돌려줌.
// - 비로그인 → /login
// - 비-student (admin/staff) → /admin (admin) 또는 / (그 외)
// - student인데 students row 없음 → stub 반환 (진단 전 / 결제 전 상태).
//   진단 시 anonymous_id로 students row가 생기고, 결제 시 user_id가 링크됨.
export async function requireStudent(): Promise<{
  user: AppUser;
  student: StudentRow;
}> {
  const user = await getCurrentUser();
  if (!user) {
    await logUnauthorized("/mypage", "student", null, null);
    redirect("/login");
  }
  if (user.role === "super_admin") redirect("/admin");
  if (user.role !== "student") {
    await logUnauthorized("/mypage", "student", user.role, user.id);
    redirect("/");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("students")
    .select(
      "id, user_id, name, current_stage, is_medical, medical_pathway, lead_status, age, education, english_level, preferred_region, major, budget_range, card_result, diagnose_uuid",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { user, student: existing as StudentRow };
  }

  // 학생 row 없음 = 가입만 한 상태. 진단·결제 진입을 유도하는 stub 반환.
  return {
    user,
    student: {
      id: "",
      user_id: user.id,
      name: user.name,
      current_stage: 1,
      is_medical: false,
      medical_pathway: null,
      lead_status: "lead",
      age: null,
      education: null,
      english_level: null,
      preferred_region: null,
      major: null,
      budget_range: null,
      card_result: null,
      diagnose_uuid: null,
    },
  };
}
