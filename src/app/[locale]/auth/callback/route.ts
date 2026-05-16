// OAuth 콜백 — Kakao / Google 로그인 후 Supabase 가 여기로 redirect.
// ?code=... → exchangeCodeForSession → users.role 따라 dest 결정 → 최종 redirect.

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/audit/log";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  if (errorParam || !code) {
    const msg = errorDesc ?? errorParam ?? "no_code";
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(msg)}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error?.message ?? "exchange_failed")}`,
    );
  }

  // 014/015 trigger 가 auth.users → public.users 자동 mirror.
  // OAuth 첫 가입자도 trigger 로 row 생성됨.
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  let dest = "/";
  if (profile?.role === "super_admin") dest = "/admin";
  else if (profile?.role === "staff") dest = "/staff";
  else if (profile?.role === "student") dest = "/mypage";

  await logActivity({
    action_type: "login",
    details: {
      role: profile?.role ?? null,
      dest,
      provider: "oauth",
      provider_app: data.user.app_metadata?.provider ?? null,
    },
    user_id: data.user.id,
  });

  return NextResponse.redirect(`${origin}${dest}`);
}
