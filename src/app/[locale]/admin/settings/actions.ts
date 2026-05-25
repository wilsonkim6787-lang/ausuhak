"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";

export type SettingsState = { ok?: boolean; error?: string };
export type NoticeState = { ok?: boolean; error?: string };

// 메인 페이지 공지 팝업 저장 (site_settings 4 키 upsert).
export async function saveNoticeAction(
  _prev: NoticeState,
  formData: FormData,
): Promise<NoticeState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한 없음" };

  const active = formData.get("active") === "on";
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const bump = formData.get("bump_version") === "on";
  const versionRaw = parseInt(String(formData.get("version") ?? "1"), 10) || 1;
  const version = bump ? versionRaw + 1 : versionRaw;

  const supabase = await createClient();
  const rows = [
    { key: "notice_active", value: active ? "true" : "false", category: "notice", is_public: false },
    { key: "notice_title",  value: title || null,             category: "notice", is_public: false },
    { key: "notice_body",   value: body || null,              category: "notice", is_public: false },
    { key: "notice_version", value: String(version),          category: "notice", is_public: false },
  ];
  const { error } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout"); // 메인 페이지 즉시 갱신
  return { ok: true };
}

// site_settings + branches 일괄 저장 server action.
// FormData prefix 규약:
//   - 'ko:<setting_key>'      → site_settings.value
//   - 'en:<setting_key>'      → site_settings.value_en
//   - 'branch:<slug>:<field>' → branches.<field>
export async function saveSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") {
    return { error: "권한이 없습니다." };
  }

  const settingUpdates = new Map<
    string,
    { value?: string | null; value_en?: string | null }
  >();
  const branchUpdates = new Map<string, Record<string, string | null>>();

  const toNullable = (raw: FormDataEntryValue): string | null => {
    const s = String(raw).trim();
    return s === "" ? null : s;
  };

  for (const [key, val] of formData.entries()) {
    // site_settings 항목
    const setMatch = key.match(/^(ko|en):(.+)$/);
    if (setMatch) {
      const [, locale, settingKey] = setMatch;
      const cur = settingUpdates.get(settingKey) ?? {};
      if (locale === "ko") cur.value = toNullable(val);
      else cur.value_en = toNullable(val);
      settingUpdates.set(settingKey, cur);
      continue;
    }

    // branches 항목
    const brMatch = key.match(/^branch:([^:]+):(.+)$/);
    if (brMatch) {
      const [, slug, field] = brMatch;
      const cur = branchUpdates.get(slug) ?? {};
      cur[field] = toNullable(val);
      branchUpdates.set(slug, cur);
    }
  }

  if (settingUpdates.size === 0 && branchUpdates.size === 0) {
    return { error: "변경할 항목이 없습니다." };
  }

  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  // site_settings 병렬 UPDATE
  const settingPromises = Array.from(settingUpdates.entries()).map(
    ([k, { value, value_en }]) =>
      supabase
        .from("site_settings")
        .update({
          value: value ?? null,
          value_en: value_en ?? null,
          updated_by: user.id,
          updated_at: nowIso,
        })
        .eq("key", k),
  );

  // branches 병렬 UPDATE (허용 컬럼만 화이트리스트)
  const ALLOWED_BRANCH_FIELDS = new Set([
    "name",
    "name_en",
    "address",
    "address_en",
    "phone",
    "email",
    "business_hours",
    "business_hours_en",
  ]);
  const branchPromises = Array.from(branchUpdates.entries()).map(([slug, fields]) => {
    const payload: Record<string, string | null> = {};
    for (const [f, v] of Object.entries(fields)) {
      if (ALLOWED_BRANCH_FIELDS.has(f)) payload[f] = v;
    }
    return supabase
      .from("branches")
      .update({ ...payload, updated_by: user.id, updated_at: nowIso })
      .eq("slug", slug);
  });

  const results = await Promise.all([...settingPromises, ...branchPromises]);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) {
    return { error: `저장 실패: ${firstError.error.message}` };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
