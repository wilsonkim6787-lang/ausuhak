// Tab 3: 메모 (PART E-4 / PART 0-4 3중 보안 핵심)
// 🟡 shared_with_assigned + 🔴 wilson_only 두 종류
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NotesPanel from "./NotesPanel";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: student, error: sErr }, { data: notes, error: nErr }] =
    await Promise.all([
      supabase.from("students").select("id").eq("id", id).single(),
      supabase
        .from("student_notes")
        .select("id, visibility, content, tags, created_at, hidden_at, author_id")
        .eq("student_id", id)
        .is("hidden_at", null)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

  if (sErr || !student) notFound();
  if (nErr) {
    return (
      <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm text-error">
        메모 로드 실패: {nErr.message}
      </div>
    );
  }

  return <NotesPanel studentId={id} notes={notes ?? []} />;
}
