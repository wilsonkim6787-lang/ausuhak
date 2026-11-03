import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

// Receives consultation requests from the forms on public pages.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const b = body as { source?: unknown; page?: unknown; fields?: unknown; agreed?: unknown };
  const fields = b.fields && typeof b.fields === "object" ? (b.fields as Record<string, unknown>) : {};
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields).slice(0, 30)) {
    if (typeof v === "string" && v.trim()) clean[k.slice(0, 60)] = v.trim().slice(0, 2000);
  }
  if (b.agreed !== true || Object.keys(clean).length === 0) {
    return NextResponse.json({ ok: false, error: "missing" }, { status: 400 });
  }
  const name = Object.entries(clean).find(([k]) => k === "이름" || k.endsWith("이름"))?.[1] || "";
  const contact = Object.entries(clean).find(([k]) => k.startsWith("연락처"))?.[1] || "";
  const sb = adminClient();
  if (!sb) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  const topic = Object.entries(clean).find(([k]) => k.startsWith("관심") || k.includes("전공"))?.[1] || "";
  const message = Object.entries(clean)
    .map(([k, v]) => `${k}: ${v}`)
    .concat(typeof b.page === "string" ? [`페이지: ${b.page.slice(0, 200)}`] : [])
    .join("\n");
  // Uses the existing consult_requests table (name, contact, topic, message, source, status).
  const { error } = await sb.from("consult_requests").insert({
    name: name.slice(0, 100) || "(이름 미입력)",
    contact: contact.slice(0, 200) || "(연락처 미입력)",
    topic: topic.slice(0, 30) || null,
    message,
    source: typeof b.source === "string" ? b.source.slice(0, 30) : "web",
  });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
