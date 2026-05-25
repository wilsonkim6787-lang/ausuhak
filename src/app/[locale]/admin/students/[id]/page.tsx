// Tab 1 (default): 기본 정보 + 진행 단계 (통합).
// /stage 라우트는 별도 폼이었으나 사용 빈도 높아 같은 화면에 묶음.

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BasicInfoForm from "./BasicInfoForm";
import StageEditor from "./stage/StageEditor";

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
      "id, name, kakao_id, phone, email, age, age_range, education, english_level, preferred_region, major, budget_range, is_medical, medical_pathway, source, anonymous_id, diagnose_uuid, scenario_matched, partner_ref, photo_path, current_stage, lead_status, graduated_at, created_at, updated_at",
    )
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return (
    <div className="flex flex-col gap-8">
      <BasicInfoForm student={data} />

      <div className="border-t border-cream-300 pt-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gold-600">
          진행 단계
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-navy-900">
          🎯 Stage · Lead Status
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          매일 가장 자주 바꾸는 항목 — 기본 정보와 같은 화면에서 즉시 변경.
        </p>
      </div>

      <StageEditor
        studentId={data.id}
        currentStage={data.current_stage}
        leadStatus={data.lead_status}
        graduatedAt={data.graduated_at}
        updatedAt={data.updated_at}
      />
    </div>
  );
}
