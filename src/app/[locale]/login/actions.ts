"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // 실제 에러 메시지 노출해 진단 용이 (학생/직원/Wilson 공용 로그인)
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login credentials")) {
      return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    }
    if (msg.includes("email not confirmed")) {
      return { error: "이메일 미확인 상태입니다. 가입 시 받은 인증 메일의 링크를 먼저 클릭해주세요." };
    }
    if (msg.includes("fetch")) {
      return { error: `Supabase 연결 실패. 환경변수 (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY) 점검 필요. 원본: ${error.message}` };
    }
    return { error: `로그인 실패: ${error.message} (status=${error.status ?? "?"})` };
  }

  // role 기반 리다이렉트 — public.users는 014/015 trigger가 자동 mirror
  let dest = "/";
  if (data.user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (profile?.role === "super_admin") dest = "/admin";
    else if (profile?.role === "staff") dest = "/"; // TODO Step 2.6: /staff
    else if (profile?.role === "student") dest = "/"; // TODO Step 2.2: /mypage
  }

  revalidatePath("/", "layout");
  redirect(dest);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
