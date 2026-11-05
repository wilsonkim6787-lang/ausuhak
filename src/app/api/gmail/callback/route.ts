import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { saveGmailConsent } from "@/lib/crm/gmail";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  const { profile } = await getSession();
  if (profile?.role !== "admin") return NextResponse.redirect(`${origin}/login?next=/admin/mail`);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const saved = req.cookies.get("gmail_oauth_state")?.value;
  if (!code || !state || !saved || state !== saved) return NextResponse.redirect(`${origin}/admin/mail?gmail=err`);
  const r = await saveGmailConsent(code, `${origin}/api/gmail/callback`);
  const res = NextResponse.redirect(`${origin}/admin/mail?gmail=${r.ok ? "ok" : "err"}`);
  res.cookies.delete({ name: "gmail_oauth_state", path: "/api/gmail" });
  return res;
}
