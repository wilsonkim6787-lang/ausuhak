import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import StageTimeline from "@/components/mypage/StageTimeline";
import LeadProgress from "@/components/mypage/LeadProgress";
import { getStage } from "@/lib/stages";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

type DeadlineRow = {
  id: string;
  deadline_type: string;
  deadline_date: string | null;
  status: string | null;
  note: string | null;
};

function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

export default async function MypageHome() {
  const { student } = await requireStudent();
  const supabase = await createClient();

  const { data: deadlines } = student.id
    ? await supabase
        .from("critical_deadlines")
        .select("id, deadline_type, deadline_date, status, note")
        .eq("student_id", student.id)
        .not("status", "in", "(completed,expired)")
        .order("deadline_date", { ascending: true })
        .limit(5)
    : { data: [] as DeadlineRow[] };

  const upcoming = (deadlines ?? []) as DeadlineRow[];
  const currentStage = getStage(student.current_stage);

  return (
    <div className="space-y-6">
      {/* 현재 단계 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold tracking-wider text-gold-600">현재 진행 상황</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          Stage {student.current_stage}.{" "}
          <span className="text-gold-600">{currentStage?.short ?? "-"}</span>
        </h1>
        <p className="mt-1 text-sm text-ink-700">{currentStage?.label}</p>

        {student.is_medical && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-2.5 py-1 text-xs font-bold text-gold-400">
            🩺 의대 트랙 ({student.medical_pathway ?? "-"})
          </div>
        )}
      </section>

      {/* 진행도 시각화 (lead_status 7단계) */}
      <LeadProgress leadStatus={student.lead_status} />

      {/* 다음 액션 = critical_deadlines 미완료 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-navy-900">
          📋 다음 액션
        </h2>
        {upcoming.length === 0 ? (
          <p className="rounded-lg border border-cream-300 bg-cream-100/50 px-3 py-3 text-sm text-ink-500">
            아직 등록된 액션이 없습니다. Wilson 카톡 상담 후 단계가 진행되면 자동으로 표시됩니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((d) => {
              const days = daysLeft(d.deadline_date);
              const urgent = days !== null && days <= 3;
              return (
                <li
                  key={d.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${
                    urgent
                      ? "border-error/30 bg-error/5"
                      : "border-cream-300 bg-cream-100/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-navy-900">{d.deadline_type}</p>
                    {d.note && (
                      <p className="mt-0.5 truncate text-xs text-ink-500">{d.note}</p>
                    )}
                  </div>
                  {days !== null && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        urgent
                          ? "bg-error text-white"
                          : days <= 7
                          ? "bg-warning/20 text-warning"
                          : "bg-cream-300 text-ink-700"
                      }`}
                    >
                      {days < 0 ? "지남" : days === 0 ? "오늘" : `D-${days}`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Stage 12 시각화 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-navy-900">
          🎯 전체 로드맵 (12단계)
        </h2>
        <StageTimeline currentStage={student.current_stage} />
      </section>

      {/* 빠른 메뉴 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <QuickLink href="/mypage/cards" icon="📄" label="카드 7장 다시 보기" />
        <QuickLink href="/mypage/quote" icon="📋" label="견적서" />
        <QuickLink href="/mypage/documents" icon="📁" label="서류 업로드" />
        <QuickLink href="/mypage/payments" icon="💳" label="결제 내역" />
        <QuickLink href="/mypage/self-guide" icon="📚" label="셀프 가이드" />
        <a
          href={KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-kakao-source="mypage_home_quick"
          className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-gold-600 bg-gold-600 px-3 py-4 text-white shadow-sm transition hover:bg-gold-500"
        >
          <span className="text-2xl">💬</span>
          <span className="text-xs font-semibold">카톡 채널</span>
        </a>
      </section>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-cream-300 bg-white px-3 py-4 text-navy-900 shadow-sm transition hover:border-navy-800/40 hover:shadow-md"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
