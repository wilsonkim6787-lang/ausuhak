import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { getDashboardCounts } from "./_lib/dashboard-counts";
import DashboardCollapse from "@/components/admin/DashboardCollapse";

// 🌅 아침 대시보드 (PART E-2 / BLOCK 2 단순화).
// 원칙: 0과 빈 항목은 숨긴다. 지금 할 것만 크게 보여준다.
// 데이터 소스(getDashboardCounts) · 쿼리는 그대로, 표현만 변경.
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

  // 행동이 필요한 항목 (count > 0만 위에, 0은 하단 점선 바로)
  type Todo = {
    icon: string;
    label: string;
    sentence: string;
    count: number;
    href: string;
    alert: boolean;
  };
  const todos: Todo[] = [
    {
      icon: "🚨",
      label: "Wilson 점검 필요",
      sentence: "Wilson이 직접 봐야 할 학생이 있어요",
      count: counts.wilsonAlerts,
      href: "/admin/students?filter=alerts",
      alert: true,
    },
    {
      icon: "⏰",
      label: "내일 마감",
      sentence: "내일이 마감인 중요한 일정이 있어요",
      count: counts.deadlineD1,
      href: "/admin/students?filter=deadline_d1",
      alert: true,
    },
    {
      icon: "⏳",
      label: "단계 정체",
      sentence: "같은 단계에서 2주 넘게 멈춘 학생이 있어요",
      count: counts.stuckStage14d,
      href: "/admin/students?filter=stuck_14d",
      alert: true,
    },
    {
      icon: "💬",
      label: "신규 학생 카톡",
      sentence: "오늘 새로 들어온 학생 — 첫 상담을 준비하세요",
      count: counts.newKakaoToday,
      href: "/admin/students?filter=new_today",
      alert: false,
    },
    {
      icon: "🎥",
      label: "오늘 영상 상담",
      sentence: "오늘 1:1 영상 상담이 잡혀 있어요",
      count: counts.consultationsToday,
      href: "/admin/students?filter=consult_today",
      alert: false,
    },
    {
      icon: "💵",
      label: "견적서 작성 대기",
      sentence: "상담은 끝났는데 견적서를 아직 안 보냈어요",
      count: counts.quotesDraft,
      href: "/admin/quotes?status=draft",
      alert: false,
    },
  ];

  const activeTodos = todos.filter((t) => t.count > 0);
  const okItems = todos.filter((t) => t.count === 0).map((t) => t.label);

  // 아직 데이터가 없는(준비 중) 항목 — 큰 카드 대신 하단으로
  const futureItems = [
    { label: "이슈 (high/critical)", phase: 2 },
    { label: "사이트 모니터링 알림", phase: 3 },
    { label: "DB 업데이트 승인 대기", phase: 3 },
    { label: "케이스 학습", phase: 2 },
    { label: "졸업생 PR 취득 / 후기", phase: 2 },
  ];

  const kpis = [
    { label: "신규 Lead", count: counts.newLeadsWeek },
    { label: "카톡 1차 상담", count: counts.kakao30minWeek },
    { label: "결제 확정", count: counts.paymentsConfirmedWeek },
    { label: "학교 지원", count: counts.applicationsWeek },
    { label: "Offer 받음", count: counts.offersWeek },
  ];

  return (
    <div className="flex flex-col gap-6">
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

      {/* 📋 오늘 할 일 — gold 좌측 보더, count>0만 */}
      <section className="rounded-2xl border-l-4 border-gold-500 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-display text-base font-bold text-navy-900">
          오늘 할 일
        </h2>

        {activeTodos.length === 0 ? (
          <p className="flex items-center gap-2 py-2 text-sm font-medium text-success">
            <span>✓</span> 오늘 급한 일은 없어요
          </p>
        ) : (
          <ul className="divide-y divide-cream-200">
            {activeTodos.map((t) => (
              <li key={t.label}>
                <Link
                  href={t.href}
                  className="group flex items-center gap-3 py-3 transition hover:bg-cream-100/60"
                >
                  <span className="text-lg">{t.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-navy-900">
                      {t.label}
                    </div>
                    <div className="truncate text-xs text-ink-500">
                      {t.sentence}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      t.alert
                        ? "bg-error/10 text-error"
                        : "bg-gold-500/15 text-gold-600"
                    }`}
                  >
                    {t.count}
                  </span>
                  <svg
                    className="size-4 shrink-0 text-ink-500 transition group-hover:translate-x-0.5"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M7.5 4.5 13 10l-5.5 5.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 📊 이번 주 KPI — 가로 숫자 스트립 */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">
          이번 주 KPI (월~일)
        </h2>
        <div className="grid grid-cols-2 divide-x divide-y divide-cream-200 overflow-hidden rounded-2xl bg-white shadow-sm sm:grid-cols-5 sm:divide-y-0">
          {kpis.map((k) => (
            <div key={k.label} className="flex flex-col gap-1 p-4">
              <span className="text-[11px] text-ink-500">{k.label}</span>
              <span
                className={`font-display text-2xl font-bold ${
                  k.count > 0 ? "text-navy-900" : "text-navy-900/25"
                }`}
              >
                {k.count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 🗂 이상 없는 / 준비 중 항목 — 접어둠 */}
      <DashboardCollapse okItems={okItems} futureItems={futureItems} />
    </div>
  );
}
