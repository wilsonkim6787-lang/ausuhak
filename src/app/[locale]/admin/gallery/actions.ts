"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const BUCKET = "gallery";

function nullify(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

function extOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot < 0) return "bin";
  return filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function errUrl(msg: string): string {
  return `/admin/gallery?err=${encodeURIComponent(msg)}`;
}

export async function upsertGalleryAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errUrl("권한 없음"));

  const id = nullify(formData.get("id"));
  const caption = nullify(formData.get("caption"));
  const status = nullify(formData.get("status")) ?? "published";
  const orderRaw = nullify(formData.get("display_order"));
  const file = formData.get("file") as File | null;

  if (!["draft", "published", "archived"].includes(status)) {
    redirect(errUrl("status 값 오류"));
  }

  const displayOrder = orderRaw ? parseInt(orderRaw, 10) : 0;
  const supabase = await createClient();

  let existingPath: string | null = null;
  if (id) {
    const { data } = await supabase
      .from("gallery")
      .select("image_path")
      .eq("id", id)
      .single();
    existingPath = data?.image_path ?? null;
  }

  let imagePath: string | null = existingPath;
  const hasFile = file && file.size > 0;

  if (!id && !hasFile) redirect(errUrl("사진 필수"));

  if (hasFile) {
    if (file.size > MAX_BYTES) redirect(errUrl("5MB 초과"));
    if (!ALLOWED_MIME.has(file.type)) redirect(errUrl("JPG·PNG·WebP만 허용"));

    if (existingPath) {
      await supabase.storage.from(BUCKET).remove([existingPath]);
    }

    const path = `gallery-${Date.now()}.${extOf(file.name)}`;
    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (uploadError) redirect(errUrl(`업로드 실패: ${uploadError.message}`));
    imagePath = path;
  }

  const payload = {
    image_path: imagePath,
    caption,
    display_order: displayOrder,
    status,
  };

  if (id) {
    const { error } = await supabase.from("gallery").update(payload).eq("id", id);
    if (error) redirect(errUrl(`저장 실패: ${error.message}`));
  } else {
    const { error } = await supabase.from("gallery").insert(payload);
    if (error) redirect(errUrl(`저장 실패: ${error.message}`));
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/", "layout");
  redirect("/admin/gallery?ok=1");
}

export async function deleteGalleryAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errUrl("권한 없음"));

  const id = nullify(formData.get("id"));
  if (!id) redirect(errUrl("id 누락"));

  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery")
    .select("image_path")
    .eq("id", id)
    .single();

  if (data?.image_path) {
    await supabase.storage.from(BUCKET).remove([data.image_path]);
  }
  await supabase.from("gallery").delete().eq("id", id);

  revalidatePath("/admin/gallery");
  revalidatePath("/", "layout");
  redirect("/admin/gallery?ok=1");
}
