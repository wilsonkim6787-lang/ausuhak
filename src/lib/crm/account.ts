import "server-only";
import { adminClient } from "@/lib/supabase/admin";

export function normalizeCode(v: string) {
  return v.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

export function formatCode(v: string) {
  return v.length === 8 ? v.slice(0, 4) + "-" + v.slice(4) : v;
}

// Creates (or links) the family records for a signed-up account.
export async function attachAccount(opts: {
  userId: string;
  email: string | null;
  role: "student" | "parent";
  name: string;
  phone: string;
  relation: string;
  code?: string;
}): Promise<{ error?: string }> {
  const admin = adminClient();
  if (!admin) return { error: "지금은 가입을 처리할 수 없습니다. 잠시 후 다시 해 주세요." };
  let familyId: string | null = null;

  if (opts.code) {
    const { data: fam } = await admin.from("crm_families").select("id").eq("invite_code", normalizeCode(opts.code)).maybeSingle();
    if (!fam) return { error: "연결 코드가 맞지 않습니다. 받은 코드 8자리를 다시 확인해 주세요." };
    familyId = fam.id;
  }

  if (opts.role === "student" && !familyId) {
    if (!familyId) {
      const { data: fam, error } = await admin
        .from("crm_families")
        .insert({ display_name: `${opts.name} 가족` })
        .select("id")
        .single();
      if (error || !fam) return { error: "가입 처리 중 문제가 생겼습니다. 다시 시도해 주세요." };
      familyId = fam.id;
    }
  }

  const { error: pErr } = await admin.from("crm_profiles").upsert({
    id: opts.userId,
    role: opts.role,
    family_id: familyId,
    name: opts.name,
    phone: opts.phone || null,
    relation: opts.relation,
  });
  if (pErr) return { error: "가입 처리 중 문제가 생겼습니다. 다시 시도해 주세요." };

  if (opts.role === "student" && familyId) {
    const { data: st } = await admin
      .from("crm_students")
      .select("id")
      .eq("family_id", familyId)
      .is("profile_id", null)
      .order("created_at")
      .limit(1)
      .maybeSingle();
    if (st) {
      await admin.from("crm_students").update({ profile_id: opts.userId, phone: opts.phone || undefined }).eq("id", st.id);
    } else {
      await admin.from("crm_students").insert({
        family_id: familyId,
        profile_id: opts.userId,
        name_ko: opts.name,
        phone: opts.phone || null,
        email: opts.email,
        status: "lead",
      });
    }
  }
  return {};
}

