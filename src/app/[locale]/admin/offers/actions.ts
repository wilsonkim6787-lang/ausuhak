"use server";

// /admin/offers server actions — Wilson 합격증 업로드·관리.
// 5MB / JPG·PNG·PDF / super_admin 만.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import offersSeed from "@/data/offers-seed-2026-08.json";

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
  let displayOrder = orderRaw ? parseInt(orderRaw, 10) : 0;

  const supabase = await createClient();

  // 신규 + 순서 미입력 → 자동 채번 (max+1, 맨 뒤). sites 패턴과 동일.
  if (!id && !orderRaw) {
    const { data: maxRow } = await supabase
      .from("offers")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    displayOrder = (maxRow?.display_order ?? 0) + 1;
  }

  // 기존 image_path·순서 조회 (재업로드 시 정리 / 편집 시 순서 유지)
  let existingPath: string | null = null;
  if (id) {
    const { data: existing } = await supabase
      .from("offers")
      .select("image_path, display_order")
      .eq("id", id)
      .single();
    existingPath = existing?.image_path ?? null;
    // 편집인데 정렬을 비웠으면 기존 순서 유지 (0으로 떨어져 맨 앞으로 튀지 않게).
    if (!orderRaw && existing?.display_order != null) {
      displayOrder = existing.display_order;
    }
  }

  let newImagePath: string | null = existingPath;
  let oldImageToRemove: string | null = null;
  const hasFile = file && file.size > 0;
  if (hasFile) {
    if (file.size > OFFER_MAX_BYTES) redirect(errParam("5MB 초과"));
    if (!OFFER_ALLOWED_MIME.has(file.type)) redirect(errParam("JPG·PNG·PDF 만 허용"));

    // 새 파일 먼저 업로드 — 기존 파일 삭제는 DB 저장 성공 뒤로 미룸 (원본 유실 방지).
    const safeSchool = (school ?? "offer").replace(/[^A-Za-z0-9가-힣]+/g, "-").slice(0, 30);
    const path = `${safeSchool}-${Date.now()}.${extOf(file.name)}`;
    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(OFFER_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false });
    if (uploadError) redirect(errParam(`업로드 실패: ${uploadError.message}`));
    newImagePath = path;
    if (existingPath && existingPath !== path) oldImageToRemove = existingPath;
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

  // DB 저장 성공 후에만 옛 이미지 정리 (댕글링 방지).
  if (oldImageToRemove) {
    await supabase.storage.from(OFFER_BUCKET).remove([oldImageToRemove]);
  }

  revalidatePath("/admin/offers");
  revalidatePath("/", "layout"); // 메인 OfferShowcase 갱신
  redirect("/admin/offers?ok=1");
}

// 시드 일괄 등록 — 2026-08 배치 13건 (src/data/offers-seed-2026-08.json).
// 선택한 이미지들을 파일명으로 시드 메타와 매칭 → storage 업로드 + published 등록.
// 재실행 안전: 같은 image_path 는 row 갱신 (중복 생성 없음).
export async function bulkSeedOffersAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("권한 없음"));

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) redirect(errParam("시드 이미지 파일을 선택하세요"));

  const seedByFile = new Map(offersSeed.map((s) => [s.file, s]));
  const supabase = await createClient();

  const unmatched: string[] = [];
  const failed: string[] = [];
  let done = 0;

  for (const file of files) {
    const seed = seedByFile.get(file.name);
    if (!seed) {
      unmatched.push(file.name);
      continue;
    }
    if (file.size > OFFER_MAX_BYTES) {
      failed.push(`${file.name} (5MB 초과)`);
      continue;
    }
    if (!OFFER_ALLOWED_MIME.has(file.type)) {
      failed.push(`${file.name} (JPG·PNG·PDF 아님)`);
      continue;
    }

    const buffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(OFFER_BUCKET)
      .upload(seed.file, buffer, { contentType: file.type, upsert: true });
    if (uploadError) {
      failed.push(`${file.name} (업로드: ${uploadError.message})`);
      continue;
    }

    const payload = {
      school: seed.school,
      program: seed.program,
      year: seed.year,
      student_alias: seed.student_alias,
      image_path: seed.file,
      story: seed.story,
      display_order: seed.display_order,
      status: "published",
    };
    const { data: existing } = await supabase
      .from("offers")
      .select("id")
      .eq("image_path", seed.file)
      .maybeSingle();
    const res = existing
      ? await supabase.from("offers").update(payload).eq("id", existing.id)
      : await supabase.from("offers").insert(payload);
    if (res.error) {
      failed.push(`${file.name} (DB: ${res.error.message})`);
      continue;
    }
    done += 1;
  }

  revalidatePath("/admin/offers");
  revalidatePath("/", "layout"); // 메인 OfferShowcase 갱신

  if (unmatched.length > 0 || failed.length > 0) {
    const parts: string[] = [];
    if (done > 0) parts.push(`${done}건 등록됨`);
    if (unmatched.length > 0) parts.push(`시드 목록에 없는 파일: ${unmatched.join(", ")}`);
    if (failed.length > 0) parts.push(`실패: ${failed.join(", ")}`);
    redirect(errParam(parts.join(" / ")));
  }
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
