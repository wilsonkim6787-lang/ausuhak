import "server-only";
import { adminClient } from "@/lib/supabase/admin";

// Pulls emails with attachments from ausuhak@gmail.com into crm_inbound_emails
// and files chosen attachments into a student's documents.
//
// Needs env: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
// (OAuth client of type "Web" or "Desktop", scope gmail.readonly, refresh token
// issued for ausuhak@gmail.com).

type Attachment = { filename: string; mimeType: string; size: number; attachmentId: string; partId: string };

export function gmailClientReady() {
  return !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET);
}

// Refresh token: env GMAIL_REFRESH_TOKEN, or the one saved by the "Gmail 연결하기" flow.
async function refreshToken(): Promise<string | null> {
  if (process.env.GMAIL_REFRESH_TOKEN) return process.env.GMAIL_REFRESH_TOKEN;
  const admin = adminClient();
  if (!admin) return null;
  const { data } = await admin.from("crm_settings").select("value").eq("key", "gmail_refresh_token").maybeSingle();
  return data?.value ?? null;
}

export async function gmailConfigured() {
  return gmailClientReady() && !!(await refreshToken());
}

export async function gmailAccount(): Promise<string | null> {
  const admin = adminClient();
  if (!admin) return null;
  const { data } = await admin.from("crm_settings").select("value").eq("key", "gmail_account").maybeSingle();
  return data?.value ?? null;
}

export function gmailAuthUrl(redirectUri: string, state: string) {
  const q = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
    login_hint: "ausuhak@gmail.com",
    state,
  });
  return "https://accounts.google.com/o/oauth2/v2/auth?" + q.toString();
}

// Exchanges the consent code and stores the refresh token (service role).
export async function saveGmailConsent(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!res.ok) return { ok: false as const, error: "token_" + res.status };
  const tok = (await res.json()) as { refresh_token?: string; access_token: string };
  if (!tok.refresh_token) return { ok: false as const, error: "no_refresh_token" };
  const who = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: "Bearer " + tok.access_token },
    cache: "no-store",
  });
  const email = who.ok ? ((await who.json()) as { emailAddress?: string }).emailAddress ?? "" : "";
  const admin = adminClient();
  if (!admin) return { ok: false as const, error: "no_db" };
  const now = new Date().toISOString();
  await admin.from("crm_settings").upsert([
    { key: "gmail_refresh_token", value: tok.refresh_token, updated_at: now },
    { key: "gmail_account", value: email, updated_at: now },
  ]);
  return { ok: true as const, email };
}

async function accessToken(): Promise<string> {
  const rt = await refreshToken();
  if (!rt) throw new Error("gmail_not_connected");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID!,
      client_secret: process.env.GMAIL_CLIENT_SECRET!,
      refresh_token: rt,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("gmail_token_" + res.status);
  return (await res.json()).access_token as string;
}

async function gmail<T>(token: string, path: string): Promise<T> {
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/" + path, {
    headers: { Authorization: "Bearer " + token },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("gmail_" + res.status);
  return res.json() as Promise<T>;
}

type Part = { partId: string; mimeType: string; filename?: string; body?: { attachmentId?: string; size?: number; data?: string }; parts?: Part[] };
type Msg = {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  payload: Part & { headers: { name: string; value: string }[] };
};

function collectAttachments(p: Part, out: Attachment[] = []) {
  if (p.filename && p.body?.attachmentId) {
    out.push({ filename: p.filename, mimeType: p.mimeType, size: p.body.size ?? 0, attachmentId: p.body.attachmentId, partId: p.partId });
  }
  p.parts?.forEach((c) => collectAttachments(c, out));
  return out;
}

function header(m: Msg, name: string) {
  return m.payload.headers.find((h) => h.name.toLowerCase() === name)?.value ?? "";
}

function emailOf(from: string) {
  const m = from.match(/<([^>]+)>/);
  return (m ? m[1] : from).trim().toLowerCase();
}

type StudentKey = { id: string; name_ko: string; name_en: string | null; email: string | null; trns: string[] };

async function loadStudents(): Promise<StudentKey[]> {
  const admin = adminClient()!;
  const [{ data: students }, { data: cases }] = await Promise.all([
    admin.from("crm_students").select("id, name_ko, name_en, email"),
    admin.from("crm_cases").select("student_id, trn").not("trn", "is", null),
  ]);
  return (students ?? []).map((s) => ({
    ...s,
    trns: (cases ?? []).filter((c) => c.student_id === s.id && c.trn).map((c) => String(c.trn).toUpperCase()),
  }));
}

// Best-effort match: sender email, then TRN (Home Affairs letters for a 956A
// recipient), then the student's English or Korean name in subject/snippet.
export function matchStudent(students: StudentKey[], from: string, subject: string, snippet: string) {
  const addr = emailOf(from);
  const hit = students.find((s) => s.email && s.email.toLowerCase() === addr);
  if (hit) return { id: hit.id, reason: "보낸 사람 이메일" };
  const text = (subject + " " + snippet).toUpperCase();
  const trn = students.find((s) => s.trns.some((t) => t && text.includes(t)));
  if (trn) return { id: trn.id, reason: "TRN 번호" };
  const en = students.find((s) => s.name_en && s.name_en.trim().length > 3 && text.includes(s.name_en.toUpperCase()));
  if (en) return { id: en.id, reason: "영문 이름" };
  const ko = students.find((s) => s.name_ko && s.name_ko.length >= 2 && (subject + " " + snippet).includes(s.name_ko));
  if (ko) return { id: ko.id, reason: "한글 이름" };
  return null;
}

export async function syncGmail({ days = 14, max = 50 } = {}) {
  if (!(await gmailConfigured())) return { ok: false as const, error: "not_configured" };
  const admin = adminClient();
  if (!admin) return { ok: false as const, error: "no_db" };
  const token = await accessToken();
  const q = encodeURIComponent(`has:attachment newer_than:${days}d -in:sent -in:chats`);
  const list = await gmail<{ messages?: { id: string }[] }>(token, `messages?q=${q}&maxResults=${max}`);
  const ids = (list.messages ?? []).map((m) => m.id);
  if (!ids.length) return { ok: true as const, added: 0 };
  const { data: known } = await admin.from("crm_inbound_emails").select("gmail_id").in("gmail_id", ids);
  const seen = new Set((known ?? []).map((k) => k.gmail_id));
  const students = await loadStudents();
  let added = 0;
  for (const id of ids) {
    if (seen.has(id)) continue;
    const m = await gmail<Msg>(token, `messages/${id}?format=full`);
    const atts = collectAttachments(m.payload).filter((a) => !/^(image\d+|smime)/i.test(a.filename));
    if (!atts.length) continue;
    const from = header(m, "from");
    const subject = header(m, "subject");
    const match = matchStudent(students, from, subject, m.snippet);
    const { error } = await admin.from("crm_inbound_emails").insert({
      gmail_id: m.id,
      thread_id: m.threadId,
      from_addr: from.slice(0, 300),
      subject: subject.slice(0, 500),
      snippet: m.snippet.slice(0, 1000),
      received_at: new Date(Number(m.internalDate)).toISOString(),
      attachments: atts,
      matched_student_id: match?.id ?? null,
      match_reason: match?.reason ?? null,
    });
    if (!error) added++;
  }
  return { ok: true as const, added };
}

// Copies one attachment into storage and records it as a received document.
export async function fileEmailAttachment(emailId: string, attachmentIndex: number, studentId: string, label?: string) {
  if (!(await gmailConfigured())) return { ok: false as const, error: "not_configured" };
  const admin = adminClient();
  if (!admin) return { ok: false as const, error: "no_db" };
  const { data: em } = await admin.from("crm_inbound_emails").select("*").eq("id", emailId).single();
  const { data: st } = await admin.from("crm_students").select("id, family_id").eq("id", studentId).single();
  if (!em || !st) return { ok: false as const, error: "not_found" };
  const att = (em.attachments as Attachment[])[attachmentIndex];
  if (!att) return { ok: false as const, error: "no_attachment" };
  const token = await accessToken();
  const body = await gmail<{ data: string }>(token, `messages/${em.gmail_id}/attachments/${att.attachmentId}`);
  const bytes = Buffer.from(body.data.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const safe = att.filename.replace(/[^\w.\-가-힣]+/g, "_").slice(-120);
  const path = `${st.family_id}/${st.id}/${Date.now()}-${safe}`;
  const up = await admin.storage.from("crm-docs").upload(path, bytes, { contentType: att.mimeType, upsert: false });
  if (up.error) return { ok: false as const, error: "upload" };
  const { error } = await admin.from("crm_documents").insert({
    student_id: st.id,
    direction: "from_family",
    label: label || att.filename,
    state: "received",
    storage_path: path,
    file_name: att.filename,
    source: "email",
    inbound_email_id: em.id,
  });
  if (error) return { ok: false as const, error: "insert" };
  await admin.from("crm_inbound_emails").update({ status: "filed", matched_student_id: st.id }).eq("id", em.id);
  return { ok: true as const };
}
