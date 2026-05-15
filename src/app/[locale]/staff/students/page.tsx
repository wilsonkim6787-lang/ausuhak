// 직원의 담당 학생 리스트 (PART G-4).
// student_assignments 에서 본인 staff_id로 필터 → students JOIN.
// RLS = students_assigned_select 도 동일 효과지만, 명시적으로 staff_id 조건 추가.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/requireStaff";

type Row = {
  role: "primary" | "shared" | "observer";
  assigned_at: string | null;
  students: {
    id: string;
    name: string | null;
    age_range: string | null;
    education: string | null;
    major: string | null;
    preferred_region: string | null;
    current_stage: number;
    lead_status: string | null;
    wilson_alerts: string[] | null;
    is_medical: boolean;
  } | null;
};

const ROLE_LABEL: Record<string, { label: string; bg: string }> = {
  primary: { label: "주담당", bg: "bg-navy-900 text-white" },
  shared: { label: "공유", bg: "bg-success/15 text-success" },
  observer: { label: "관찰", bg: "bg-cream-300 text-ink-700" },
};

export default async function StaffStudentsPage() {
  const user = await requireStaff();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_assignments")
    .select(
      "role, assigned_at, students(id, name, age_range, education, major, preferred_region, current_stage, lead_status, wilson_alerts, is_medical)",
    )
    .eq("staff_id", user.id)
    .is("released_at", null)
    .order("assigned_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
        담당 학생 조회 실패: {error.message}
      </div>
    );
  }

  const rows = (data ?? []) as unknown as Row[];
  const groups: Record<string, Row[]> = {
    primary: rows.filter((r) => r.role === "primary"),
    shared: rows.filter((r) => r.role === "shared"),
    observer: rows.filter((r) => r.role === "observer"),
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy-900">📋 담당 학생</h1>
        <p className="mt-1 text-sm text-ink-500">
          본인 담당 학생 {rows.length}명. RLS로 다른 직원·Wilson 담당 학생은 자동 차단.
        </p>
      </header>

      {(["primary", "shared", "observer"] as const).map((role) => {
        const list = groups[role];
        const meta = ROLE_LABEL[role];
        return (
          <section key={role}>
            <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-navy-900">
              <span className={`rounded-full px-2.5 py-0.5 text-xs ${meta.bg}`}>
                {meta.label}
              </span>
              <span>{list.length}명</span>
              {role === "primary" && (
                <span className="text-xs font-normal text-ink-500">
                  / 정원 15명
                </span>
              )}
            </h2>
            {list.length === 0 ? (
              <p className="rounded-2xl border border-cream-300 bg-cream-100/40 px-4 py-6 text-center text-sm text-ink-500">
                {meta.label} 학생이 없습니다.
              </p>
            ) : (
              <ul className="space-y-2">
                {list.map((r, i) => r.students && (
                  <li key={r.students.id}>
                    <StudentCard student={r.students} role={role} idx={i} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StudentCard({
  student,
  role,
  idx,
}: {
  student: NonNullable<Row["students"]>;
  role: "primary" | "shared" | "observer";
  idx: number;
}) {
  const alerts = student.wilson_alerts ?? [];
  return (
    <Link
      href={`/staff/students/${student.id}`}
      className="block rounded-2xl border border-cream-300 bg-white p-4 shadow-sm transition hover:border-navy-800/40 hover:shadow-md"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-display text-base font-semibold text-navy-900">
            #{(idx + 1).toString().padStart(3, "0")} {student.name?.trim() || "이름 미입력"}
          </p>
          <p className="mt-0.5 text-xs text-ink-500">
            {[student.education, student.major, student.preferred_region]
              .filter(Boolean)
              .join(" / ") || "정보 없음"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {student.is_medical && (
            <span className="rounded-full bg-error/15 px-2 py-0.5 text-[10px] font-semibold text-error">
              🩺 의대
            </span>
          )}
          <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-semibold text-white">
            Stage {student.current_stage}
          </span>
          <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium text-navy-700">
            {student.lead_status ?? "-"}
          </span>
          {alerts.length > 0 && (
            <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold text-gold-600">
              🚨 Alert {alerts.length}
            </span>
          )}
        </div>
      </div>
      {role === "observer" && (
        <p className="mt-2 rounded bg-cream-100 px-2 py-1 text-[10px] text-ink-500">
          ⚠️ 관찰 권한 = 메모 작성 X / 학생 정보 수정 X
        </p>
      )}
    </Link>
  );
}
