import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentTabNav from "@/components/admin/StudentTabNav";
import StudentAvatar from "@/components/admin/StudentAvatar";
import CopyButton from "@/components/admin/CopyButton";
import { PHASES } from "@/lib/progress";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

// 학생 상세 공통 레이아웃 (BLOCK 4): 한 줄 헤더 + 3탭 + 보조 링크.
export default async function StudentDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [studentRes, assignRes, unreadRes] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, name, age_range, major, kakao_id, current_stage, lead_status, is_medical, wilson_alerts, photo_path",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("student_assignments")
      .select("staff_id")
      .eq("student_id", id)
      .is("released_at", null)
      .eq("role", "primary")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("student_messages")
      .select("id", { count: "exact", head: true })
      .eq("student_id", id)
      .eq("sender_role", "student")
      .is("read_at", null),
  ]);
  const unreadMessages = unreadRes.count ?? 0;

  const { data, error } = studentRes;
  if (error || !data) notFound();

  let managerName: string | null = null;
  if (assignRes.data?.staff_id) {
    const { data: u } = await supabase
      .from("users")
      .select("name")
      .eq("id", assignRes.data.staff_id)
      .maybeSingle();
    managerName = u?.name ?? null;
  }

  const name = data.name?.trim() || "이름 미입력";
  const alerts = (data.wilson_alerts ?? []) as unknown[];
  const phaseIdx = Math.max(
    0,
    PHASES.findIndex((p) => p.substeps.some((s) => s.stage === data.current_stage)),
  );
  const stagePill = `${CIRCLED[phaseIdx] ?? ""} ${PHASES[phaseIdx]?.label ?? "?"} 단계`;

  const subParts = [
    data.major?.trim() || null,
    `담당 ${managerName ?? "미배정"}`,
    data.lead_status || null,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/admin/students"
        className="text-xs font-semibold text-navy-700 hover:text-gold-600"
      >
        ← 학생 목록으로
      </Link>

      {/* 한 줄 헤더 */}
      <header className="flex flex-wrap items-center gap-3 rounded-2xl border border-cream-300 bg-white px-4 py-3 shadow-sm">
        <StudentAvatar name={data.name} photoPath={data.photo_path} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className={`font-display text-xl font-bold ${data.name ? "text-navy-900" : "text-ink-500"}`}>
              {name}
            </h1>
            {data.age_range && (
              <span className="text-sm text-ink-500">{data.age_range}</span>
            )}
            {data.is_medical && (
              <span className="rounded-full bg-error/15 px-2 py-0.5 text-[11px] font-semibold text-error">
                🩺 의대
              </span>
            )}
            {alerts.length > 0 && (
              <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-600">
                🚨 Alert {alerts.length}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-500">{subParts.join(" · ")}</p>
        </div>

        <span className="shrink-0 rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white">
          {stagePill}
        </span>

        {data.kakao_id && (
          <CopyButton
            value={data.kakao_id}
            label={`💬 ${data.kakao_id}`}
            copiedLabel="ID 복사됨"
          />
        )}
      </header>

      {/* 4탭 (진행/서류/메시지/메모) */}
      <StudentTabNav studentId={id} unreadMessages={unreadMessages} />

      {/* 보조 링크 (3탭 외 화면) */}
      <div className="flex flex-wrap gap-3 text-xs text-ink-500">
        {[
          { href: "/applications", label: "학교 지원" },
          { href: "/deadlines", label: "마감일" },
          { href: "/payments", label: "결제" },
        ].map((l) => (
          <Link
            key={l.href}
            href={`/admin/students/${id}${l.href}`}
            className="rounded-full border border-cream-300 bg-cream-100 px-3 py-1 font-medium text-navy-700 hover:bg-cream-200"
          >
            {l.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
