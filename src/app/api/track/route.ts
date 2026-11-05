import { NextResponse, type NextRequest } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

// Receives small beacons from TrackClicks / ConsultForm. Writes with the service role; nothing is read back.
const KINDS = new Set(["click", "form_start", "form_submit"]);
const BOT = /bot|crawl|spider|slurp|headless|preview|lighthouse/i;
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : null);

export async function POST(req: NextRequest) {
  if (BOT.test(req.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!KINDS.has(String(body.kind))) return new NextResponse(null, { status: 400 });
  const admin = adminClient();
  if (admin) {
    await admin.from("site_events").insert({
      kind: String(body.kind),
      label: clip(body.label, 80),
      href: clip(body.href, 200),
      section: clip(body.section, 40),
      page: clip(body.page, 200),
    });
  }
  return new NextResponse(null, { status: 204 });
}
