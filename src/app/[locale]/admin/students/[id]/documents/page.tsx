// Tab 5: 서류 체크리스트 (8 doc types)
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DocumentsPanel, { type DocRow } from "./DocumentsPanel";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const [studentRes, docsRes] = await Promise.all([
    supabase.from("students").select("id").eq("id", id).single(),
    supabase
      .from("documents")
      .select("id, doc_type, file_url, storage_path, mime_type, size_bytes, original_filename, status, note, created_at")
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (studentRes.error || !studentRes.data) notFound();

  return <DocumentsPanel studentId={id} docs={(docsRes.data ?? []) as DocRow[]} />;
}
