"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { canEditStudent } from "@/lib/auth/canEditStudent";
import { getCurrentUser } from "@/lib/auth/getUser";
import { logActivity } from "@/lib/audit/log";
import {
  ALL_SUBSTEPS,
  buildStatusMap,
  deriveCurrentStage,
  VALID_SUBSTEP_KEYS,
} from "@/lib/progress";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CommandState = { ok?: string; error?: string };

type StageAction = {
  stage_key: string;
  label: string;
  target_substep: string | null;
  mypage_text: string | null;
  kakao_message: string | null;
  required_documents: string[] | null;
};

// 명령어 → 단계 키워드 (자연어 인식). 비자: 신청 vs 승인 구분.
const STAGE_KEYWORDS: Record<string, string[]> = {
  visa_granted: ["비자 승인", "비자승인", "비자 나왔", "비자 받", "grant"],
  visa_submitted: ["비자 신청", "비자신청", "비자 접수", "비자 넣"],
  quote_sent: ["견적"],
  apply_done: ["학교 지원", "원서 접수", "지원 완료", "지원했", "지원함"],
  offer_received: ["오퍼", "offer", "합격증", "합격 통보"],
  coe_issued: ["coe", "씨오이", "입학허가"],
  departed: ["도착", "출국"],
};

function render(msg: string | null, name: string): string {
  return (msg ?? "").replace(/\{name\}/g, name || "학생");
}

// 명령어 텍스트 → { studentId, stageKey } 인식
function parseCommand(
  text: string,
  students: { id: string; name: string | null }[],
  actions: StageAction[],
): { studentId?: string; studentName?: string; stageKey?: string; error?: string } {
  const t = text.trim();
  if (!t) return { error: "명령어를 입력하세요. 예: 김민지 비자 신청" };
  const lower = t.toLowerCase();

  // 학생: 이름이 명령어에 포함된 학생 (가장 긴 이름 우선)
  const matchedStudents = students
    .filter((s) => s.name && s.name.trim() && t.includes(s.name.trim()))
    .sort((a, b) => (b.name?.length ?? 0) - (a.name?.length ?? 0));
  if (matchedStudents.length === 0)
    return { error: "학생 이름을 인식하지 못했어요. 명령어에 학생 이름을 정확히 넣어주세요." };

  const student = matchedStudents[0];

  // 단계: 키워드 매칭 (정의 순서 = 우선순위, 비자 승인이 신청보다 먼저 체크됨)
  const validKeys = new Set(actions.map((a) => a.stage_key));
  let stageKey: string | undefined;
  for (const [key, kws] of Object.entries(STAGE_KEYWORDS)) {
    if (!validKeys.has(key)) continue;
    if (kws.some((kw) => lower.includes(kw.toLowerCase()))) {
      stageKey = key;
      break;
    }
  }
  if (!stageKey)
    return {
      studentId: student.id,
      studentName: student.name ?? "",
      error: `'${student.name}' 학생은 인식했는데 단계를 못 잡았어요. (견적/학교지원/오퍼/CoE/비자 신청/비자 승인/도착 중 하나를 포함해 주세요)`,
    };

  return { studentId: student.id, studentName: student.name ?? "", stageKey };
}

// 단계 적용 핵심 (구조화·명령어 공용): 앞 단계까지 따라잡기 + current_stage + 서류요청 + 알림.
async function applyStageToStudent(
  admin: SupabaseClient,
  studentId: string,
  action: StageAction,
  userId: string,
): Promise<CommandState> {
  const { data: student } = await admin
    .from("students")
    .select("id, name, current_stage")
    .eq("id", studentId)
    .single();
  if (!student) return { error: "학생을 찾을 수 없습니다." };

  // 단계 정의가 깨져 있으면(오타 substep) 아무것도 안 바뀐 채
  // "반영 완료" + 카톡 대기가 생기던 버그 → 명시적 에러로 중단.
  if (action.target_substep && !VALID_SUBSTEP_KEYS.has(action.target_substep)) {
    return {
      error: `단계 정의 오류: '${action.target_substep}' 는 유효한 sub-step 이 아닙니다 (stage_actions 데이터 확인 필요).`,
    };
  }

  // 1) 선택 단계 + 그 앞 단계 전부 done → current_stage 재산출
  if (action.target_substep) {
    const targetIdx = ALL_SUBSTEPS.findIndex((s) => s.key === action.target_substep);
    const nowIso = new Date().toISOString();
    const toMark = ALL_SUBSTEPS.slice(0, targetIdx + 1).map((s) => ({
      student_id: studentId,
      substep_key: s.key,
      status: "done",
      updated_by: userId,
      updated_at: nowIso,
    }));
    const up = await admin
      .from("student_substeps")
      .upsert(toMark, { onConflict: "student_id,substep_key" });
    if (up.error) return { error: `단계 반영 실패: ${up.error.message}` };

    const { data: rows } = await admin
      .from("student_substeps")
      .select("substep_key, status")
      .eq("student_id", studentId);
    const statusMap = buildStatusMap(rows ?? [], student.current_stage ?? 1);
    const nextStage = deriveCurrentStage(statusMap);
    // stage 가 안 변해도 updated_at 갱신 — 케어룰·정렬 오탐 방지 (progressActions 와 동일)
    await admin
      .from("students")
      .update({ current_stage: nextStage, updated_at: nowIso })
      .eq("id", studentId);
  }

  // 2) required_documents → status "requested"(요청됨)
  const reqDocs = Array.isArray(action.required_documents) ? action.required_documents : [];
  if (reqDocs.length > 0) {
    const { data: existing } = await admin
      .from("documents")
      .select("doc_type")
      .eq("student_id", studentId);
    const have = new Set((existing ?? []).map((d: { doc_type: string }) => d.doc_type));
    const toInsert = reqDocs
      .filter((dt) => !have.has(dt))
      .map((dt) => ({ student_id: studentId, doc_type: dt, status: "requested" }));
    if (toInsert.length > 0) await admin.from("documents").insert(toInsert);
  }

  // 3) 반영 성공 후에만 카톡 발송 대기 알림 생성
  const message = render(action.kakao_message, student.name ?? "");
  const notif = await admin.from("notifications").insert({
    student_id: studentId,
    channel: "kakao_manual",
    stage_key: action.stage_key,
    message,
    status: "pending",
    created_by: userId,
  });
  if (notif.error) return { error: `반영은 됐지만 알림 생성 실패: ${notif.error.message}` };

  await logActivity({
    action_type: "update_substep",
    target_table: "students",
    target_id: studentId,
    details: { command: action.stage_key, label: action.label },
  });

  revalidatePath("/admin/command");
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  revalidatePath("/mypage");

  return { ok: `${student.name ?? "학생"} · ${action.label} 반영 완료 → 마이페이지 즉시 반영, 카톡 발송 대기에 추가됨.` };
}

// ── 명령어 한 줄 입력 (기본) ──
export async function applyTextCommand(
  _prev: CommandState,
  formData: FormData,
): Promise<CommandState> {
  // 권한 확인 먼저 — 이전엔 인증 없이 service-role 로 학생 이름을 조회·노출한 뒤
  // parseCommand 에러(학생명 포함)를 그대로 반환했음.
  const caller = await getCurrentUser();
  if (!caller || (caller.role !== "super_admin" && caller.role !== "staff")) {
    return { error: "권한이 없습니다." };
  }

  const text = String(formData.get("command") ?? "");
  const admin = createAdminClient();

  const [studentsRes, actionsRes] = await Promise.all([
    admin.from("students").select("id, name").limit(2000),
    admin
      .from("stage_actions")
      .select("stage_key, label, target_substep, mypage_text, kakao_message, required_documents"),
  ]);
  const students = studentsRes.data ?? [];
  const actions = (actionsRes.data ?? []) as StageAction[];

  const parsed = parseCommand(text, students, actions);
  if (parsed.error) return { error: parsed.error };

  const { ok, user } = await canEditStudent(parsed.studentId!);
  if (!ok || !user) return { error: "권한이 없습니다." };

  const action = actions.find((a) => a.stage_key === parsed.stageKey);
  if (!action) return { error: "단계 정의를 찾을 수 없습니다." };

  return applyStageToStudent(admin, parsed.studentId!, action, user.id);
}

// ── 구조화 입력 (fallback: 드롭다운) ──
export async function applyStageCommand(
  _prev: CommandState,
  formData: FormData,
): Promise<CommandState> {
  const studentId = String(formData.get("student_id") ?? "");
  const stageKey = String(formData.get("stage_key") ?? "");
  if (!studentId || !stageKey) return { error: "학생과 단계를 선택하세요." };

  const { ok, user } = await canEditStudent(studentId);
  if (!ok || !user) return { error: "권한이 없습니다." };

  const admin = createAdminClient();
  const { data: action } = await admin
    .from("stage_actions")
    .select("stage_key, label, target_substep, mypage_text, kakao_message, required_documents")
    .eq("stage_key", stageKey)
    .single();
  if (!action) return { error: "단계 정의를 찾을 수 없습니다." };

  return applyStageToStudent(admin, studentId, action as StageAction, user.id);
}

// 카톡 수동 발송 완료 표시 (B)
export async function markNotificationSent(formData: FormData): Promise<void> {
  const id = String(formData.get("notification_id") ?? "");
  if (!id) return;
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return;

  const admin = createAdminClient();
  await admin
    .from("notifications")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/command");
}
