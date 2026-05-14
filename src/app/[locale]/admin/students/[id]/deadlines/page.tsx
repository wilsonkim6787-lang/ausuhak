// Tab 6: 마감일 (Critical Deadlines)
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeadlinesPanel, { type DeadlineRow } from "./DeadlinesPanel";

export default async function DeadlinesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const [studentRes, deadlinesRes] = await Promise.all([
    supabase.from("students").select("id").eq("id", id).single(),
    supabase
      .from("critical_deadlines")
      .select("id, deadline_type, deadline_date, status, note, created_at")
      .eq("student_id", id)
      .order("deadline_date", { ascending: true }),
  ]);

  if (studentRes.error || !studentRes.data) notFound();

  return (
    <DeadlinesPanel studentId={id} deadlines={(deadlinesRes.data ?? []) as DeadlineRow[]} />
  );
}
