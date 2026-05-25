import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/requireStaff";

type AssignmentSummary = {
  role: string;
  student: {
    id: string;
    name: string | null;
    current_stage: number;
    lead_status: string | null;
    wilson_alerts: string[] | null;
  } | null;
};

export default async function StaffHomePage() {
  const user = await requireStaff();

  const supabase = await createClient();
  const { data: assigns } = await supabase
    .from("student_assignments")
    .select(
      "role, students(id, name, current_stage, lead_status, wilson_alerts)",
    )
    .eq("staff_id", user.id)
    .is("released_at", null);

  const rows = (assigns ?? []) as unknown as AssignmentSummary[];
  const primary = rows.filter((r) => r.role === "primary").length;
  const shared = rows.filter((r) => r.role === "shared").length;
  const observer = rows.filter((r) => r.role === "observer").length;
  const alertCount = rows.filter(
    (r) => r.student && (r.student.wilson_alerts?.length ?? 0) > 0,
  ).length;

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "Asia/Seoul",
  });

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          직원 페이지
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          🌅 오늘 할 일
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          {today} (KST) · 담당 학생 {rows.length}명
        </p>
      </header>

      {/* 본인 담당 통계 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="주담당" value={primary} hint="정원 15명 권장" />
        <Stat label="공유 담당" value={shared} hint="Wilson 또는 다른 직원과" />
        <Stat label="관찰 (학습)" value={observer} hint="메모 작성 X" />
        <Stat label="Alert 있는 학생" value={alertCount} highlight={alertCount > 0} />
      </section>

      {/* 빠른 메뉴 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <QuickLink href="/staff/students" icon="📋" label="담당 학생 리스트" />
        <QuickLink href="/staff/manuals" icon="📚" label="매뉴얼 검색" />
        <QuickLink href="/staff/faqs" icon="🔍" label="내부 FAQ" />
        <QuickLink href="/staff/sites" icon="🔗" label="자료 사이트" />
        <QuickLink href="/offers" icon="🏆" label="합격증·후기·졸업생" />
      </section>

      {/* 권한 안내 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-5">
        <h2 className="font-display text-base font-bold text-navy-900">권한 범위 안내</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
          <li>✅ 본인 담당 학생만 보기 (RLS 자동 차단)</li>
          <li>✅ 매뉴얼 / 내부 FAQ 열람 (Wilson 전용 메모는 마스킹)</li>
          <li>❌ Wilson 전용 메모 / 결제 확인 / 사이트 설정 / 의대 도구</li>
          <li>❌ 다른 직원의 KPI · 담당 학생</li>
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: number;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-gold-600/30 bg-gold-100/40" : "border-cream-300 bg-white"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-navy-900">{value}</p>
      {hint && <p className="mt-1 text-[10px] text-ink-500">{hint}</p>}
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 rounded-2xl border border-cream-300 bg-white px-4 py-5 text-navy-900 shadow-sm transition hover:border-navy-800/40 hover:shadow-md"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
