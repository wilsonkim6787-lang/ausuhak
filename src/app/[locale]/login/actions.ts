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

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Wilson 전용 admin / 실제 에러 메시지 노출해 진단 용이
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login credentials")) {
      return { error: "이메일 또는 비밀번호가 올바르지 않습니다. (Supabase 응답 확인됨)" };
    }
    if (msg.includes("email not confirmed")) {
      return { error: "이메일 미확인 상태. Supabase Dashboard → Authentication → Users → 해당 행 ⋮ → 'Confirm user' 클릭하세요." };
    }
    if (msg.includes("fetch")) {
      return { error: `Supabase 연결 실패. 환경변수 (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY) 점검 필요. 원본: ${error.message}` };
    }
    return { error: `로그인 실패: ${error.message} (status=${error.status ?? "?"})` };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
