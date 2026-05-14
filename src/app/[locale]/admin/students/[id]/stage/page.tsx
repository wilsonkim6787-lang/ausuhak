// Tab 2: 진행 단계 (Stage 12 시각화 + 변경)
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StageEditor from "./StageEditor";

export default async function StagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, current_stage, lead_status, graduated_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return (
    <StageEditor
      studentId={data.id}
      currentStage={data.current_stage}
      leadStatus={data.lead_status}
      graduatedAt={data.graduated_at}
      updatedAt={data.updated_at}
    />
  );
}
