"use server";

// /admin/offers server actions — Wilson 합격증 업로드·관리.
// 5MB / JPG·PNG·PDF / super_admin 만.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

const OFFER_MAX_BYTES = 5 * 1024 * 1024;
const OFFER_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);
const OFFER_BUCKET = "offers";

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

function errParam(msg: string): string {
  return `/admin/offers?err=${encodeURIComponent(msg)}`;
}

export async function upsertOfferAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("권한 없음"));

  const id = nullify(formData.get("id"));
  const school = nullify(formData.get("school"));
  const program = nullify(formData.get("program"));
  const yearRaw = nullify(formData.get("year"));
  const studentAlias = nullify(formData.get("student_alias"));
  const note = nullify(formData.get("note"));
  const story = nullify(formData.get("story"));
  const status = nullify(formData.get("status")) ?? "published";
  const orderRaw = nullify(formData.get("display_order"));
  const file = formData.get("file") as File | null;

  if (!school) redirect(errParam("학교명 필수"));
  if (!["draft", "published", "archived"].includes(status)) {
    redirect(errParam("status 값 오류"));
  }

  const year = yearRaw ? parseInt(yearRaw, 10) : null;
  const displayOrder = orderRaw ? parseInt(orderRaw, 10) : 0;

  const supabase = await createClient();

  // 기존 image_path 조회 (재업로드 시 정리)
  let existingPath: string | null = null;
  if (id) {
    const { data: existing } = await supabase
      .from("offers")
      .select("image_path")
      .eq("id", id)
      .single();
    existingPath = existing?.image_path ?? null;
  }

  let newImagePath: string | null = existingPath;
  const hasFile = file && file.size > 0;
  if (hasFile) {
    if (file.size > OFFER_MAX_BYTES) redirect(errParam("5MB 초과"));
    if (!OFFER_ALLOWED_MIME.has(file.type)) redirect(errParam("JPG·PNG·PDF 만 허용"));

    if (existingPath) {
      await supabase.storage.from(OFFER_BUCKET).remove([existingPath]);
    }

    const safeSchool = (school ?? "offer").replace(/[^A-Za-z0-9가-힣]+/g, "-").slice(0, 30);
    const path = `${safeSchool}-${Date.now()}.${extOf(file.name)}`;
    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(OFFER_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (uploadError) redirect(errParam(`업로드 실패: ${uploadError.message}`));
    newImagePath = path;
  }

  const payload = {
    school,
    program,
    year,
    student_alias: studentAlias,
    image_path: newImagePath,
    note,
    story,
    display_order: displayOrder,
    status,
  };

  if (id) {
    const { error } = await supabase.from("offers").update(payload).eq("id", id);
    if (error) redirect(errParam(`저장 실패: ${error.message}`));
  } else {
    const { error } = await supabase.from("offers").insert(payload);
    if (error) redirect(errParam(`저장 실패: ${error.message}`));
  }

  revalidatePath("/admin/offers");
  revalidatePath("/", "layout"); // 메인 OfferShowcase 갱신
  redirect("/admin/offers?ok=1");
}

export async function deleteOfferAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("권한 없음"));
  const id = nullify(formData.get("id"));
  if (!id) redirect(errParam("id 누락"));

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("offers")
    .select("image_path")
    .eq("id", id)
    .single();

  if (existing?.image_path) {
    await supabase.storage.from(OFFER_BUCKET).remove([existing.image_path]);
  }
  await supabase.from("offers").delete().eq("id", id);

  revalidatePath("/admin/offers");
  revalidatePath("/", "layout");
  redirect("/admin/offers?ok=1");
}
