import { NextResponse, type NextRequest } from "next/server";
import { requireFamily } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Opens one document of the signed-in family through a short-lived signed URL.
export async function GET(req: NextRequest, ctx: RouteContext<"/mypage/file/[id]">) {
  const { id } = await ctx.params;
  const back = new URL("/mypage?file=missing", req.url);
  if (!UUID.test(id)) return NextResponse.redirect(back);
  const { sb } = await requireFamily();

  // RLS: the row is only visible when it belongs to the caller's family.
  const { data: doc } = await sb.from("crm_documents").select("id, storage_path, file_name").eq("id", id).maybeSingle();
  if (!doc?.storage_path) return NextResponse.redirect(back);

  let signed = await sb.storage.from("crm-docs").createSignedUrl(doc.storage_path, 60);
  if (signed.error || !signed.data) {
    // Files Wilson stored outside the family folder: the row is already proven to be
    // the family's, so sign its admin-set path with the service role.
    const admin = adminClient();
    if (admin) signed = await admin.storage.from("crm-docs").createSignedUrl(doc.storage_path, 60);
  }
  if (signed.error || !signed.data?.signedUrl) return NextResponse.redirect(back);
  const res = NextResponse.redirect(signed.data.signedUrl);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
