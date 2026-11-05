import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/crm/admin-util";

// Opens a stored document through a short-lived signed URL (private bucket crm-docs).
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return new NextResponse("Not found", { status: 404 });
  const { sb } = await requireAdmin();
  const { data } = await sb.from("crm_documents").select("storage_path, file_name").eq("id", id).maybeSingle();
  if (!data?.storage_path) return new NextResponse("파일이 없습니다.", { status: 404 });
  const { data: signed } = await sb.storage
    .from("crm-docs")
    .createSignedUrl(data.storage_path as string, 120, { download: false });
  if (!signed?.signedUrl) return new NextResponse("파일을 열 수 없습니다.", { status: 404 });
  return NextResponse.redirect(signed.signedUrl, { headers: { "Cache-Control": "no-store" } });
}
