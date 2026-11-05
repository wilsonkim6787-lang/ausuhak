import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (Kakao), email confirmation and password-reset links land here.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/login?error=no_code`);
  const sb = await createClient();
  const { data, error } = await sb.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/login?error=exchange`);

  const next = searchParams.get("next");
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/admin")) {
    if (next === "/login/update") return NextResponse.redirect(`${origin}${next}`);
  }
  const { data: p } = await sb.from("crm_profiles").select("role, family_id").eq("id", data.user.id).maybeSingle();
  if (!p) return NextResponse.redirect(`${origin}/signup/complete`);
  if (p.role === "admin") return NextResponse.redirect(`${origin}/admin`);
  if (!p.family_id) return NextResponse.redirect(`${origin}/signup/complete`);
  const ret = request.cookies.get("ret")?.value ?? "";
  const dest =
    next && (next.startsWith("/mypage") || next.startsWith("/medical/")) && !next.startsWith("//")
      ? next
      : ret.startsWith("/medical/") && !ret.includes("//")
        ? ret
        : "/mypage";
  return NextResponse.redirect(`${origin}${dest}`);
}
