"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import { VIDEO_CATEGORIES } from "./constants";

// YouTube URL 에서 11자 video ID 추출 (watch?v= / youtu.be / shorts)
function extractYoutubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

function nullify(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

function errParam(msg: string): string {
  return `/admin/youtube?err=${encodeURIComponent(msg)}`;
}

export async function upsertVideoAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("권한 없음"));

  const id = nullify(formData.get("id"));
  const youtubeUrl = nullify(formData.get("youtube_url"));
  const title = nullify(formData.get("title"));
  const description = nullify(formData.get("description"));
  const thumbnailUrl = nullify(formData.get("thumbnail_url"));
  const category = nullify(formData.get("category"));
  const status = nullify(formData.get("status")) ?? "published";
  const orderRaw = nullify(formData.get("display_order"));

  if (!youtubeUrl) redirect(errParam("YouTube URL 필수"));
  if (!title) redirect(errParam("제목 필수"));
  if (!["draft", "published", "archived"].includes(status)) redirect(errParam("status 오류"));
  if (category && !(VIDEO_CATEGORIES as readonly string[]).includes(category)) redirect(errParam("category 오류"));

  const youtubeId = extractYoutubeId(youtubeUrl);
  if (!youtubeId) redirect(errParam("YouTube ID 추출 실패 — URL 형식 확인"));

  const autoThumbnail = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  const payload = {
    youtube_id: youtubeId,
    youtube_url: youtubeUrl,
    title,
    description,
    thumbnail_url: thumbnailUrl ?? autoThumbnail,
    category,
    status,
    display_order: orderRaw ? parseInt(orderRaw, 10) : 0,
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("videos").update(payload).eq("id", id);
    if (error) redirect(errParam(`저장 실패: ${error.message}`));
  } else {
    const { error } = await supabase.from("videos").insert(payload);
    if (error) redirect(errParam(`저장 실패: ${error.message}`));
  }

  revalidatePath("/admin/youtube");
  redirect("/admin/youtube?ok=1");
}

export async function deleteVideoAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("권한 없음"));
  const id = nullify(formData.get("id"));
  if (!id) redirect(errParam("id 누락"));

  const supabase = await createClient();
  await supabase.from("videos").delete().eq("id", id);

  revalidatePath("/admin/youtube");
  redirect("/admin/youtube?ok=1");
}

