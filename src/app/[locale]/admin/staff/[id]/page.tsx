// 직원 상세 — 권한 16개 toggle + 담당 학생 + activity log link.

import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import StudentAvatar from "@/components/admin/StudentAvatar";
import PermissionPanel from "./PermissionPanel";

type StaffRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
};

type PermRow = {
  permission_key: string;
  value: boolean;
  revoked_at: string | null;
};

type AssignedRow = {
  student_id: string;
  role: string;
  students: { id: string; name: string | null; photo_path: string | null; current_stage: number; lead_status: string | null } | null;
};

const PERM_GROUPS: { group: string; keys: { key: string; label: string }[] }[] = [
  {
    group: "학생 정보",
    keys: [
      { key: "view_all_students", label: "전체 학생 조회" },
      { key: "edit_student_info", label: "학생 정보 편집" },
      { key: "check_documents",   label: "서류 확인" },
      { key: "upload_offer",      label: "합격증 업로드" },
    ],
  },
  {
    group: "결제·견적",
    keys: [
      { key: "confirm_payment", label: "결제 확정" },
      { key: "create_quote",    label: "견적서 생성" },
    ],
  },
  {
    group: "메모·소통",
    keys: [
      { key: "write_shared_memo", label: "공유 메모 작성" },
      { key: "send_kakao_alert",  label: "카톡 알림 발송" },
    ],
  },
  {
    group: "콘텐츠",
    keys: [
      { key: "view_manuals",       label: "매뉴얼 조회" },
      { key: "edit_manuals",       label: "매뉴얼 편집" },
      { key: "view_internal_faqs", label: "내부 FAQ 조회" },
      { key: "edit_internal_faqs", label: "내부 FAQ 편집" },
      { key: "write_blog",         label: "블로그 작성" },
      { key: "publish_blog",       label: "블로그 발행" },
    ],
  },
  {
    group: "관리자",
    keys: [
      { key: "view_stats",                       label: "통계 조회" },
      { key: "manage_other_staff_permissions",   label: "타 직원 권한 관리" },
    ],
  },
];

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const [staffRes, permsRes, assignRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .eq("id", id)
      .single(),
    supabase
      .from("staff_permissions")
      .select("permission_key, value, revoked_at")
      .eq("user_id", id),
    supabase
      .from("student_assignments")
      .select("student_id, role, students(id, name, photo_path, current_stage, lead_status)")
      .eq("staff_id", id)
      .is("released_at", null),
  ]);

  if (staffRes.error || !staffRes.data) notFound();
  const staff = staffRes.data as StaffRow;
  if (staff.role !== "staff") notFound();

  const perms = (permsRes.data ?? []) as PermRow[];
  const permMap: Record<string, boolean> = {};
  for (const p of perms) {
    permMap[p.permission_key] = p.value && !p.revoked_at;
  }

  const assignedRaw = (assignRes.data ?? []) as unknown as AssignedRow[];

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/staff"
        className="text-xs font-semibold text-navy-700 hover:text-gold-600"
      >
        ← 직원 목록으로
      </Link>

      <header className="flex flex-wrap items-center gap-3">
        <StudentAvatar name={staff.name} photoPath={null} size="lg" />
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-bold text-navy-900">
            {staff.name?.trim() || "이름 미입력"}
          </h1>
          <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-gold-400">
            STAFF
          </span>
          {staff.email && (
            <span className="text-sm text-ink-500">{staff.email}</span>
          )}
        </div>
      </header>

      <div className="flex gap-2">
        <Link
          href={`/admin/activity?user=${staff.id}`}
          className="rounded-full border border-cream-300 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-cream-100"
        >
          🛡️ 이 직원 활동 로그
        </Link>
      </div>

      {/* 권한 panel */}
      <PermissionPanel
        staffId={staff.id}
        initialPerms={permMap}
        groups={PERM_GROUPS}
      />

      {/* 담당 학생 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">
          🎓 담당 학생 ({assignedRaw.length}명)
        </h2>
        {assignedRaw.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            담당 학생이 없습니다. 학생 상세의 "담당 관리" 탭에서 배정 (Phase 2 후속).
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {assignedRaw.map((a) => {
              const s = a.students;
              if (!s) return null;
              return (
                <li key={a.student_id}>
                  <Link
                    href={`/admin/students/${s.id}`}
                    className="flex items-center gap-3 rounded-xl border border-cream-300 bg-cream-100/40 p-3 hover:bg-cream-200"
                  >
                    <StudentAvatar name={s.name} photoPath={s.photo_path} size="sm" />
                    <span className="flex-1 text-sm font-semibold text-navy-900">
                      {s.name?.trim() || "이름 미입력"}
                    </span>
                    <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-semibold text-gold-500">
                      Stage {s.current_stage}
                    </span>
                    <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold text-gold-700">
                      {a.role}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
