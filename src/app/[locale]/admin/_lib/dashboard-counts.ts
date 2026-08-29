import { createClient } from "@/lib/supabase/server";
import { loadStudentsForCare } from "@/lib/care/load";
import { evaluateCareRules } from "@/lib/care/rules";
import {
  kstTodayStart,
  kstTomorrowStartISO,
  kstTomorrowYmd,
  kstDaysAgoISO,
} from "@/lib/utils/dates";

// 아침 대시보드 위젯용 카운트 쿼리 모음 (PART E-2).
// Phase 1 활성: students / consultations / school_applications / payments / critical_deadlines / quotes.
// Phase 2+ 테이블 (issues / cases / graduates / monitored_sites / update_logs)는 별도 추가.
export type DashboardCounts = {
  // 🚨 긴급
  newKakaoToday: number;       // 신규 학생 카톡 (오늘)
  wilsonAlerts: number;         // Wilson 점검 필요 (케어 wilson 히트 학생 distinct)
  leadsUncontacted: number;     // 'lead' 상태 2일+ 방치 (팔로업 필요)
  unreadStudentMessages: number; // 학생이 보낸 미읽음 메시지 (마이페이지 소통)
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

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const supabase = await createClient();

  const startOfDay = kstTodayStart();

  // 이번 주 월요일 00:00 KST
  const dayKst = new Date(startOfDay.getTime() + 9 * 3600 * 1000).getUTCDay();
  const daysFromMon = (dayKst + 6) % 7; // 월=0 / 일=6
  const weekStart = new Date(startOfDay.getTime() - daysFromMon * 24 * 3600 * 1000);

  const isoToday = startOfDay.toISOString();
  const isoEndOfDay = kstTomorrowStartISO();
  const isoWeekStart = weekStart.toISOString();
  const iso14dAgo = kstDaysAgoISO(14);
  const isoTwoDaysAgo = kstDaysAgoISO(2);

  // 날짜 컬럼 (critical_deadlines.deadline_date = DATE)용.
  // 주의: 기존 toISOString().slice(0,10)은 UTC 날짜라 "내일"이 아니라 "오늘"이 나왔음.
  const tomorrowDate = kstTomorrowYmd();

  // count-only 쿼리 헬퍼
  const cnt = (
    p: PromiseLike<{ count: number | null; error: unknown }>,
  ): Promise<number> =>
    Promise.resolve(p).then((r) => r.count ?? 0);

  const [
    newKakaoToday,
    leadsUncontacted,
    unreadStudentMessages,
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
        .eq("lead_status", "lead")
        .lt("created_at", isoTwoDaysAgo),
    ),
    cnt(
      supabase
        .from("student_messages")
        .select("id", { count: "exact", head: true })
        .eq("sender_role", "student")
        .is("read_at", null),
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
        // NULL lead_status 는 SQL NOT IN 에서 빠짐 → 케어 엔진(JS !==)과 동일하게 포함
        .or("lead_status.is.null,lead_status.not.in.(pr,lead)"),
    ),
    cnt(
      supabase
        .from("consultations")
        .select("id", { count: "exact", head: true })
        .gte("consultation_date", isoToday)
        .lt("consultation_date", isoEndOfDay)
        .or("type.is.null,type.neq.kakao_30min"),
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

  // 🚨 Wilson 점검 필요 = 케어 엔진 wilson-severity 히트가 있는 학생 (distinct)
  // (죽어 있던 students.wilson_alerts 컬럼 대체 — /admin/care 와 동일 로직)
  const careStudents = await loadStudentsForCare(supabase);
  const wilsonAlerts = new Set(
    evaluateCareRules(careStudents)
      .filter((h) => h.severity === "wilson")
      .map((h) => h.student_id),
  ).size;

  return {
    newKakaoToday,
    wilsonAlerts,
    leadsUncontacted,
    unreadStudentMessages,
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
