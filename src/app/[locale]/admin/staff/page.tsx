// 👥 직원 관리 — staff role 사용자 목록 + 권한·담당·활동 요약.
// 신규 직원 추가 = Wilson가 supabase users 에서 role='staff' 로 변경 (auth 통합 v2).

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import StudentAvatar from "@/components/admin/StudentAvatar";
import CreateStaffForm from "./CreateStaffForm";

type StaffRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
};

type PermRow = { user_id: string; permission_key: string; value: boolean; revoked_at: string | null };
type AssignmentRow = { staff_id: string | null; student_id: string; released_at: string | null };
type ActivityRow = { user_id: string | null; created_at: string };

export default async function AdminStaffPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  const [staffRes, permsRes, assignRes, actRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .eq("role", "staff")
      .order("created_at", { ascending: true }),
    supabase
      .from("staff_permissions")
      .select("user_id, permission_key, value, revoked_at"),
    supabase
      .from("student_assignments")
      .select("staff_id, student_id, released_at")
      .is("released_at", null),
    supabase
      .from("activity_logs")
      .select("user_id, created_at")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString())
      .limit(5000),
  ]);

  if (staffRes.error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold text-navy-900">👥 직원 관리</h1>
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          <p className="font-semibold">직원 조회 실패</p>
          <p className="mt-2 font-mono text-xs">{staffRes.error.message}</p>
        </div>
      </div>
    );
  }

  const staff = (staffRes.data ?? []) as StaffRow[];
  const perms = (permsRes.data ?? []) as PermRow[];
  const assignments = (assignRes.data ?? []) as AssignmentRow[];
  const activities = (actRes.data ?? []) as ActivityRow[];

  const activePermsByStaff = new Map<string, number>();
  for (const p of perms) {
    if (p.value && !p.revoked_at) {
      activePermsByStaff.set(p.user_id, (activePermsByStaff.get(p.user_id) ?? 0) + 1);
    }
  }
  const assignedByStaff = new Map<string, number>();
  for (const a of assignments) {
    if (a.staff_id) assignedByStaff.set(a.staff_id, (assignedByStaff.get(a.staff_id) ?? 0) + 1);
  }
  const activityByStaff = new Map<string, number>();
  for (const a of activities) {
    if (a.user_id) activityByStaff.set(a.user_id, (activityByStaff.get(a.user_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          관리자 · 직원
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          👥 직원 관리
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          staff role 사용자 {staff.length}명. 클릭 → 권한 16개 · 담당 학생 · 활동 로그 link.
        </p>
      </header>

      {/* 신규 직원 추가 — 인라인 폼 */}
      <CreateStaffForm />

      {/* 직원 list */}
      {staff.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center">
          <p className="text-4xl">👥</p>
          <p className="mt-3 font-display text-lg font-bold text-navy-900">
            직원이 없습니다
          </p>
          <p className="mt-1 text-sm text-ink-500">
            현재 Wilson(super_admin) 단독 운영. 위 안내에 따라 직원 추가 후 자동 표시됩니다.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {staff.map((s) => {
            const permCount = activePermsByStaff.get(s.id) ?? 0;
            const assignedCount = assignedByStaff.get(s.id) ?? 0;
            const activityCount = activityByStaff.get(s.id) ?? 0;
            return (
              <li key={s.id}>
                <Link
                  href={`/admin/staff/${s.id}`}
                  className="flex gap-3 rounded-xl border border-cream-300 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <StudentAvatar name={s.name} photoPath={null} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-display text-base font-bold text-navy-900">
                          {s.name?.trim() || "이름 미입력"}
                        </span>
                        {s.email && (
                          <span className="ml-2 text-xs text-ink-500">{s.email}</span>
                        )}
                      </div>
                      <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-[10px] font-semibold text-gold-500">
                        STAFF
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      <span className="text-ink-700">
                        🔑 권한 <strong>{permCount}</strong>/16
                      </span>
                      <span className="text-ink-700">
                        🎓 담당 학생 <strong>{assignedCount}</strong>명
                      </span>
                      <span className="text-ink-700">
                        🛡️ 최근 30일 활동 <strong>{activityCount}</strong>건
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
