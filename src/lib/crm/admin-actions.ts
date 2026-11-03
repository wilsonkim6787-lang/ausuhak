"use server";
// Server actions for the admin intranet. Every action calls requireAdmin();
// the Supabase client it returns is RLS-scoped (admin policies allow writes).
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createCase, createFamilyStudent } from "./admin-ops";
import {
  EDUCATION,
  FORM_1229_LABEL,
  UNDER14_LABEL,
  WELFARE_ITEMS,
  WELFARE_PHASE,
  ageOn,
  todayKST,
  fdDate,
  fdId,
  fdOpt,
  fdStr,
  isUuid,
  pick,
} from "./admin-util";
import { formatCode } from "./account";
import { fileEmailAttachment, syncGmail } from "./gmail";
import type { Service } from "./flows";
import type { ActionResult } from "@/components/admin/client";

const SERVICES = ["study", "language", "visa", "other"] as const;
const CASE_STATUS = ["active", "done", "hold", "cancelled"] as const;
const STUDENT_STATUS = ["lead", "active", "done", "hold", "cancelled"] as const;
const STEP_STATES = ["todo", "doing", "done", "skip"] as const;
const DOC_STATES = ["requested", "received", "reviewing", "ok", "redo"] as const;
const FEE_KINDS = ["charge", "payment", "commission", "external"] as const;
const CURRENCIES = ["KRW", "AUD", "USD", "PHP"] as const;
const ENROL = ["planned", "applied", "conditional", "unconditional", "accepted", "coe", "withdrawn", "rejected"] as const;

function refresh() {
  revalidatePath("/admin", "layout");
}

const FAIL: ActionResult = { error: "저장하지 못했습니다. 다시 시도해 주세요." };

// ---------- notes ----------
export async function addNote(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const body = fdStr(fd, "body", 4000);
  if (!body) return { error: "메모 내용을 넣어 주세요." };
  const raw = fdStr(fd, "student_id", 40);
  const studentId = raw ? (isUuid(raw) ? raw : undefined) : null;
  if (studentId === undefined) return FAIL;
  const { error } = await sb.from("crm_notes").insert({ student_id: studentId, body, pinned: fd.get("pinned") === "on" });
  if (error) return FAIL;
  refresh();
  return { ok: "저장했습니다." };
}

export async function deleteNote(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  await sb.from("crm_notes").delete().eq("id", id);
  refresh();
}

export async function toggleNotePin(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  await sb.from("crm_notes").update({ pinned: fd.get("pinned") === "1" }).eq("id", id);
  refresh();
}

// Dashboard checkbox: a step becomes done, a requested document becomes received.
export async function completeTask(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  if (fd.get("kind") === "doc") {
    await sb.from("crm_documents").update({ state: "received" }).eq("id", id);
  } else {
    await sb.from("crm_steps").update({ state: "done", done_at: new Date().toISOString() }).eq("id", id);
  }
  refresh();
}

// ---------- students ----------
function studentFields(fd: FormData) {
  const edu = fdStr(fd, "education", 40);
  return {
    name_ko: fdStr(fd, "name_ko", 80),
    name_en: fdOpt(fd, "name_en", 120),
    phone: fdOpt(fd, "phone", 40),
    email: fdOpt(fd, "email", 200),
    kakao_id: fdOpt(fd, "kakao_id", 80),
    birth_date: fdDate(fd, "birth_date"),
    education: edu ? (EDUCATION.includes(edu) ? edu : edu.slice(0, 40)) : null,
  };
}

export async function addStudent(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const f = studentFields(fd);
  if (!f.name_ko) return { error: "학생 이름을 넣어 주세요." };
  const r = await createFamilyStudent(sb, { ...f, status: "active" });
  if ("error" in r) return { error: r.error };
  const svc = fdStr(fd, "service", 20);
  if (svc) {
    const service = pick(svc, SERVICES, "other");
    const title = fdStr(fd, "case_title", 200) || `${f.name_ko} ${service === "study" ? "진학" : service === "language" ? "어학연수" : service === "visa" ? "비자" : "기타"}`;
    await createCase(sb, r.studentId, service, title);
  }
  refresh();
  return { ok: `${f.name_ko} 학생을 추가했습니다.`, code: formatCode(r.code), studentId: r.studentId };
}

export async function updateStudent(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return FAIL;
  const f = studentFields(fd);
  if (!f.name_ko) return { error: "학생 이름을 넣어 주세요." };
  const welfare = fdStr(fd, "welfare_type", 20);
  const { error } = await sb
    .from("crm_students")
    .update({
      ...f,
      status: pick(fdStr(fd, "status", 20), STUDENT_STATUS, "active"),
      welfare_type: welfare === "caaw" || welfare === "parent_590" || welfare === "relative" ? welfare : null,
      form_1229_received: fd.get("form_1229_received") === "on",
      under14_consent_received: fd.get("under14_consent_received") === "on",
    })
    .eq("id", id);
  if (error) return FAIL;
  refresh();
  return { ok: "저장했습니다." };
}

// ---------- cases ----------
export async function addCase(fd: FormData) {
  const { sb } = await requireAdmin();
  const studentId = fdId(fd, "student_id");
  if (!studentId) return;
  const service = pick(fdStr(fd, "service", 20), SERVICES, "other") as Service;
  const title = fdStr(fd, "title", 200);
  if (!title) return;
  const extra: Record<string, unknown> = {};
  if (service === "visa") {
    extra.visa_subclass = fdOpt(fd, "visa_subclass", 10);
    const linked = fdId(fd, "linked_case_id");
    if (linked) extra.linked_case_id = linked;
  }
  extra.intake = fdOpt(fd, "intake", 20);
  const id = await createCase(sb, studentId, service, title, extra);
  refresh();
  redirect(`/admin/students/${studentId}${id ? `?case=${id}` : ""}`);
}

export async function updateCase(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return FAIL;
  const title = fdStr(fd, "title", 200);
  if (!title) return { error: "진행 건 이름을 넣어 주세요." };
  const patch: Record<string, unknown> = {
    title,
    status: pick(fdStr(fd, "status", 20), CASE_STATUS, "active"),
    intake: fdOpt(fd, "intake", 20),
  };
  if (fd.get("is_visa") === "1") {
    const linked = fdId(fd, "linked_case_id");
    if (linked === id) return { error: "자기 자신과는 연결할 수 없습니다." };
    Object.assign(patch, {
      visa_subclass: fdOpt(fd, "visa_subclass", 10),
      linked_case_id: linked,
      trn: fdOpt(fd, "trn", 40),
      lodged_at: fdDate(fd, "lodged_at"),
      granted_at: fdDate(fd, "granted_at"),
      expected_expiry: fdDate(fd, "expected_expiry"),
      oshc_until: fdDate(fd, "oshc_until"),
      form_956a: fd.get("form_956a") === "on",
    });
  }
  const { error } = await sb.from("crm_cases").update(patch).eq("id", id);
  if (error) return FAIL;
  refresh();
  return { ok: "저장했습니다." };
}

export async function saveExpiry(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  const date = fdDate(fd, "date");
  if (!id || !date) return;
  await sb.from("crm_cases").update({ expected_expiry: date }).eq("id", id);
  refresh();
}

export async function deleteCase(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  const studentId = fdId(fd, "student_id");
  if (!id) return;
  await sb.from("crm_cases").delete().eq("id", id);
  refresh();
  if (studentId) redirect(`/admin/students/${studentId}`);
}

// ---------- steps ----------
const NEXT_STATE: Record<string, string> = { todo: "doing", doing: "done", done: "todo", skip: "todo" };

export async function cycleStep(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  const { data } = await sb.from("crm_steps").select("state").eq("id", id).maybeSingle();
  if (!data) return;
  const next = NEXT_STATE[data.state as string] ?? "todo";
  await sb.from("crm_steps").update({ state: next, done_at: next === "done" ? new Date().toISOString() : null }).eq("id", id);
  refresh();
}

export async function updateStep(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  const label = fdStr(fd, "label", 120);
  if (!id || !label) return;
  const state = pick(fdStr(fd, "state", 10), STEP_STATES, "todo");
  await sb
    .from("crm_steps")
    .update({
      label,
      phase: fdStr(fd, "phase", 40),
      due_date: fdDate(fd, "due_date"),
      state,
      student_note: fdOpt(fd, "student_note", 1000),
      done_at: state === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  refresh();
}

export async function addStep(fd: FormData) {
  const { sb } = await requireAdmin();
  const caseId = fdId(fd, "case_id");
  const label = fdStr(fd, "label", 120);
  if (!caseId || !label) return;
  const phase = fdStr(fd, "phase", 40);
  const { data: rows } = await sb.from("crm_steps").select("seq, phase").eq("case_id", caseId).order("seq");
  const list = (rows ?? []) as { seq: number; phase: string }[];
  // Put the new step at the end of its phase.
  const inPhase = list.filter((r) => r.phase === phase);
  const seq = inPhase.length ? inPhase[inPhase.length - 1].seq + 1 : (list.length ? list[list.length - 1].seq : 0) + 10;
  await sb.from("crm_steps").insert({ case_id: caseId, seq, phase, label, due_date: fdDate(fd, "due_date"), state: "todo" });
  refresh();
}

export async function deleteStep(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  await sb.from("crm_steps").delete().eq("id", id);
  refresh();
}

// ---------- enrolments ----------
function enrolFields(fd: FormData) {
  return {
    provider: fdStr(fd, "provider", 160),
    course: fdStr(fd, "course", 200),
    cricos_code: fdOpt(fd, "cricos_code", 20),
    start_date: fdDate(fd, "start_date"),
    end_date: fdDate(fd, "end_date"),
    offer_status: pick(fdStr(fd, "offer_status", 20), ENROL, "planned"),
    coe_no: fdOpt(fd, "coe_no", 40),
    seq: Math.max(1, Math.min(20, Number(fdStr(fd, "seq", 3)) || 1)),
  };
}

export async function addEnrolment(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const caseId = fdId(fd, "case_id");
  if (!caseId) return { error: "진행 건을 골라 주세요." };
  const f = enrolFields(fd);
  if (!f.provider || !f.course) return { error: "학교와 과정 이름을 넣어 주세요." };
  if (f.start_date && f.end_date && f.end_date < f.start_date) return { error: "종료일이 시작일보다 빠릅니다." };
  const { error } = await sb.from("crm_enrolments").insert({ case_id: caseId, ...f });
  if (error) return FAIL;
  refresh();
  return { ok: "추가했습니다." };
}

export async function updateEnrolment(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return FAIL;
  const f = enrolFields(fd);
  if (!f.provider || !f.course) return { error: "학교와 과정 이름을 넣어 주세요." };
  if (f.start_date && f.end_date && f.end_date < f.start_date) return { error: "종료일이 시작일보다 빠릅니다." };
  const { error } = await sb.from("crm_enrolments").update(f).eq("id", id);
  if (error) return FAIL;
  refresh();
  return { ok: "저장했습니다." };
}

export async function deleteEnrolment(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  await sb.from("crm_enrolments").delete().eq("id", id);
  refresh();
}

// ---------- documents ----------
export async function requestDoc(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const studentId = fdId(fd, "student_id");
  const label = fdStr(fd, "label", 160);
  if (!studentId) return FAIL;
  if (!label) return { error: "서류 이름을 넣어 주세요." };
  const { error } = await sb.from("crm_documents").insert({
    student_id: studentId,
    case_id: fdId(fd, "case_id"),
    direction: "from_family",
    label,
    state: "requested",
    due_date: fdDate(fd, "due_date"),
    note: fdOpt(fd, "note", 500),
    source: "admin",
  });
  if (error) return FAIL;
  refresh();
  return { ok: "요청 목록에 넣었습니다. 학생 마이페이지에 바로 보입니다." };
}

export async function setDocState(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  const state = pick(fdStr(fd, "state", 12), DOC_STATES, "received");
  await sb.from("crm_documents").update({ state }).eq("id", id);
  refresh();
}

export async function updateDoc(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  const label = fdStr(fd, "label", 160);
  if (!id || !label) return;
  await sb.from("crm_documents").update({ label, due_date: fdDate(fd, "due_date"), note: fdOpt(fd, "note", 500) }).eq("id", id);
  refresh();
}

export async function deleteDoc(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  const { data } = await sb.from("crm_documents").select("storage_path").eq("id", id).maybeSingle();
  if (data?.storage_path) await sb.storage.from("crm-docs").remove([data.storage_path as string]);
  await sb.from("crm_documents").delete().eq("id", id);
  refresh();
}

// Records a file Wilson uploaded for the family (the browser already put it in storage).
export async function recordUpload(fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const studentId = fdId(fd, "student_id");
  const path = fdStr(fd, "path", 500);
  const label = fdStr(fd, "label", 160);
  if (!studentId || !path || !label) return FAIL;
  const { data: st } = await sb.from("crm_students").select("id, family_id").eq("id", studentId).maybeSingle();
  if (!st) return FAIL;
  const prefix = `${st.family_id}/${st.id}/`;
  if (!path.startsWith(prefix) || path.includes("..")) return { error: "파일 위치가 맞지 않습니다." };
  const { error } = await sb.from("crm_documents").insert({
    student_id: st.id,
    case_id: fdId(fd, "case_id"),
    direction: "to_family",
    label,
    state: "ok",
    storage_path: path,
    file_name: fdStr(fd, "file_name", 200) || "file",
    source: "admin",
  });
  if (error) {
    await sb.storage.from("crm-docs").remove([path]);
    return FAIL;
  }
  refresh();
  return { ok: "올렸습니다. 학생 마이페이지에 바로 보입니다." };
}

// ---------- fees ----------
function feeFields(fd: FormData) {
  const amount = Number(fdStr(fd, "amount", 20).replace(/[,\s]/g, ""));
  return {
    label: fdStr(fd, "label", 160),
    kind: pick(fdStr(fd, "kind", 12), FEE_KINDS, "charge"),
    amount: isFinite(amount) ? Math.max(0, Math.min(amount, 9_999_999_999)) : NaN,
    currency: pick(fdStr(fd, "currency", 3), CURRENCIES, "KRW"),
    due_date: fdDate(fd, "due_date"),
    paid_at: fdDate(fd, "paid_at"),
    note: fdOpt(fd, "note", 300),
  };
}

export async function addFee(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const caseId = fdId(fd, "case_id");
  if (!caseId) return { error: "진행 건을 골라 주세요." };
  const f = feeFields(fd);
  if (!f.label) return { error: "항목 이름을 넣어 주세요." };
  if (isNaN(f.amount)) return { error: "금액을 숫자로 넣어 주세요." };
  const { error } = await sb.from("crm_fees").insert({ case_id: caseId, ...f });
  if (error) return FAIL;
  refresh();
  return { ok: "추가했습니다." };
}

export async function updateFee(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return FAIL;
  const f = feeFields(fd);
  if (!f.label) return { error: "항목 이름을 넣어 주세요." };
  if (isNaN(f.amount)) return { error: "금액을 숫자로 넣어 주세요." };
  const caseId = fdId(fd, "case_id");
  const { error } = await sb.from("crm_fees").update(caseId ? { ...f, case_id: caseId } : f).eq("id", id);
  if (error) return FAIL;
  refresh();
  return { ok: "저장했습니다." };
}

export async function deleteFee(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  await sb.from("crm_fees").delete().eq("id", id);
  refresh();
}

// ---------- messages ----------
export async function sendMessage(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb, user } = await requireAdmin();
  const familyId = fdId(fd, "family_id");
  const body = fdStr(fd, "body", 4000);
  if (!familyId) return FAIL;
  if (!body) return { error: "보낼 내용을 넣어 주세요." };
  const { error } = await sb.from("crm_messages").insert({
    family_id: familyId,
    author_id: user.id,
    from_admin: true,
    body,
    read_by_admin: true,
  });
  if (error) return { error: "보내지 못했습니다. 다시 시도해 주세요." };
  await sb.from("crm_messages").update({ read_by_admin: true }).eq("family_id", familyId).eq("read_by_admin", false);
  refresh();
  return { ok: "보냈습니다." };
}

export async function markRead(fd: FormData) {
  const { sb } = await requireAdmin();
  const familyId = fdId(fd, "family_id");
  if (!familyId) return;
  await sb.from("crm_messages").update({ read_by_admin: true }).eq("family_id", familyId).eq("read_by_admin", false);
  refresh();
}

// ---------- consult requests ----------
export async function setConsultStatus(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdStr(fd, "id", 60);
  if (!id) return;
  const status = pick(fdStr(fd, "status", 12), ["new", "contacted", "closed"] as const, "new");
  await sb.from("consult_requests").update({ status }).eq("id", id);
  refresh();
}

export async function saveConsultMemo(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const id = fdStr(fd, "id", 60);
  if (!id) return FAIL;
  const { error } = await sb.from("consult_requests").update({ admin_memo: fdOpt(fd, "admin_memo", 4000) }).eq("id", id);
  if (error) return FAIL;
  refresh();
  return { ok: "저장했습니다." };
}

export async function registerConsult(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdStr(fd, "id", 60);
  if (!id) return;
  const { data: c } = await sb.from("consult_requests").select("id, name, contact, student_id").eq("id", id).maybeSingle();
  if (!c) return;
  if (c.student_id && isUuid(c.student_id)) redirect(`/admin/students/${c.student_id}`);
  const contact = String(c.contact ?? "");
  const phone = /\d{2,}[\d\s-]{6,}/.test(contact) ? contact.slice(0, 40) : null;
  const email = /\S+@\S+\.\S+/.test(contact) ? (contact.match(/\S+@\S+\.\S+/)?.[0] ?? null) : null;
  const name = String(c.name ?? "").replace(/\(이름 미입력\)/, "").trim() || "이름 미정";
  const r = await createFamilyStudent(sb, {
    name_ko: name.slice(0, 80),
    phone: email ? null : phone,
    email,
    status: "lead",
    consult_request_id: isUuid(String(c.id)) ? String(c.id) : null,
  });
  if ("error" in r) return;
  await sb.from("consult_requests").update({ student_id: r.studentId, status: "contacted" }).eq("id", id);
  refresh();
  redirect(`/admin/students/${r.studentId}`);
}

// ---------- mail ----------
export async function syncMail() {
  await requireAdmin();
  let to = "/admin/mail?sync=err";
  try {
    const r = await syncGmail({ days: 14, max: 50 });
    to = r.ok ? `/admin/mail?sync=${r.added}` : `/admin/mail?sync=${r.error === "not_configured" ? "off" : "err"}`;
  } catch {
    to = "/admin/mail?sync=err";
  }
  refresh();
  redirect(to);
}

export async function fileAttachment(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const { sb } = await requireAdmin();
  const emailId = fdId(fd, "email_id");
  const studentId = fdId(fd, "student_id");
  const idx = Number(fdStr(fd, "index", 4));
  if (!emailId || !Number.isInteger(idx) || idx < 0) return FAIL;
  if (!studentId) return { error: "학생을 골라 주세요." };
  const kind = fdStr(fd, "kind", 200);
  // "req:<docId>" = attach to a document Wilson already requested from this student.
  let reqDoc: { id: string; label: string } | null = null;
  if (kind.startsWith("req:")) {
    const docId = kind.slice(4);
    if (isUuid(docId)) {
      const { data } = await sb.from("crm_documents").select("id, label, student_id").eq("id", docId).maybeSingle();
      if (data && data.student_id === studentId) reqDoc = { id: data.id as string, label: data.label as string };
    }
  }
  const label = reqDoc?.label || (kind && !kind.startsWith("req:") ? kind : "") || undefined;
  let r: { ok: true } | { ok: false; error: string };
  try {
    r = await fileEmailAttachment(emailId, idx, studentId, label);
  } catch {
    return { error: "메일에서 파일을 가져오지 못했습니다. 잠시 후 다시 해 주세요." };
  }
  if (!r.ok) return { error: r.error === "not_configured" ? "Gmail 연결이 아직 설정되지 않았습니다." : "서류함에 넣지 못했습니다. 다시 시도해 주세요." };
  if (reqDoc) {
    // Move the new file onto the requested document so the request shows as received.
    const { data: made } = await sb
      .from("crm_documents")
      .select("id, storage_path, file_name")
      .eq("inbound_email_id", emailId)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (made && made.id !== reqDoc.id) {
      const { error } = await sb
        .from("crm_documents")
        .update({ state: "received", storage_path: made.storage_path, file_name: made.file_name, source: "email", inbound_email_id: emailId })
        .eq("id", reqDoc.id);
      if (!error) await sb.from("crm_documents").delete().eq("id", made.id);
    }
  }
  refresh();
  return { ok: "서류함에 넣었습니다." };
}

export async function setEmailStatus(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "id");
  if (!id) return;
  const status = pick(fdStr(fd, "status", 10), ["new", "filed", "ignored"] as const, "new");
  await sb.from("crm_inbound_emails").update({ status }).eq("id", id);
  refresh();
}

// ---------- minors ----------
export async function setWelfare(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "student_id");
  const w = fdStr(fd, "welfare", 20);
  if (!id || !(w === "caaw" || w === "parent_590" || w === "relative")) return;
  await sb.from("crm_students").update({ welfare_type: w }).eq("id", id);
  refresh();
}

export async function toggleMinorFlag(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "student_id");
  const field = fdStr(fd, "field", 40);
  if (!id || (field !== "form_1229_received" && field !== "under14_consent_received")) return;
  await sb.from("crm_students").update({ [field]: fd.get("value") === "1" }).eq("id", id);
  refresh();
}

// Puts the checklist for the chosen welfare option into the student's records:
// family documents go to the request list, Wilson's tasks become steps of the chosen case.
export async function applyWelfareChecklist(fd: FormData) {
  const { sb } = await requireAdmin();
  const id = fdId(fd, "student_id");
  if (!id) return;
  const { data: st } = await sb
    .from("crm_students")
    .select("id, welfare_type, birth_date, form_1229_received, under14_consent_received")
    .eq("id", id)
    .maybeSingle();
  if (!st?.welfare_type) return;
  const items = WELFARE_ITEMS[st.welfare_type as string] ?? [];
  const docs = items.filter((i) => i.kind === "doc").map((i) => [i.label, i.note] as [string, string]);
  if (!st.form_1229_received) docs.unshift([FORM_1229_LABEL, "한 분만 가능하면 단독 친권 증빙"]);
  if (!st.under14_consent_received && st.birth_date && ageOn(st.birth_date as string, todayKST()) < 14) docs.push([UNDER14_LABEL, "만 14세 미만 학생만"]);
  const { data: have } = await sb.from("crm_documents").select("label").eq("student_id", id);
  const known = new Set((have ?? []).map((d) => d.label as string));
  const rows = docs
    .filter(([label]) => !known.has(label))
    .map(([label, note]) => ({ student_id: id, direction: "from_family", label, note: note || null, state: "requested", source: "admin" }));
  if (rows.length) await sb.from("crm_documents").insert(rows);

  const caseId = fdId(fd, "case_id");
  const tasks = items.filter((i) => i.kind === "task");
  if (caseId && tasks.length) {
    const { data: c } = await sb.from("crm_cases").select("id, student_id").eq("id", caseId).maybeSingle();
    if (c && c.student_id === id) {
      const { data: steps } = await sb.from("crm_steps").select("label, seq").eq("case_id", caseId).order("seq");
      const list = (steps ?? []) as { label: string; seq: number }[];
      const have2 = new Set(list.map((s) => s.label));
      let seq = list.length ? list[list.length - 1].seq : 0;
      const add = tasks
        .filter((t) => !have2.has(t.label))
        .map((t) => ({ case_id: caseId, seq: (seq += 10), phase: WELFARE_PHASE, label: t.label, state: "todo", student_note: t.note || null }));
      if (add.length) await sb.from("crm_steps").insert(add);
    }
  }
  refresh();
}
