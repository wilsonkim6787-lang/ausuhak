"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit/log";

export type SignupState = {
  error?: string;
  notice?: string;
};

// 학생 회원가입 (이메일 + 비밀번호 + 이름 + 선택 전화)
// auth.users INSERT → 014/015 trigger가 public.users에 role='student' mirror
// 이메일 확인이 켜져 있으면 session 없이 반환 → notice로 안내
// 이메일 확인이 꺼져 있으면 session 발급 → 바로 / 로 리다이렉트
export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!email || !password || !name) {
    return { error: "이메일·비밀번호·이름은 필수입니다." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }
  if (name.length < 2) {
    return { error: "이름은 2자 이상이어야 합니다." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone: phone || null,
      },
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("user already")) {
      return { error: "이미 가입된 이메일입니다. 로그인 페이지로 이동해주세요." };
    }
    if (msg.includes("password")) {
      return { error: `비밀번호 오류: ${error.message}` };
    }
    if (msg.includes("fetch")) {
      return { error: `Supabase 연결 실패. 환경변수 점검 필요. 원본: ${error.message}` };
    }
    return { error: `가입 실패: ${error.message} (status=${error.status ?? "?"})` };
  }

  await logActivity({
    action_type: "signup",
    user_id: data.user?.id ?? null,
    details: {
      email_confirmed_auto: !!data.session,
    },
  });

  // 이메일 확인 OFF → session 즉시 발급 → /
  // 이메일 확인 ON  → session 없음 → 안내 메시지로 멈춤
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/mypage");
  }

  return {
    notice:
      "가입 신청 완료. 입력하신 이메일로 인증 링크를 보냈습니다. 메일 확인 후 로그인해주세요.",
  };
}
