import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth/requireStudent";
import StageTimeline from "@/components/mypage/StageTimeline";
import LeadProgress from "@/components/mypage/LeadProgress";
import StudentAvatar from "@/components/admin/StudentAvatar";
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
      {/* 헤더: 사진 + 이름 + 의대 뱃지 */}
      <section className="flex flex-col gap-4 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <StudentAvatar name={student.name} photoPath={student.photo_path} size="xl" />
        <div className="flex-1">
          <p className="text-xs font-bold tracking-wider text-gold-600">내 마이페이지</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            {student.name?.trim() || "이름 미입력"}
          </h1>
          <p className="mt-1 text-sm text-ink-700">
            현재 <span className="font-semibold text-navy-900">Stage {student.current_stage}</span>
            {currentStage?.short ? ` · ${currentStage.short}` : ""}
          </p>
          {student.is_medical && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-2.5 py-1 text-xs font-bold text-gold-400">
              🩺 의대 트랙 ({student.medical_pathway ?? "-"})
            </div>
          )}
        </div>
      </section>

      {/* 진행도 통합 카드: LeadProgress (main) + Stage 12 timeline (details 펼침) */}
      <LeadProgress leadStatus={student.lead_status} />

      <details className="group rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6">
        <summary className="flex cursor-pointer items-center justify-between gap-2 list-none">
          <h2 className="font-display text-lg font-semibold text-navy-900">
            🎯 Stage 12 자세히 보기
          </h2>
          <span className="text-xs text-ink-500 group-open:hidden">펼치기 ▼</span>
          <span className="hidden text-xs text-ink-500 group-open:inline">접기 ▲</span>
        </summary>
        <div className="mt-4">
          <p className="mb-3 text-xs text-ink-500">
            12단계 = Wilson 케어 lifecycle. 현재 위치를 더 자세히 확인하세요.
          </p>
          <StageTimeline currentStage={student.current_stage} />
        </div>
      </details>

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

      {/* 주요 메뉴 (primary 3) */}
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-500">내 자산</p>
        <div className="grid grid-cols-3 gap-3">
          <PrimaryLink href="/mypage/quote" icon="📋" label="견적서" />
          <PrimaryLink href="/mypage/payments" icon="💳" label="결제 내역" />
          <PrimaryLink href="/mypage/documents" icon="📁" label="서류" />
        </div>
      </section>

      {/* 보조 메뉴 (secondary 2) */}
      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-500">도움</p>
        <div className="grid grid-cols-2 gap-3">
          <SecondaryLink href="/mypage/self-guide" icon="📚" label="셀프 가이드" />
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="mypage_home_quick"
            className="flex items-center justify-center gap-2 rounded-2xl border border-gold-600 bg-gold-600 px-3 py-3 text-white shadow-sm transition hover:bg-gold-500"
          >
            <span className="text-lg">💬</span>
            <span className="text-xs font-semibold">카톡 채널</span>
          </a>
        </div>
      </section>
    </div>
  );
}

function PrimaryLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-cream-300 bg-white px-3 py-5 text-navy-900 shadow-sm transition hover:border-navy-800/40 hover:shadow-md"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}

function SecondaryLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 rounded-2xl border border-cream-300 bg-white px-3 py-3 text-navy-900 shadow-sm transition hover:border-navy-800/40"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}
