"use server";

// /admin/sites server actions — super_admin 만.
// search_text 는 (name + description + category + section) 합쳐서 자동 생성.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

function nullify(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

function errParam(msg: string, edit?: string | null): string {
  const editQs = edit ? `&edit=${edit}` : "";
  return `/admin/sites?err=${encodeURIComponent(msg)}${editQs}`;
}

function makeSearchText(parts: Array<string | null>): string {
  const s = parts.filter((p) => p && p.trim()).join(" ");
  return s.replace(/\s+/g, " ").trim().slice(0, 2000);
}

export async function upsertMonitoringSiteAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("권한 없음"));

  const id = nullify(formData.get("id"));
  const sheet = nullify(formData.get("sheet"));
  const section = nullify(formData.get("section"));
  const category = nullify(formData.get("category"));
  const name = nullify(formData.get("name"));
  const url = nullify(formData.get("url"));
  const description = nullify(formData.get("description"));
  const displayOrderRaw = nullify(formData.get("display_order"));

  if (!sheet) redirect(errParam("시트 필수", id));
  if (!name) redirect(errParam("사이트명 필수", id));
  if (!url) redirect(errParam("URL 필수", id));

  let displayOrder = 0;
  if (displayOrderRaw) {
    const n = parseInt(displayOrderRaw, 10);
    if (isNaN(n)) redirect(errParam("정렬 숫자 오류", id));
    displayOrder = n;
  }

  const searchText = makeSearchText([name, description, category, section]);

  const supabase = await createClient();

  if (id) {
    const { error } = await supabase
      .from("monitoring_sites")
      .update({
        sheet,
        section,
        category,
        name,
        url,
        description,
        search_text: searchText,
        display_order: displayOrder,
      })
      .eq("id", id);
    if (error) redirect(errParam(`저장 실패: ${error.message}`, id));
    revalidatePath("/admin/sites");
    revalidatePath("/staff/sites");
    redirect(`/admin/sites?edit=${id}&ok=1`);
  } else {
    // 신규 = display_order 자동 (해당 시트 max + 1) — 입력값 있으면 그 값 사용
    if (!displayOrderRaw) {
      const { data: maxRow } = await supabase
        .from("monitoring_sites")
        .select("display_order")
        .eq("sheet", sheet)
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      displayOrder = (maxRow?.display_order ?? 0) + 1;
    }

    const { data: inserted, error } = await supabase
      .from("monitoring_sites")
      .insert({
        sheet,
        section,
        category,
        name,
        url,
        description,
        search_text: searchText,
        display_order: displayOrder,
      })
      .select("id")
      .single();
    if (error) redirect(errParam(`저장 실패: ${error.message}`));
    revalidatePath("/admin/sites");
    revalidatePath("/staff/sites");
    redirect(`/admin/sites?edit=${inserted.id}&ok=1`);
  }
}

export async function deleteMonitoringSiteAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect(errParam("권한 없음"));
  const id = nullify(formData.get("id"));
  if (!id) redirect(errParam("id 누락"));

  const supabase = await createClient();
  const { error } = await supabase.from("monitoring_sites").delete().eq("id", id);
  if (error) redirect(errParam(`삭제 실패: ${error.message}`, id));

  revalidatePath("/admin/sites");
  revalidatePath("/staff/sites");
  redirect("/admin/sites?ok=1");
}
