import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type Profile = {
  id: string;
  role: "admin" | "student" | "parent";
  family_id: string | null;
  name: string;
  phone: string | null;
  relation: string | null;
};

export const getSession = cache(async () => {
  const sb = await createClient();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { sb, user: null, profile: null as Profile | null };
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { sb, user: null, profile: null as Profile | null };
  const { data } = await sb.from("crm_profiles").select("id, role, family_id, name, phone, relation").eq("id", user.id).maybeSingle();
  return { sb, user, profile: (data as Profile) ?? null };
});

export async function requireAdmin() {
  const s = await getSession();
  if (!s.user) redirect("/login?next=/admin");
  if (s.profile?.role !== "admin") redirect("/mypage");
  return s as typeof s & { profile: Profile };
}

export async function requireFamily() {
  const s = await getSession();
  if (!s.user) redirect("/login?next=/mypage");
  if (s.profile?.role === "admin") redirect("/admin");
  if (!s.profile?.family_id) redirect("/signup/complete");
  return s as typeof s & { profile: Profile & { family_id: string } };
}
