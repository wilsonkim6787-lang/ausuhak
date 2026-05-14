// Tab 4: 학교 지원 (다중)
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ApplicationsPanel from "./ApplicationsPanel";

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const [studentRes, appsRes, schoolsRes] = await Promise.all([
    supabase.from("students").select("id").eq("id", id).single(),
    supabase
      .from("school_applications")
      .select("id, school_id, program, status, applied_at, offer_received_at, notes, created_at, schools(name, city, state)")
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("schools")
      .select("id, name, type, city")
      .eq("status", "active")
      .order("name")
      .limit(500),
  ]);

  if (studentRes.error || !studentRes.data) notFound();

  return (
    <ApplicationsPanel
      studentId={id}
      applications={(appsRes.data ?? []) as never[]}
      schools={(schoolsRes.data ?? []) as never[]}
    />
  );
}
