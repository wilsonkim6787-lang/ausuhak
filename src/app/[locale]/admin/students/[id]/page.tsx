// Tab 1: 기본 정보 (default tab) — view + edit
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BasicInfoForm from "./BasicInfoForm";

export default async function StudentBasicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      "id, name, kakao_id, phone, email, age, age_range, education, english_level, preferred_region, major, budget_range, is_medical, medical_pathway, source, anonymous_id, diagnose_uuid, scenario_matched, partner_ref, created_at, updated_at",
    )
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return <BasicInfoForm student={data} />;
}
