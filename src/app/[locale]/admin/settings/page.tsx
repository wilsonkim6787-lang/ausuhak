import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import SettingsForm, { type SettingRow, type BranchRow } from "./SettingsForm";
import NoticePanel from "./NoticePanel";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  const [settingsRes, branchesRes] = await Promise.all([
    supabase
      .from("site_settings")
      .select("key, value, value_en, category, is_public, updated_at")
      .order("category")
      .order("id"),
    supabase
      .from("branches")
      .select(
        "slug, sort_order, name, name_en, address, address_en, phone, email, business_hours, business_hours_en",
      )
      .order("sort_order"),
  ]);

  if (settingsRes.error || branchesRes.error) {
    return (
      <div className="rounded-2xl border border-error/30 bg-error/10 p-6 text-sm text-error">
        설정 로드 실패: {settingsRes.error?.message ?? branchesRes.error?.message}
      </div>
    );
  }

  const allRows = (settingsRes.data ?? []) as SettingRow[];
  const noticeMap = new Map(allRows.filter((r) => r.category === "notice").map((r) => [r.key, r.value]));
  const noticeDefaults = {
    active: noticeMap.get("notice_active") === "true",
    title: noticeMap.get("notice_title") ?? "",
    body: noticeMap.get("notice_body") ?? "",
    version: parseInt(noticeMap.get("notice_version") ?? "1", 10) || 1,
  };
  const generalRows = allRows.filter((r) => r.category !== "notice");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          관리자 · Phase 1
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          ⚙️ 사이트 설정
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          회사 정보·지사·카카오·영업 시간·가격·공지. 저장하면 사이트에 즉시 반영됩니다.
        </p>
      </header>

      <NoticePanel defaults={noticeDefaults} />

      <SettingsForm
        rows={generalRows}
        branches={(branchesRes.data ?? []) as BranchRow[]}
      />
    </div>
  );
}
