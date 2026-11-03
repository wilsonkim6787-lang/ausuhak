import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { stepsFromFlow } from "./admin-util";
import type { Service } from "./flows";

export type Sb = Awaited<ReturnType<typeof createClient>>;

// Creates a family and its first student. Returns the family link code.
export async function createFamilyStudent(
  sb: Sb,
  s: {
    name_ko: string;
    name_en?: string | null;
    phone?: string | null;
    email?: string | null;
    kakao_id?: string | null;
    birth_date?: string | null;
    education?: string | null;
    status?: "lead" | "active";
    consult_request_id?: string | null;
  },
): Promise<{ error: string } | { studentId: string; familyId: string; code: string }> {
  const { data: fam, error: fErr } = await sb
    .from("crm_families")
    .insert({ display_name: `${s.name_ko} 가족` })
    .select("id, invite_code")
    .single();
  if (fErr || !fam) return { error: "가족을 만들지 못했습니다. 다시 시도해 주세요." };
  const { data: st, error: sErr } = await sb
    .from("crm_students")
    .insert({
      family_id: fam.id,
      name_ko: s.name_ko,
      name_en: s.name_en || null,
      phone: s.phone || null,
      email: s.email || null,
      kakao_id: s.kakao_id || null,
      birth_date: s.birth_date || null,
      education: s.education || null,
      status: s.status ?? "active",
      consult_request_id: s.consult_request_id || null,
    })
    .select("id")
    .single();
  if (sErr || !st) {
    await sb.from("crm_families").delete().eq("id", fam.id);
    return { error: "학생을 저장하지 못했습니다. 다시 시도해 주세요." };
  }
  return { studentId: st.id as string, familyId: fam.id as string, code: fam.invite_code as string };
}

// Creates a case and seeds its steps from the service template.
export async function createCase(sb: Sb, studentId: string, service: Service, title: string, extra: Record<string, unknown> = {}) {
  const { data: c, error } = await sb
    .from("crm_cases")
    .insert({ student_id: studentId, service, title, ...extra })
    .select("id")
    .single();
  if (error || !c) return null;
  await sb.from("crm_steps").insert(stepsFromFlow(service, c.id as string));
  return c.id as string;
}
