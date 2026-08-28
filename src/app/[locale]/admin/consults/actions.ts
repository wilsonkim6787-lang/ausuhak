"use server";

// /admin/consults server actions — 상담 신청 처리 (직원 이상).

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

function errParam(msg: string): string {
  return `/admin/consults?err=${encodeURIComponent(msg)}`;
}

const STATUSES = ["new", "contacted", "closed"] as const;

export async function updateConsultStatusAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "super_admin" && user.role !== "staff")) {
    redirect(errParam("권한 없음"));
  }
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(STATUSES as readonly string[]).includes(status)) {
    redirect(errParam("잘못된 요청"));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("consult_requests")
    .update({ status })
    .eq("id", id);
  if (error) redirect(errParam(`저장 실패: ${error.message}`));

  revalidatePath("/admin/consults");
  redirect("/admin/consults?ok=1");
}

export async function saveConsultMemoAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "super_admin" && user.role !== "staff")) {
    redirect(errParam("권한 없음"));
  }
  const id = String(formData.get("id") ?? "");
  const memo = String(formData.get("admin_memo") ?? "").trim().slice(0, 500);
  if (!id) redirect(errParam("id 누락"));

  const supabase = await createClient();
  const { error } = await supabase
    .from("consult_requests")
    .update({ admin_memo: memo || null })
    .eq("id", id);
  if (error) redirect(errParam(`저장 실패: ${error.message}`));

  revalidatePath("/admin/consults");
  redirect("/admin/consults?ok=1");
}

export async function deleteConsultAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("권한 없음"));
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(errParam("id 누락"));

  const supabase = await createClient();
  const { error } = await supabase.from("consult_requests").delete().eq("id", id);
  if (error) redirect(errParam(`삭제 실패: ${error.message}`));

  revalidatePath("/admin/consults");
  redirect("/admin/consults?ok=1");
}
