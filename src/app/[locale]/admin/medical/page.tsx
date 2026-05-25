// 🩺 의대 도구 — 의대 학생 + medical_pathway 그룹 + ISAT/MMI/GAMSAT deadline.
// schema 변경 없음 (students.is_medical / medical_pathway / critical_deadlines 활용).

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import StudentAvatar from "@/components/admin/StudentAvatar";

type MedStudent = {
  id: string;
  name: string | null;
  current_stage: number;
  lead_status: string | null;
  medical_pathway: string | null;
  photo_path: string | null;
  age_range: string | null;
  english_level: string | null;
  updated_at: string;
};

type Deadline = {
  student_id: string;
  deadline_type: string;
  deadline_date: string;
  note: string | null;
};

const PATHWAYS: { key: string; label: string; emoji: string; hint: string }[] = [
  { key: "direct",    emoji: "🎯", label: "Direct (본 과정)",     hint: "고등학생부터 의대 5~6년 — ISAT/UCAT + MMI" },
  { key: "undergrad", emoji: "🎓", label: "학부 → 의대",          hint: "학사 후 Graduate Entry MD" },
  { key: "graduate",  emoji: "📚", label: "대학원 → 의대",        hint: "대졸 후 GAMSAT" },
  { key: "converter", emoji: "🔄", label: "전공 전환",            hint: "워홀러·기존 학력 활용" },
  { key: "transfer",  emoji: "↪️",  label: "편입",                hint: "대학재학 → 의대 재진입" },
];

const PATHWAY_LABEL: Record<string, string> = Object.fromEntries(
  PATHWAYS.map((p) => [p.key, `${p.emoji} ${p.label}`]),
);

const MEDICAL_DEADLINE_TYPES = ["isat_test", "mmi_interview", "gamsat"];

const DEADLINE_LABEL: Record<string, string> = {
  isat_test:      "ISAT 시험",
  mmi_interview:  "MMI 인터뷰",
  gamsat:         "GAMSAT",
};

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 3600 * 1000));
}

export default async function AdminMedicalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  const studentsRes = await supabase
    .from("students")
    .select(
      "id, name, current_stage, lead_status, medical_pathway, photo_path, age_range, english_level, updated_at",
    )
    .eq("is_medical", true)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (studentsRes.error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold text-navy-900">🩺 의대 도구</h1>
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          <p className="font-semibold">의대 학생 조회 실패</p>
          <p className="mt-2 font-mono text-xs">{studentsRes.error.message}</p>
        </div>
      </div>
    );
  }

  const students = (studentsRes.data ?? []) as MedStudent[];
  const studentIds = students.map((s) => s.id);

  // 의대 deadline 만 (ISAT/MMI/GAMSAT)
  const deadlinesRes =
    studentIds.length === 0
      ? { data: [] as Deadline[] }
      : await supabase
          .from("critical_deadlines")
          .select("student_id, deadline_type, deadline_date, note")
          .in("student_id", studentIds)
          .in("deadline_type", MEDICAL_DEADLINE_TYPES)
          .neq("status", "completed")
          .gte("deadline_date", new Date().toISOString().slice(0, 10))
          .order("deadline_date", { ascending: true });

  const deadlines = (deadlinesRes.data ?? []) as Deadline[];

  // 학생당 가장 가까운 의대 deadline
  const nextDeadlineByStudent = new Map<string, Deadline>();
  for (const d of deadlines) {
    if (!nextDeadlineByStudent.has(d.student_id)) {
      nextDeadlineByStudent.set(d.student_id, d);
    }
  }

  // pathway 분포
  const pathwayCount = new Map<string, number>();
  for (const s of students) {
    const k = s.medical_pathway ?? "unknown";
    pathwayCount.set(k, (pathwayCount.get(k) ?? 0) + 1);
  }

  // pathway 별 학생 그룹
  const studentsByPathway = new Map<string, MedStudent[]>();
  for (const s of students) {
    const k = s.medical_pathway ?? "unknown";
    const arr = studentsByPathway.get(k) ?? [];
    arr.push(s);
    studentsByPathway.set(k, arr);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          관리자 · 의대 트랙
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          🩺 의대 도구
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          의대 학생 {students.length}명 · ISAT/MMI/GAMSAT 진행 중 deadline {deadlines.length}건.
          Wilson 직접 응대 트랙.
        </p>
      </header>

      {/* pathway 통계 */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          진입 경로 분포
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PATHWAYS.map((p) => {
            const n = pathwayCount.get(p.key) ?? 0;
            return (
              <Link
                key={p.key}
                href={`/admin/students?view=list&is_medical=true`}
                className="flex flex-col items-center gap-1 rounded-2xl border border-cream-300 bg-white p-4 transition hover:shadow-md"
                title={p.hint}
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-center text-[11px] font-semibold text-ink-500">
                  {p.label}
                </span>
                <span className="font-display text-xl font-bold text-navy-900">{n}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 다가오는 의대 deadline */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          ⏰ 다가오는 의대 deadline (ISAT · MMI · GAMSAT)
        </h2>
        {deadlines.length === 0 ? (
          <div className="rounded-2xl border border-cream-300 bg-cream-100/40 p-6 text-center text-sm text-ink-500">
            진행 중인 의대 deadline 없음. 학생 상세의 "마감일" 탭에서 등록 가능 (deadline_type: isat_test / mmi_interview / gamsat).
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {deadlines.slice(0, 20).map((d) => {
              const s = students.find((st) => st.id === d.student_id);
              if (!s) return null;
              const days = daysUntil(d.deadline_date);
              const urgent = days <= 7;
              return (
                <li key={`${d.student_id}-${d.deadline_type}-${d.deadline_date}`}>
                  <Link
                    href={`/admin/students/${s.id}/deadlines`}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition hover:shadow-md ${
                      urgent
                        ? "border-error/30 bg-error/5"
                        : "border-cream-300 bg-white"
                    }`}
                  >
                    <StudentAvatar name={s.name} photoPath={s.photo_path} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-bold text-navy-900">
                        {s.name?.trim() || "이름 미입력"}
                      </p>
                      <p className="text-[11px] text-ink-500">
                        {PATHWAY_LABEL[s.medical_pathway ?? ""] ?? "경로 미지정"} ·{" "}
                        Stage {s.current_stage}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xs font-bold ${
                          urgent ? "text-error" : "text-navy-700"
                        }`}
                      >
                        {DEADLINE_LABEL[d.deadline_type] ?? d.deadline_type}
                      </p>
                      <p className="text-[11px] text-ink-500">
                        {d.deadline_date} (D-{days})
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
            {deadlines.length > 20 && (
              <li className="text-center text-[11px] text-ink-500">
                ...외 {deadlines.length - 20}건
              </li>
            )}
          </ul>
        )}
      </section>

      {/* pathway 별 학생 그룹 */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          진입 경로별 학생
        </h2>
        {students.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center">
            <p className="text-4xl">🩺</p>
            <p className="mt-3 font-display text-lg font-bold text-navy-900">
              의대 학생이 없습니다
            </p>
            <p className="mt-1 text-sm text-ink-500">
              학생 상세의 "기본 정보 · Stage" 탭에서 의대 여부 체크 + 진입 경로 선택.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {PATHWAYS.map((p) => {
              const arr = studentsByPathway.get(p.key) ?? [];
              if (arr.length === 0) return null;
              return (
                <div key={p.key} className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-sm font-bold text-navy-900">
                      {p.emoji} {p.label}
                      <span className="ml-2 text-xs font-normal text-ink-500">{arr.length}명</span>
                    </h3>
                    <span className="text-[11px] text-ink-500">{p.hint}</span>
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {arr.map((s) => {
                      const dl = nextDeadlineByStudent.get(s.id);
                      const dlDays = dl ? daysUntil(dl.deadline_date) : null;
                      return (
                        <li key={s.id}>
                          <Link
                            href={`/admin/students/${s.id}`}
                            className="flex items-center gap-3 rounded-xl border border-cream-300 bg-cream-100/40 p-3 hover:bg-cream-200"
                          >
                            <StudentAvatar name={s.name} photoPath={s.photo_path} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-navy-900 truncate">
                                {s.name?.trim() || "이름 미입력"}
                              </p>
                              <p className="text-[10px] text-ink-500">
                                Stage {s.current_stage}
                                {s.english_level && ` · IELTS ${s.english_level}`}
                                {s.age_range && ` · ${s.age_range}`}
                              </p>
                              {dl && (
                                <p
                                  className={`text-[10px] font-semibold ${
                                    dlDays != null && dlDays <= 7 ? "text-error" : "text-navy-700"
                                  }`}
                                >
                                  ⏰ {DEADLINE_LABEL[dl.deadline_type] ?? dl.deadline_type} · D-{dlDays}
                                </p>
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {/* 미분류 pathway */}
            {(studentsByPathway.get("unknown") ?? []).length > 0 && (
              <div className="rounded-2xl border border-gold-400/40 bg-gold-100/30 p-5">
                <h3 className="font-display text-sm font-bold text-navy-900">
                  ⚠️ 진입 경로 미지정
                  <span className="ml-2 text-xs font-normal text-ink-500">
                    {(studentsByPathway.get("unknown") ?? []).length}명
                  </span>
                </h3>
                <p className="mt-1 text-[11px] text-ink-700">
                  학생 상세에서 medical_pathway 선택 필요 (Direct / 학부 / 대학원 / 전공 전환 / 편입).
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(studentsByPathway.get("unknown") ?? []).map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/admin/students/${s.id}`}
                        className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white p-2 hover:bg-cream-100"
                      >
                        <StudentAvatar name={s.name} photoPath={s.photo_path} size="sm" />
                        <span className="text-sm font-semibold text-navy-900">
                          {s.name?.trim() || "이름 미입력"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
