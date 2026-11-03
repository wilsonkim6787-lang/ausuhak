"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { attachAccount, normalizeCode } from "@/lib/crm/account";

export type FormState = { error?: string; info?: string } | undefined;

function safeNext(n: FormDataEntryValue | null) {
  const s = typeof n === "string" ? n : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "";
}

async function origin() {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host") ?? "www.ausuhak.com"}`;
}

async function destFor(userId: string, next: string) {
  const sb = await createClient();
  const { data } = await sb.from("crm_profiles").select("role, family_id").eq("id", userId).maybeSingle();
  if (!data) return "/signup/complete";
  if (data.role === "admin") return next.startsWith("/admin") ? next : "/admin";
  if (!data.family_id) return "/signup/complete";
  return next.startsWith("/mypage") ? next : "/mypage";
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "이메일과 비밀번호를 넣어 주세요." };
  const sb = await createClient();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "이메일 또는 비밀번호가 맞지 않습니다." };
  redirect(await destFor(data.user.id, safeNext(fd.get("next"))));
}

export async function kakaoAction(fd: FormData) {
  const sb = await createClient();
  const next = safeNext(fd.get("next"));
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: `${await origin()}/auth/callback${next ? "?next=" + encodeURIComponent(next) : ""}`,
      queryParams: { prompt: "login" },
    },
  });
  if (error || !data?.url) redirect("/login?error=kakao");
  redirect(data.url);
}

export async function signupAction(_: FormState, fd: FormData): Promise<FormState> {
  const role = fd.get("role") === "parent" ? "parent" : "student";
  const name = String(fd.get("name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const relation = role === "student" ? "학생" : String(fd.get("relation") ?? "보호자");
  const code = normalizeCode(String(fd.get("code") ?? ""));
  if (!name || !email || !password) return { error: "이름, 이메일, 비밀번호를 넣어 주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상으로 정해 주세요." };
  if (fd.get("agree") !== "on") return { error: "개인정보 수집·이용에 동의해 주셔야 가입할 수 있습니다." };
  if (role === "parent" && code.length !== 8) return { error: "학생이나 제가 보내 드린 연결 코드 8자리를 넣어 주세요." };
  if (code && code.length !== 8) return { error: "연결 코드 8자리를 다시 확인해 주세요." };

  const sb = await createClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${await origin()}/auth/callback` },
  });
  if (error || !data.user) {
    const msg = error?.message?.toLowerCase() ?? "";
    if (msg.includes("registered") || msg.includes("exists")) return { error: "이미 가입된 이메일입니다. 로그인해 주세요." };
    return { error: "가입이 되지 않았습니다. 잠시 후 다시 시도해 주세요." };
  }
  if (data.user.identities && data.user.identities.length === 0) return { error: "이미 가입된 이메일입니다. 로그인해 주세요." };
  const r = await attachAccount({ userId: data.user.id, email, role, name, phone, relation, code: code || undefined });
  if (r.error) return { error: r.error };
  if (!data.session) return { info: `${email} 으로 확인 메일을 보냈습니다. 메일의 링크를 누르면 가입이 끝납니다.` };
  redirect("/mypage");
}

export async function completeAction(_: FormState, fd: FormData): Promise<FormState> {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: existing } = await sb.from("crm_profiles").select("role, family_id").eq("id", user.id).maybeSingle();
  if (existing?.role === "admin") redirect("/admin");
  if (existing?.family_id) redirect("/mypage");
  const role = fd.get("role") === "parent" ? "parent" : "student";
  const name = String(fd.get("name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  const relation = role === "student" ? "학생" : String(fd.get("relation") ?? "보호자");
  const code = normalizeCode(String(fd.get("code") ?? ""));
  if (!name) return { error: "이름을 넣어 주세요." };
  if (fd.get("agree") !== "on") return { error: "개인정보 수집·이용에 동의해 주세요." };
  if (role === "parent" && code.length !== 8) return { error: "학생이나 제가 보내 드린 연결 코드 8자리를 넣어 주세요." };
  if (code && code.length !== 8) return { error: "연결 코드 8자리를 다시 확인해 주세요." };
  const r = await attachAccount({ userId: user.id, email: user.email ?? null, role, name, phone, relation, code: code || undefined });
  if (r.error) return { error: r.error };
  redirect("/mypage");
}

export async function joinFamilyAction(_: FormState, fd: FormData): Promise<FormState> {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const code = normalizeCode(String(fd.get("code") ?? ""));
  if (code.length !== 8) return { error: "연결 코드 8자리를 넣어 주세요." };
  const admin = adminClient();
  if (!admin) return { error: "지금은 연결할 수 없습니다. 잠시 후 다시 해 주세요." };
  const { data: fam } = await admin.from("crm_families").select("id").eq("invite_code", code).maybeSingle();
  if (!fam) return { error: "연결 코드가 맞지 않습니다." };
  await admin.from("crm_profiles").update({ family_id: fam.id }).eq("id", user.id);
  redirect("/mypage");
}

export async function resetAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim();
  if (!email) return { error: "가입한 이메일을 넣어 주세요." };
  const sb = await createClient();
  await sb.auth.resetPasswordForEmail(email, { redirectTo: `${await origin()}/auth/callback?next=/login/update` });
  return { info: "비밀번호를 다시 정하는 링크를 메일로 보냈습니다." };
}

export async function updatePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "비밀번호는 8자 이상으로 정해 주세요." };
  const sb = await createClient();
  const { error } = await sb.auth.updateUser({ password });
  if (error) return { error: "링크가 만료되었습니다. 비밀번호 찾기를 다시 해 주세요." };
  redirect("/mypage");
}

export async function logoutAction() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/login");
}
