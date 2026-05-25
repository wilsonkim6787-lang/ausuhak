import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentTabNav from "@/components/admin/StudentTabNav";
import StudentAvatar from "@/components/admin/StudentAvatar";

// 학생 상세 공통 레이아웃: 헤더(이름 / Stage / Alerts) + 탭 nav + 자식 콘텐츠.
// 각 탭 page는 자체적으로 student 데이터 다시 fetch (Supabase 요청 중복은 ms 단위라 무시).
export default async function StudentDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, name, current_stage, lead_status, is_medical, wilson_alerts, photo_path")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const name = data.name?.trim() || "이름 미입력";
  const alerts = data.wilson_alerts ?? [];

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/students"
        className="text-xs font-semibold text-navy-700 hover:text-gold-600"
      >
        ← 학생 목록으로
      </Link>

      <header className="flex flex-wrap items-center gap-3">
        <StudentAvatar name={data.name} photoPath={data.photo_path} size="lg" />
        <div className="flex flex-wrap items-center gap-2">
          <h1 className={`font-display text-3xl font-bold ${data.name ? "text-navy-900" : "text-ink-500"}`}>
            {name}
          </h1>
          {data.is_medical && (
            <span className="rounded-full bg-error/15 px-3 py-1 text-xs font-semibold text-error">
              🩺 의대
            </span>
          )}
          <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white">
            Stage {data.current_stage}
          </span>
          <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-navy-700">
            {data.lead_status}
          </span>
          {alerts.length > 0 && (
            <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
              🚨 Wilson Alert {alerts.length}
            </span>
          )}
        </div>
      </header>

      <StudentTabNav studentId={id} />

      {children}
    </div>
  );
}
