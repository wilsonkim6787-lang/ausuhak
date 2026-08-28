"use server";

// 비밀번호 재설정 메일 요청 — 메일 링크: /auth/callback?next=/update-password
// (callback 이 code 교환 후 next 로 보냄 → /update-password 에서 새 비밀번호 설정)

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type ResetState = { error?: string; sent?: boolean };

export async function requestPasswordResetAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "이메일을 입력해주세요." };
  }

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host") ?? "www.ausuhak.com";

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${proto}://${host}/auth/callback?next=/update-password`,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rate limit")) {
      return { error: "요청이 너무 잦습니다. 잠시 후 다시 시도해주세요." };
    }
    return { error: `메일 발송 실패: ${error.message}` };
  }

  // 존재하지 않는 이메일도 성공으로 응답 (계정 존재 여부 노출 방지 — Supabase 기본 동작)
  return { sent: true };
}
