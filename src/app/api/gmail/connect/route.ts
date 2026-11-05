import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { gmailAuthUrl, gmailClientReady } from "@/lib/crm/gmail";

// Admin-only: sends Wilson to Google to allow read access to ausuhak@gmail.com.
export async function GET(req: NextRequest) {
  const { profile } = await getSession();
  const origin = new URL(req.url).origin;
  if (profile?.role !== "admin") return NextResponse.redirect(`${origin}/login?next=/admin/mail`);
  if (!gmailClientReady()) return NextResponse.redirect(`${origin}/admin/mail?sync=off`);
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(gmailAuthUrl(`${origin}/api/gmail/callback`, state));
  res.cookies.set("gmail_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/api/gmail" });
  return res;
}
