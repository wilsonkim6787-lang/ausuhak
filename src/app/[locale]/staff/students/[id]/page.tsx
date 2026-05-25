// 직원이 본인 담당 학생 1명을 보는 페이지 (read-only).
// RLS = students_assigned_select가 본인 담당 학생만 허용.
// 학생 정보 수정 / Wilson 메모 / 결제 / 비자 / 설정 = X.

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/requireStaff";
import { STAGES } from "@/lib/stages";
import StudentAvatar from "@/components/admin/StudentAvatar";

type Student = {
  id: string;
  name: string | null;
  kakao_id: string | null;
  phone: string | null;
  email: string | null;
  age: number | null;
  age_range: string | null;
  education: string | null;
  english_level: string | null;
  preferred_region: string | null;
  major: string | null;
  budget_range: string | null;
  current_stage: number;
  lead_status: string | null;
  is_medical: boolean;
  medical_pathway: string | null;
  wilson_alerts: string[] | null;
  source: string | null;
  photo_path: string | null;
  created_at: string;
};

type Assignment = {
  role: "primary" | "shared" | "observer";
};

type Deadline = {
  id: string;
  deadline_type: string;
  deadline_date: string | null;
  status: string | null;
};

type Document = {
  id: string;
  doc_type: string;
  status: string | null;
  note: string | null;
};

export default async function StaffStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireStaff();

  const supabase = await createClient();

  const [studentRes, assignRes, deadlinesRes, docsRes] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, name, kakao_id, phone, email, age, age_range, education, english_level, preferred_region, major, budget_range, current_stage, lead_status, is_medical, medical_pathway, wilson_alerts, source, photo_path, created_at",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("student_assignments")
      .select("role")
      .eq("student_id", id)
      .eq("staff_id", user.id)
      .is("released_at", null)
      .maybeSingle(),
    supabase
      .from("critical_deadlines")
      .select("id, deadline_type, deadline_date, status")
      .eq("student_id", id)
      .not("status", "in", "(completed,expired)")
      .order("deadline_date", { ascending: true })
      .limit(10),
    supabase
      .from("documents")
      .select("id, doc_type, status, note")
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (studentRes.error || !studentRes.data) notFound();

  const s = studentRes.data as Student;
  const role = (assignRes.data as Assignment | null)?.role ?? "observer";
  const deadlines = (deadlinesRes.data ?? []) as Deadline[];
  const docs = (docsRes.data ?? []) as Document[];

  const stage = STAGES.find((st) => st.num === s.current_stage);
  const alerts = s.wilson_alerts ?? [];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/staff/students"
        className="text-xs font-semibold text-navy-700 hover:text-gold-600"
      >
        ← 담당 학생 목록
      </Link>

      <header className="flex flex-wrap items-center gap-3">
        <StudentAvatar name={s.name} photoPath={s.photo_path} size="lg" />
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-3xl font-bold text-navy-900">
            {s.name?.trim() || "이름 미입력"}
          </h1>
          {s.is_medical && (
            <span className="rounded-full bg-error/15 px-3 py-1 text-xs font-semibold text-error">
              🩺 의대 ({s.medical_pathway ?? "-"})
            </span>
          )}
          <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-semibold text-white">
            Stage {s.current_stage}
          </span>
          <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-navy-700">
            {s.lead_status ?? "-"}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              role === "primary"
                ? "bg-navy-900 text-white"
                : role === "shared"
                ? "bg-success/15 text-success"
                : "bg-cream-300 text-ink-700"
            }`}
          >
            본인 권한: {role}
          </span>
          {alerts.length > 0 && (
            <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
              🚨 Alert {alerts.length}건
            </span>
          )}
        </div>
      </header>

      {role === "observer" && (
        <p className="rounded-2xl border border-cream-300 bg-cream-100/40 px-4 py-3 text-xs text-ink-700">
          ⚠️ 관찰 권한입니다 — 학생 정보 수정 / 메모 작성은 차단됩니다. 학습 목적.
        </p>
      )}

      {/* 기본 정보 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-5">
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">기본 정보</h2>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Field label="나이" value={s.age != null ? `${s.age}세 (${s.age_range})` : "-"} />
          <Field label="학력" value={s.education ?? "-"} />
          <Field label="영어" value={s.english_level ?? "-"} />
          <Field label="희망 지역" value={s.preferred_region ?? "-"} />
          <Field label="희망 전공" value={s.major ?? "-"} />
          <Field label="예산" value={s.budget_range ?? "-"} />
          <Field label="카톡 ID" value={s.kakao_id ?? "-"} />
          <Field label="전화" value={s.phone ?? "-"} />
          <Field label="이메일" value={s.email ?? "-"} />
          <Field label="진입 경로" value={s.source ?? "-"} />
          <Field label="현재 단계" value={stage?.label ?? "-"} />
          <Field
            label="등록일"
            value={new Date(s.created_at).toLocaleDateString("ko-KR")}
          />
        </dl>
      </section>

      {/* 마감일 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-5">
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          ⏰ 마감일 ({deadlines.length})
        </h2>
        {deadlines.length === 0 ? (
          <p className="text-sm text-ink-500">등록된 마감일이 없습니다.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {deadlines.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-cream-200 bg-cream-100/40 px-3 py-2"
              >
                <span className="font-medium text-navy-900">{d.deadline_type}</span>
                <span className="text-xs text-ink-500">
                  {d.deadline_date} · {d.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 서류 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-5">
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          📁 서류 ({docs.length})
        </h2>
        {docs.length === 0 ? (
          <p className="text-sm text-ink-500">제출된 서류가 없습니다.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {docs.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-cream-200 bg-cream-100/40 px-3 py-2"
              >
                <span className="font-medium text-navy-900">{d.doc_type}</span>
                <span className="text-xs text-ink-500">{d.status ?? "-"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-[11px] text-ink-500">
        ⚠️ 직원 페이지는 read-only. 학생 정보 수정·메모 작성은 Wilson 또는 본인 담당 학생의 admin 위임 권한 부여 후.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-navy-900">{value}</dd>
    </div>
  );
}
