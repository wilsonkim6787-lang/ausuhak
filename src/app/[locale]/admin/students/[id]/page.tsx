// Tab 1 (default): 기본 정보 + 진행 단계 (sub-step 제어) + Lead Status.
// 진행 모델 = src/lib/progress.ts (학생 마이페이지와 공용). current_stage 는 sub-step 에서 자동 산출.

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BasicInfoForm from "./BasicInfoForm";
import ProgressControl, { type AdminDocItem } from "./ProgressControl";
import LeadStatusForm from "./LeadStatusForm";
import { buildStatusMap, isStaffDocType } from "@/lib/progress";

type SubstepRow = { substep_key: string; status: string };
type DocRow = {
  id: string;
  doc_type: string;
  substep_key: string | null;
  storage_path: string | null;
  file_url: string | null;
  original_filename: string | null;
};

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

  const [subsRes, docsRes] = await Promise.all([
    supabase.from("student_substeps").select("substep_key, status").eq("student_id", id),
    supabase
      .from("documents")
      .select("id, doc_type, substep_key, storage_path, file_url, original_filename")
      .eq("student_id", id),
  ]);

  const statusMap = buildStatusMap(
    (subsRes.data ?? []) as SubstepRow[],
    data.current_stage,
  );

  const docsBySubstep: Record<string, AdminDocItem[]> = {};
  for (const d of (docsRes.data ?? []) as DocRow[]) {
    const staff = isStaffDocType(d.doc_type);
    const key = d.substep_key ?? (staff ? null : "a_docs");
    if (!key) continue;
    (docsBySubstep[key] ??= []).push({
      id: d.id,
      doc_type: d.doc_type,
      original_filename: d.original_filename,
      hasFile: Boolean(d.storage_path || d.file_url),
      isStaff: staff,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <BasicInfoForm student={data} />

      <div className="border-t border-cream-300 pt-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gold-600">
          진행 단계
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-navy-900">
          🎯 진행 모델 · Lead Status
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          sub-step 상태를 바꾸면 학생 마이페이지와 Stage(current_stage)가 자동으로 반영됩니다.
        </p>
      </div>

      <ProgressControl studentId={data.id} statusMap={statusMap} docsBySubstep={docsBySubstep} />

      <LeadStatusForm studentId={data.id} leadStatus={data.lead_status} />
    </div>
  );
}
