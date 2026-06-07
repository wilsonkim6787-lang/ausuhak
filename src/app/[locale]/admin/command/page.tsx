// /admin 통합 명령창 (BLOCK — 단계 변경 → 마이페이지 반영 → 카톡 발송 대기).
import { setRequestLocale } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import CommandBar from "./CommandBar";
import { markNotificationSent } from "./actions";
import CopyButton from "@/components/admin/CopyButton";

type NotifRow = {
  id: string;
  message: string;
  stage_key: string | null;
  created_at: string;
  students: { name: string | null; kakao_id: string | null } | null;
};

export default async function AdminCommandPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const admin = createAdminClient();

  const [studentsRes, actionsRes, notifRes] = await Promise.all([
    admin.from("students").select("id, name").order("updated_at", { ascending: false }).limit(1000),
    admin.from("stage_actions").select("stage_key, label").order("sort_order", { ascending: true }),
    admin
      .from("notifications")
      .select("id, message, stage_key, created_at, students(name, kakao_id)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // 마이그레이션 036 미적용 감지
  const migrationMissing =
    (actionsRes.error?.message ?? "").includes("does not exist") ||
    (notifRes.error?.message ?? "").includes("does not exist");

  const students = (studentsRes.data ?? []).map((s) => ({
    id: s.id,
    name: s.name?.trim() || "이름 미입력",
  }));
  const actions = (actionsRes.data ?? []) as { stage_key: string; label: string }[];
  const pending = (notifRes.data ?? []) as unknown as NotifRow[];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">관리자</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">⚡ 통합 명령창</h1>
        <p className="mt-1 text-sm text-ink-500">
          학생 단계를 한 번에 반영하고, 카톡 안내를 발송 대기에 모읍니다.
        </p>
      </header>

      {migrationMissing ? (
        <div className="rounded-2xl border border-error/30 bg-error/5 p-5 text-sm text-error">
          <p className="font-semibold">마이그레이션 036 적용 필요</p>
          <p className="mt-1 text-error/80">
            Supabase SQL Editor에서{" "}
            <code className="rounded bg-error/10 px-1">supabase/migrations/036_stage_actions_notifications.sql</code>{" "}
            를 실행하면 명령창이 활성화됩니다.
          </p>
        </div>
      ) : (
        <>
          <CommandBar students={students} actions={actions} />

          {/* 발송 대기 (B = 수동 카톡 발송) */}
          <section>
            <h2 className="mb-3 font-display text-base font-bold text-navy-900">
              📤 카톡 발송 대기 {pending.length > 0 && <span className="text-ink-500">{pending.length}건</span>}
            </h2>

            {pending.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-cream-300 bg-cream-100/40 px-4 py-4 text-sm text-ink-500">
                발송 대기 중인 알림이 없어요.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pending.map((n) => (
                  <li
                    key={n.id}
                    className="flex flex-col gap-2 rounded-2xl border-l-4 border-gold-500 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm font-bold text-navy-900">
                        {n.students?.name?.trim() || "이름 미입력"}
                      </span>
                      <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium text-navy-700">
                        {n.stage_key}
                      </span>
                      <span className="ml-auto text-[11px] text-ink-500">
                        {new Date(n.created_at).toLocaleString("ko-KR")}
                      </span>
                    </div>
                    <p className="whitespace-pre-line rounded-lg bg-cream-100/60 px-3 py-2 text-sm text-navy-800">
                      {n.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <CopyButton value={n.message} label="💬 메시지 복사" copiedLabel="복사됨" />
                      {n.students?.kakao_id && (
                        <CopyButton
                          value={n.students.kakao_id}
                          label={`📋 ${n.students.kakao_id}`}
                          copiedLabel="ID 복사됨"
                        />
                      )}
                      <form action={markNotificationSent} className="ml-auto">
                        <input type="hidden" name="notification_id" value={n.id} />
                        <button
                          type="submit"
                          className="rounded-full bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-700"
                        >
                          발송 완료
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
