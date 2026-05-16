"use server";

// /admin/faqs 통합 관리 server actions.
// 현재: staff_manuals 풀 CRUD / internal_faqs·public_faqs 는 향후 확장.
// 에러 피드백은 redirect URL 파라미터로 (?err=...) — 가벼운 패턴.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

function nullify(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

function errParam(tab: string, msg: string): string {
  return `/admin/faqs?tab=${tab}&err=${encodeURIComponent(msg)}`;
}

// ─── staff_manuals CRUD ──────────────────────────────────
export async function upsertStaffManualAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("staff", "권한 없음"));

  const id = nullify(formData.get("id"));
  const numberRaw = nullify(formData.get("number"));
  const title = nullify(formData.get("title"));
  const category = nullify(formData.get("category"));
  const content = nullify(formData.get("content"));

  if (!title) redirect(errParam("staff", "제목 필수"));
  if (!content) redirect(errParam("staff", "본문 필수"));

  const number = numberRaw ? parseInt(numberRaw, 10) : null;
  if (number != null && (isNaN(number) || number < 0)) {
    redirect(errParam("staff", "번호는 양수여야 합니다"));
  }

  const searchText = content!
    .replace(/[#*`\[\]()|>\-=]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);

  const supabase = await createClient();

  if (id) {
    const payload: Record<string, unknown> = { title, category, content, search_text: searchText };
    if (number != null) payload.number = number;
    const { error } = await supabase.from("staff_manuals").update(payload).eq("id", id);
    if (error) redirect(errParam("staff", `저장 실패: ${error.message}`));
  } else {
    let nextNumber = number;
    if (nextNumber == null) {
      const { data: maxRow } = await supabase
        .from("staff_manuals")
        .select("number")
        .order("number", { ascending: false })
        .limit(1)
        .single();
      nextNumber = (maxRow?.number ?? 0) + 1;
    }
    const { error } = await supabase.from("staff_manuals").insert({
      number: nextNumber,
      title,
      category,
      content,
      search_text: searchText,
    });
    if (error) redirect(errParam("staff", `저장 실패: ${error.message}`));
  }

  revalidatePath("/admin/faqs");
  revalidatePath("/staff/manuals");
  redirect(`/admin/faqs?tab=staff${id ? `&edit=${id}` : ""}&ok=1`);
}

export async function deleteStaffManualAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("staff", "권한 없음"));
  const id = nullify(formData.get("id"));
  if (!id) redirect(errParam("staff", "id 누락"));

  const supabase = await createClient();
  await supabase.from("staff_manuals").delete().eq("id", id);

  revalidatePath("/admin/faqs");
  revalidatePath("/staff/manuals");
  redirect("/admin/faqs?tab=staff&ok=1");
}

// ─── internal_faqs 부분 편집 (question/card_text/internal_data/wilson_note 만) ─
export async function updateInternalFaqAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("internal", "권한 없음"));
  const id = nullify(formData.get("id"));
  if (!id) redirect(errParam("internal", "id 누락"));

  const payload = {
    question: nullify(formData.get("question")),
    card_text: nullify(formData.get("card_text")),
    internal_data: nullify(formData.get("internal_data")),
    wilson_note: nullify(formData.get("wilson_note")),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("internal_faqs").update(payload).eq("id", id);
  if (error) redirect(errParam("internal", `저장 실패: ${error.message}`));

  revalidatePath("/admin/faqs");
  redirect(`/admin/faqs?tab=internal&edit=${id}&ok=1`);
}
