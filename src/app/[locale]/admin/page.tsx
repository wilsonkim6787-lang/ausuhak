import { setRequestLocale } from "next-intl/server";
import { getDashboardCounts } from "./_lib/dashboard-counts";
import DashboardCard from "@/components/admin/DashboardCard";

// 🌅 아침 대시보드 (PART E-2).
// Phase 1 시점 = 학생 0명이라 모든 카운터 0. 실제 운영 시작되면 자동으로 숫자 표시.
export default async function AdminHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const counts = await getDashboardCounts();

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
          관리자 홈
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          🌅 아침 대시보드
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          {today} (KST) · 누적 학생 {counts.totalStudents}명
        </p>
      </header>

      {/* 🚨 긴급 (오늘 처리 필요) */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          🚨 긴급 (오늘 처리 필요)
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <DashboardCard
            variant="urgent"
            icon="💬"
            label="신규 학생 카톡 (오늘)"
            count={counts.newKakaoToday}
            href="/admin/students?filter=new_today"
            hint="6변수 수집 완료"
          />
          <DashboardCard
            variant="urgent"
            icon="🚨"
            label="Wilson Alerts 발생 학생"
            count={counts.wilsonAlerts}
            href="/admin/students?filter=alerts"
          />
          <DashboardCard
            variant="urgent"
            icon="⏰"
            label="Critical Deadline D-1"
            count={counts.deadlineD1}
            href="/admin/students?filter=deadline_d1"
          />
          <DashboardCard
            variant="urgent"
            icon="⏳"
            label="Stage 정체 14일+"
            count={counts.stuckStage14d}
            href="/admin/students?filter=stuck_14d"
          />
          <DashboardCard
            variant="urgent"
            icon="🐞"
            label="이슈 (high/critical)"
            count={0}
            phase={2}
            hint="P2 issues 테이블"
          />
        </div>
      </section>

      {/* 📋 오늘 할 일 */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          📋 오늘 할 일
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DashboardCard
            variant="todo"
            icon="🎥"
            label="1:1 영상 상담 (오늘)"
            count={counts.consultationsToday}
            href="/admin/students?filter=consult_today"
          />
          <DashboardCard
            variant="todo"
            icon="💵"
            label="견적서 작성 대기"
            count={counts.quotesDraft}
            href="/admin/quotes?status=draft"
          />
          <DashboardCard
            variant="todo"
            icon="🔄"
            label="사이트 모니터링 알림"
            count={0}
            phase={3}
            hint="P3 monitored_sites"
          />
          <DashboardCard
            variant="todo"
            icon="✅"
            label="DB 업데이트 승인 대기"
            count={0}
            phase={3}
            hint="P3 update_logs"
          />
        </div>
      </section>

      {/* 📊 이번 주 KPI */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          📊 이번 주 KPI (월~일)
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <DashboardCard
            variant="kpi"
            icon="🆕"
            label="신규 Lead"
            count={counts.newLeadsWeek}
          />
          <DashboardCard
            variant="kpi"
            icon="💬"
            label="카톡 1차 상담 (30분)"
            count={counts.kakao30minWeek}
          />
          <DashboardCard
            variant="kpi"
            icon="💰"
            label="결제 확정 (PRO/의대/풀)"
            count={counts.paymentsConfirmedWeek}
          />
          <DashboardCard
            variant="kpi"
            icon="📥"
            label="학교 지원 (Application)"
            count={counts.applicationsWeek}
          />
          <DashboardCard
            variant="kpi"
            icon="🏆"
            label="Offer 받음"
            count={counts.offersWeek}
          />
        </div>
      </section>

      {/* 💡 추가 정보 (Phase 2 placeholder) */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          💡 추가 정보
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DashboardCard
            variant="info"
            icon="🧠"
            label="케이스 학습 (어제 추가)"
            count={0}
            phase={2}
            hint="P2 cases 테이블"
          />
          <DashboardCard
            variant="info"
            icon="🎓"
            label="졸업생 PR 취득 / 후기"
            count={0}
            phase={2}
            hint="P2 graduates 테이블"
          />
        </div>
      </section>
    </div>
  );
}
