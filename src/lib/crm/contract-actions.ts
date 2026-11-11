"use server";
// Server actions for 유학 수속 계약서.
// Admin actions go through requireAdmin() and the RLS admin policy.
// A family member's agreement is checked here and written with the service role:
// families have no write policy on crm_contracts.
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin, requireFamily } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { fdDate, fdId, fdStr, isUuid, pick, todayKST } from "./admin-util";
import {
  COMPANY,
  SCOPE_TYPES,
  TASKS,
  TERMS_SOURCE,
  TERMS_VERSION,
  VISA_LABELS,
  buildChecks,
  buildSpecial,
  isMinor,
  type ContractSnapshot,
  type FeeRow,
} from "./contract";
import type { ActionResult } from "@/components/admin/client";

const FAIL: ActionResult = { error: "저장하지 못했습니다. 다시 시도해 주세요." };
const NO_TABLE: ActionResult = { error: "계약서 저장 공간이 아직 만들어지지 않았습니다. DB에 107_contracts.sql을 먼저 실행해 주세요." };

// "500,000" / "500000" / "" -> number | null. Rejects anything else.
function fdWon(fd: FormData, key: string): number | null | undefined {
  const raw = fdStr(fd, key, 20).replace(/[,\s원]/g, "");
  if (!raw) return null;
  if (!/^\d{1,9}$/.test(raw)) return undefined;
  return Number(raw);
}

// ---------- admin: make and send a contract ----------
export async function createContract(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const studentId = fdId(fd, "student_id");
  if (!studentId) return FAIL;
  const { data: st } = await sb.from("crm_students").select("id, family_id, name_ko, birth_date").eq("id", studentId).maybeSingle();
  if (!st) return FAIL;

  const base = fdWon(fd, "fee_base");
  const extra = fdWon(fd, "fee_extra");
  const visa = fdWon(fd, "fee_visa");
  if (base === undefined || extra === undefined || visa === undefined) return { error: "금액은 숫자로만 넣어 주세요." };
  if (base === null) return { error: "기본 수속대행료를 넣어 주세요. 받지 않으면 0을 넣습니다." };

  const signerName = fdStr(fd, "signer_name", 40);
  const signerRelation = fdStr(fd, "signer_relation", 20);
  if (!signerName) return { error: "동의받을 분의 성함을 넣어 주세요." };

  const minor = isMinor(st.birth_date as string | null, todayKST());
  const signerRole = minor ? "parent" : pick(fdStr(fd, "signer_role", 10), ["student", "parent"] as const, "student");
  const tasks = TASKS.filter((t) => fd.getAll("tasks").includes(t));
  if (!tasks.length) return { error: "맡는 일을 하나 이상 골라 주세요." };

  const fees: FeeRow[] = [{ label: "기본 수속대행료", desc: "상담, 입학 지원(3개교 이내), 출국 준비 안내", amount: base }];
  if (extra !== null) fees.push({ label: "추가 수속대행료", desc: "지원 학교 추가", amount: extra, unit: "1개교당" });
  const visaIncluded = visa !== null;
  if (visa !== null) fees.push({ label: pick(fdStr(fd, "visa_label", 20), VISA_LABELS, "비자 수속료"), desc: "서류 점검, 신청서 작성과 접수", amount: visa });
  const total = base + (visa ?? 0);

  const snapshot: ContractSnapshot = {
    termsVersion: TERMS_VERSION,
    termsSource: TERMS_SOURCE,
    company: COMPANY,
    student: { name: st.name_ko as string, birth: (st.birth_date as string | null) ?? null, minor },
    signer: { role: signerRole, name: signerName, relation: signerRelation || (signerRole === "parent" ? "보호자" : "학생 본인") },
    scopeType: pick(fdStr(fd, "scope_type", 10), SCOPE_TYPES, "일괄수속"),
    intake: fdStr(fd, "intake", 30),
    tasks: [...tasks],
    fees,
    total,
    visaIncluded,
    special: buildSpecial(visaIncluded),
    checks: buildChecks(total, visaIncluded),
  };

  const { data: last, error: lastErr } = await sb.from("crm_contracts").select("version").eq("student_id", studentId).order("version", { ascending: false }).limit(1);
  if (lastErr) return NO_TABLE;
  // A new contract replaces any that is still waiting for consent.
  await sb.from("crm_contracts").update({ status: "cancelled" }).eq("student_id", studentId).eq("status", "sent");
  const { error } = await sb.from("crm_contracts").insert({
    student_id: studentId,
    family_id: st.family_id,
    version: ((last?.[0]?.version as number | undefined) ?? 0) + 1,
    signer_role: signerRole,
    total_amount: total,
    snapshot,
  });
  if (error) return FAIL;
  revalidatePath("/admin", "layout");
  return { ok: "계약서를 보냈습니다. 마이페이지에 바로 표시됩니다." };
}

export async function cancelContract(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  await sb.from("crm_contracts").update({ status: "cancelled" }).eq("id", id).eq("status", "sent");
  revalidatePath("/admin", "layout");
}

// Consent received outside the site (KakaoTalk or email reply), with the proof file
// already uploaded to crm-docs/<family>/<student>/ by the admin's browser.
export async function recordOfflineConsent(fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  const channel = pick(fdStr(fd, "channel", 10), ["kakao", "email"] as const, "kakao");
  const name = fdStr(fd, "agreed_name", 40);
  const date = fdDate(fd, "agreed_date");
  const path = fdStr(fd, "path", 500);
  const note = fdStr(fd, "note", 500);
  if (!id || !name || !date) return { error: "동의한 분의 성함과 날짜를 넣어 주세요." };
  const { data: c } = await sb.from("crm_contracts").select("id, family_id, student_id, status, snapshot").eq("id", id).maybeSingle();
  if (!c || c.status !== "sent") return { error: "동의 대기 중인 계약서가 아닙니다." };
  if (!path || path.includes("..") || !path.startsWith(`${c.family_id}/${c.student_id}/`)) return { error: "받은 답장의 캡처나 메일 파일을 올려 주세요." };
  const snap = c.snapshot as ContractSnapshot;
  const { error } = await sb
    .from("crm_contracts")
    .update({
      status: "agreed",
      agreed_at: new Date(`${date}T12:00:00+09:00`).toISOString(),
      agreed_name: name,
      agreed_relation: snap.signer.relation,
      channel,
      evidence_path: path,
      evidence_note: note || null,
    })
    .eq("id", id)
    .eq("status", "sent");
  if (error) return FAIL;
  revalidatePath("/admin", "layout");
  return { ok: "동의 기록을 저장했습니다." };
}

// ---------- family: agree on the site ----------
export type AgreeState = { error?: string; ok?: boolean } | undefined;

export async function agreeContract(_: AgreeState, fd: FormData): Promise<AgreeState> {
  const { user, profile } = await requireFamily();
  const id = fdStr(fd, "id", 40);
  const name = fdStr(fd, "name", 40);
  if (!isUuid(id)) return { error: "계약서를 찾지 못했습니다. 마이페이지에서 다시 열어 주세요." };
  const admin = adminClient();
  if (!admin) return { error: "지금은 동의를 저장할 수 없습니다. 잠시 후 다시 해 주세요." };

  const { data: c } = await admin.from("crm_contracts").select("id, family_id, student_id, status, signer_role, snapshot").eq("id", id).maybeSingle();
  if (!c || c.family_id !== profile.family_id) return { error: "계약서를 찾지 못했습니다. 마이페이지에서 다시 열어 주세요." };
  if (c.status === "agreed") return { ok: true };
  if (c.status !== "sent") return { error: "이 계약서는 새 계약서로 바뀌었습니다. 마이페이지에서 다시 열어 주세요." };

  const snap = c.snapshot as ContractSnapshot;
  // A minor never signs: only a parent account may agree. An adult student signs for themselves.
  if (snap.student.minor || c.signer_role === "parent") {
    if (profile.role !== "parent") return { error: "이 계약서는 보호자 계정으로 로그인해서 동의해 주세요." };
  } else {
    const { data: st } = await admin.from("crm_students").select("profile_id").eq("id", c.student_id).maybeSingle();
    if (profile.role !== "student" || (st?.profile_id && st.profile_id !== user.id)) return { error: "이 계약서는 학생 본인 계정으로 로그인해서 동의해 주세요." };
  }

  const ticked = fd.getAll("check").map(String);
  if (snap.checks.some((_, i) => !ticked.includes(String(i)))) return { error: "확인 항목을 모두 체크해 주세요." };
  if (!name) return { error: "성함을 입력해 주세요." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim().slice(0, 60) || null;
  const { data: done, error } = await admin
    .from("crm_contracts")
    .update({
      status: "agreed",
      agreed_at: new Date().toISOString(),
      agreed_by: user.id,
      agreed_name: name,
      agreed_relation: profile.relation || (profile.role === "parent" ? "보호자" : "학생 본인"),
      agreed_ip: ip,
      agreed_ua: (h.get("user-agent") ?? "").slice(0, 300) || null,
      channel: "site",
    })
    .eq("id", id)
    .eq("status", "sent")
    .select("id");
  if (error || !done?.length) return { error: "동의를 저장하지 못했습니다. 잠시 후 다시 해 주세요." };
  revalidatePath("/mypage", "layout");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
