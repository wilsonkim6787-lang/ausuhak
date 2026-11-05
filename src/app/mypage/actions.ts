"use server";
import { refresh } from "next/cache";
import { requireFamily } from "@/lib/auth";
import { checkUpload } from "@/lib/crm/upload";

export type MsgState = { error?: string; ok?: number } | undefined;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function sendMessageAction(prev: MsgState, fd: FormData): Promise<MsgState> {
  const { sb, user, profile } = await requireFamily();
  const body = String(fd.get("body") ?? "").trim();
  if (!body) return { error: "메시지를 써 주세요." };
  if (body.length > 4000) return { error: "4,000자 이하로 나눠서 보내 주세요." };
  // RLS: family_id must be the caller's family, from_admin false, author_id = auth.uid().
  const { error } = await sb.from("crm_messages").insert({
    family_id: profile.family_id,
    author_id: user.id,
    from_admin: false,
    body,
  });
  if (error) return { error: "보내지 못했습니다. 잠시 후 다시 보내 주세요." };
  refresh();
  return { ok: (prev?.ok ?? 0) + 1 };
}

// Records a file the browser already uploaded to crm-docs/<family_id>/<student_id>/...
// The database function re-checks that the document belongs to the caller's family,
// is still waiting for a file, and that the object exists under that family/student folder.
export async function submitDocumentAction(input: { docId: string; path: string; fileName: string; size: number }): Promise<{ error?: string }> {
  const { sb, profile } = await requireFamily();
  const docId = String(input?.docId ?? "");
  const path = String(input?.path ?? "");
  const fileName = String(input?.fileName ?? "").slice(0, 200);
  if (!UUID.test(docId) || !path.startsWith(profile.family_id + "/")) return { error: "올리지 못했습니다. 페이지를 새로 열고 다시 해 주세요." };
  const bad = checkUpload(fileName, Number(input?.size) || 0);
  if (bad) return { error: bad };

  const { data: doc } = await sb.from("crm_documents").select("id, student_id, direction, state").eq("id", docId).maybeSingle();
  if (!doc || doc.direction !== "from_family") return { error: "올리지 못했습니다. 페이지를 새로 열고 다시 해 주세요." };
  if (doc.state !== "requested" && doc.state !== "redo") return { error: "이 서류는 이미 받았습니다." };
  if (!path.startsWith(`${profile.family_id}/${doc.student_id}/`)) return { error: "올리지 못했습니다. 페이지를 새로 열고 다시 해 주세요." };

  const { error } = await sb.rpc("crm_family_submit_document", { p_doc: docId, p_path: path, p_name: fileName });
  if (error) {
    const m = error.message || "";
    if (m.includes("doc_closed")) return { error: "이 서류는 이미 받았습니다." };
    if (m.includes("too_big")) return { error: "15MB 이하 파일만 올릴 수 있습니다." };
    if (m.includes("no_file")) return { error: "파일이 끝까지 올라가지 않았습니다. 다시 올려 주세요." };
    return { error: "올리지 못했습니다. 잠시 후 다시 해 주세요." };
  }
  refresh();
  return {};
}
