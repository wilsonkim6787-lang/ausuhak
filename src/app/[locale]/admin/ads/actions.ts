"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

function nullify(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

function errParam(msg: string): string {
  return `/admin/ads?err=${encodeURIComponent(msg)}`;
}

export async function upsertCampaignAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("권한 없음"));

  const id = nullify(formData.get("id"));
  const name = nullify(formData.get("name"));
  const sourceTag = nullify(formData.get("source_tag"));
  const startDate = nullify(formData.get("start_date"));
  const endDate = nullify(formData.get("end_date"));
  const budgetRaw = nullify(formData.get("budget_krw"));
  const spentRaw = nullify(formData.get("spent_krw"));
  const note = nullify(formData.get("note"));
  const status = nullify(formData.get("status")) ?? "active";

  if (!name) redirect(errParam("캠페인명 필수"));
  if (!sourceTag) redirect(errParam("source_tag 필수 (예: kakao_ad_spring2026)"));
  if (!["active", "paused", "ended"].includes(status)) redirect(errParam("status 오류"));
  if (!/^[a-z0-9_-]+$/.test(sourceTag)) {
    redirect(errParam("source_tag 형식 — 소문자·숫자·_- 만 (예: kakao_ad_spring2026)"));
  }

  const payload = {
    name,
    source_tag: sourceTag,
    start_date: startDate,
    end_date: endDate,
    budget_krw: budgetRaw ? parseInt(budgetRaw, 10) : 0,
    spent_krw: spentRaw ? parseInt(spentRaw, 10) : 0,
    note,
    status,
  };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from("ad_campaigns").update(payload).eq("id", id);
    if (error) redirect(errParam(`저장 실패: ${error.message}`));
  } else {
    const { error } = await supabase.from("ad_campaigns").insert(payload);
    if (error) redirect(errParam(`저장 실패: ${error.message}`));
  }

  revalidatePath("/admin/ads");
  redirect("/admin/ads?ok=1");
}

export async function deleteCampaignAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("권한 없음"));
  const id = nullify(formData.get("id"));
  if (!id) redirect(errParam("id 누락"));

  const supabase = await createClient();
  await supabase.from("ad_campaigns").delete().eq("id", id);

  revalidatePath("/admin/ads");
  redirect("/admin/ads?ok=1");
}
