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
  // is_public: true 필수 — 홈페이지는 anon(비로그인) 클라이언트로 읽고,
  // RLS(settings_public_select)가 is_public=true 행만 허용. false면 공지가 방문자에게 안 보임.
  const rows = [
    { key: "notice_active", value: active ? "true" : "false", category: "notice", is_public: true },
    { key: "notice_title",  value: title || null,             category: "notice", is_public: true },
    { key: "notice_body",   value: body || null,              category: "notice", is_public: true },
    { key: "notice_version", value: String(version),          category: "notice", is_public: true },
    // 직접 입력으로 저장하면 이전에 걸어둔 블로그 연결을 해제 —
    // 안 지우면 setMainNoticeAction 이 남긴 notice_slug 가 살아남아 팝업이 옛 글로 링크됨
    { key: "notice_slug",    value: null, category: "notice", is_public: true },
    { key: "notice_blog_id", value: null, category: "notice", is_public: true },
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

  // site_settings 병렬 UPDATE.
  // 제출된 필드만 갱신 — en 입력이 없는(한국어 전용) 필드 저장 시 value_en 을
  // null 로 덮어써 seed 영문값이 지워지던 문제 방지. (undefined=미제출 / null=명시적 비움)
  const settingPromises = Array.from(settingUpdates.entries()).map(
    ([k, { value, value_en }]) => {
      const payload: Record<string, string | null> = {
        updated_by: user.id,
        updated_at: nowIso,
      };
      if (value !== undefined) payload.value = value;
      if (value_en !== undefined) payload.value_en = value_en;
      return supabase.from("site_settings").update(payload).eq("key", k);
    },
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
