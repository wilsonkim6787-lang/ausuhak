import { createClient } from "@/lib/supabase/server";

// 아침 대시보드 위젯용 카운트 쿼리 모음 (PART E-2).
// Phase 1 활성: students / consultations / school_applications / payments / critical_deadlines / quotes.
// Phase 2+ 테이블 (issues / cases / graduates / monitored_sites / update_logs)는 별도 추가.
export type DashboardCounts = {
  // 🚨 긴급
  newKakaoToday: number;       // 신규 학생 카톡 (오늘)
  wilsonAlerts: number;         // Wilson Alerts 발생 학생
  deadlineD1: number;           // Critical Deadline D-1
  stuckStage14d: number;        // Stage 정체 14일+

  // 📋 오늘 할 일
  consultationsToday: number;   // 1:1 영상 상담 (오늘)
  quotesDraft: number;          // 견적서 작성 대기

  // 📊 이번 주 KPI
  newLeadsWeek: number;
  kakao30minWeek: number;       // 카톡 1차 상담
  paymentsConfirmedWeek: number;
  applicationsWeek: number;
  offersWeek: number;

  // 📊 전체 누적 (참고)
  totalStudents: number;
};

function startOfTodayKST(): Date {
  // KST(UTC+9) 기준 자정. Vercel/dev 서버 시간대 영향 최소화.
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 3600 * 1000);
  const kstMidnight = new Date(Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate(),
  ));
  // 다시 UTC로: KST 자정 = UTC 전날 15:00
  return new Date(kstMidnight.getTime() - 9 * 3600 * 1000);
}

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const supabase = await createClient();

  const startOfDay = startOfTodayKST();
  const endOfDay = new Date(startOfDay.getTime() + 24 * 3600 * 1000);
  const tomorrowStart = endOfDay;
  const tomorrowEnd = new Date(tomorrowStart.getTime() + 24 * 3600 * 1000);

  // 이번 주 월요일 00:00 KST
  const day = ((startOfDay.getUTCDay() + 9 / 24) | 0) % 7; // 단순화: 그냥 UTC dayOfWeek 사용
  const dayKst = new Date(startOfDay.getTime() + 9 * 3600 * 1000).getUTCDay();
  const daysFromMon = (dayKst + 6) % 7; // 월=0 / 일=6
  const weekStart = new Date(startOfDay.getTime() - daysFromMon * 24 * 3600 * 1000);
  void day;

  const fourteenDaysAgo = new Date(startOfDay.getTime() - 14 * 24 * 3600 * 1000);

  const isoToday = startOfDay.toISOString();
  const isoEndOfDay = endOfDay.toISOString();
  const isoTomorrowStart = tomorrowStart.toISOString();
  const isoTomorrowEnd = tomorrowEnd.toISOString();
  const isoWeekStart = weekStart.toISOString();
  const iso14dAgo = fourteenDaysAgo.toISOString();

  // 날짜 컬럼 (critical_deadlines.deadline_date = DATE)용
  const isoDateOnly = (d: Date): string => d.toISOString().slice(0, 10);
  const tomorrowDate = isoDateOnly(tomorrowStart);

  // count-only 쿼리 헬퍼
  const cnt = (
    p: PromiseLike<{ count: number | null; error: unknown }>,
  ): Promise<number> =>
    Promise.resolve(p).then((r) => r.count ?? 0);

  const [
    newKakaoToday,
    wilsonAlerts,
    deadlineD1,
    stuckStage14d,
    consultationsToday,
    quotesDraft,
    newLeadsWeek,
    kakao30minWeek,
    paymentsConfirmedWeek,
    applicationsWeek,
    offersWeek,
    totalStudents,
  ] = await Promise.all([
    cnt(
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .gte("created_at", isoToday)
        .lt("created_at", isoEndOfDay),
    ),
    cnt(
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .not("wilson_alerts", "is", null)
        .neq("lead_status", "pr"),
    ),
    cnt(
      supabase
        .from("critical_deadlines")
        .select("id", { count: "exact", head: true })
        .eq("deadline_date", tomorrowDate)
        .not("status", "in", "(completed,expired)"),
    ),
    cnt(
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .lt("updated_at", iso14dAgo)
        .not("lead_status", "in", "(pr,lead)"),
    ),
    cnt(
      supabase
        .from("consultations")
        .select("id", { count: "exact", head: true })
        .gte("consultation_date", isoToday)
        .lt("consultation_date", isoEndOfDay)
        .neq("type", "kakao_30min"),
    ),
    cnt(
      supabase
        .from("quotes")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
    ),
    cnt(
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .gte("created_at", isoWeekStart),
    ),
    cnt(
      supabase
        .from("consultations")
        .select("id", { count: "exact", head: true })
        .eq("type", "kakao_30min")
        .gte("consultation_date", isoWeekStart),
    ),
    cnt(
      supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmed")
        .gte("created_at", isoWeekStart),
    ),
    cnt(
      supabase
        .from("school_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "applied")
        .gte("applied_at", isoWeekStart),
    ),
    cnt(
      supabase
        .from("school_applications")
        .select("id", { count: "exact", head: true })
        .gte("offer_received_at", isoWeekStart),
    ),
    cnt(
      supabase
        .from("students")
        .select("id", { count: "exact", head: true }),
    ),
  ]);

  // tomorrow 변수 미사용 경고 방지
  void isoTomorrowStart;
  void isoTomorrowEnd;

  return {
    newKakaoToday,
    wilsonAlerts,
    deadlineD1,
    stuckStage14d,
    consultationsToday,
    quotesDraft,
    newLeadsWeek,
    kakao30minWeek,
    paymentsConfirmedWeek,
    applicationsWeek,
    offersWeek,
    totalStudents,
  };
}
