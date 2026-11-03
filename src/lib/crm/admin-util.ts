// Small pure helpers for the admin intranet (safe on server and client).
import { FLOWS, phaseColor, type Service } from "./flows";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID.test(v);
}

export function fdStr(fd: FormData, key: string, max = 500): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function fdOpt(fd: FormData, key: string, max = 500): string | null {
  return fdStr(fd, key, max) || null;
}

export function fdDate(fd: FormData, key: string): string | null {
  const v = fdStr(fd, key, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)) ? v : null;
}

export function fdId(fd: FormData, key: string): string | null {
  const v = fdStr(fd, key, 40);
  return isUuid(v) ? v : null;
}

export function pick<T extends string>(v: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

// Dates are handled as YYYY-MM-DD strings in Korea time.
export function todayKST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

export function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export function ymdParts(ymd: string) {
  const [y, m, d] = ymd.slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

// "11월 5일" (adds the year when it differs from this year).
export function shortDate(ymd: string | null | undefined): string {
  if (!ymd) return "";
  const { y, m, d } = ymdParts(ymd);
  if (!y || !m || !d) return ymd;
  const thisYear = Number(todayKST().slice(0, 4));
  return y === thisYear ? `${m}월 ${d}일` : `${y}년 ${m}월 ${d}일`;
}

export function monthKo(ymd: string | null | undefined): string {
  if (!ymd) return "";
  const { y, m } = ymdParts(ymd);
  return `${y}년 ${m}월`;
}

// Timestamp -> "오늘 09:12" / "어제 22:40" / "11월 1일".
export function whenKo(ts: string | null | undefined): string {
  if (!ts) return "";
  const dt = new Date(ts);
  if (isNaN(dt.getTime())) return "";
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(dt);
  const time = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }).format(dt);
  const today = todayKST();
  if (day === today) return `오늘 ${time}`;
  if (day === addDays(today, -1)) return `어제 ${time}`;
  return shortDate(day);
}

export function weekdayKo(ymd: string): string {
  const { y, m, d } = ymdParts(ymd);
  return ["일", "월", "화", "수", "목", "금", "토"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()] + "요일";
}

// Age in full years on a given day.
export function ageOn(birth: string, on: string): number {
  const b = ymdParts(birth);
  const t = ymdParts(on);
  let a = t.y - b.y;
  if (t.m < b.m || (t.m === b.m && t.d < b.d)) a--;
  return a;
}

export function birthdayAt(birth: string, years: number): string {
  const b = ymdParts(birth);
  const y = b.y + years;
  // Feb 29 -> Mar 1 in non-leap years
  const t = new Date(Date.UTC(y, b.m - 1, b.d));
  return t.toISOString().slice(0, 10);
}

export function monthsBetween(a: string, b: string): number {
  const x = ymdParts(a);
  const y = ymdParts(b);
  return (y.y - x.y) * 12 + (y.m - x.m) + (y.d >= x.d ? 0 : -1) + 1;
}

export type StepLite = { id: string; case_id: string; seq: number; phase: string; label: string; state: string; due_date: string | null };

// Where a case stands: the first step in progress, else the first one waiting.
export function caseProgress(service: string, steps: StepLite[]) {
  const s = [...steps].sort((a, b) => a.seq - b.seq);
  const counted = s.filter((x) => x.state !== "skip");
  const done = counted.filter((x) => x.state === "done").length;
  const cur = s.find((x) => x.state === "doing") ?? s.find((x) => x.state === "todo") ?? null;
  const open = s.filter((x) => (x.state === "todo" || x.state === "doing") && x.due_date).sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1));
  const flow = FLOWS[service as Service] ?? FLOWS.other;
  const phase = cur?.phase ?? (counted.length && done === counted.length ? flow[flow.length - 1].phase : flow[0].phase);
  return {
    phase,
    phaseColor: phaseColor(service, phase),
    step: cur?.label ?? (counted.length && done === counted.length ? "모두 완료" : ""),
    pct: counted.length ? Math.round((done / counted.length) * 100) : 0,
    next: open[0] ?? null,
    done,
    total: counted.length,
  };
}

export function stepsFromFlow(service: Service, caseId: string) {
  let seq = 0;
  return FLOWS[service].flatMap((p) =>
    p.steps.map(([key, label]) => ({ case_id: caseId, seq: ++seq * 10, phase: p.phase, key, label, state: "todo" })),
  );
}

export const WELFARE: { key: "caaw" | "parent_590" | "relative"; label: string; desc: string }[] = [
  { key: "caaw", label: "학교가 보호 (CAAW)", desc: "학교가 승인한 홈스테이에서 지내고, 학교가 보호 확인서(CAAW)를 발급합니다." },
  { key: "parent_590", label: "부모님 동반 (590)", desc: "어머니나 아버지가 학생 보호자 비자(590)로 함께 갑니다. 두 신청을 같이 접수합니다." },
  { key: "relative", label: "만 21세 이상 친척", desc: "호주에 사는 조부모·형제·삼촌·이모 등을 부모님이 지정합니다." },
];

// Checklist for each welfare option. kind "doc" = a document the family sends
// (goes to the request list); "task" = something Wilson does (goes into the case steps).
export type WelfareItem = { label: string; note: string; kind: "doc" | "task" };
export const WELFARE_ITEMS: Record<string, WelfareItem[]> = {
  caaw: [
    { label: "학교 홈스테이 신청", note: "학교가 정한 홈스테이·공항 픽업 포함", kind: "task" },
    { label: "CAAW 발급", note: "CoE 기간 + 종료 후 7일, 또는 만 18세까지", kind: "task" },
    { label: "홈스테이 확정 주소", note: "입국 후 7일 안에 학교에 주소 알림", kind: "task" },
  ],
  parent_590: [
    { label: "Form 157N · 보호자 지정", note: "1~8번 문항, 부모 서명", kind: "doc" },
    { label: "학생 보호자 비자(590) 동시 접수", note: "학생비자와 같이 접수", kind: "task" },
    { label: "관계 증명 (기본·가족관계증명서 영문)", note: "", kind: "doc" },
  ],
  relative: [
    { label: "Form 157N · 친척 보호자 지정", note: "부모가 서면으로 지정", kind: "doc" },
    { label: "관계 증명 (출생·가족관계 서류)", note: "학생·부모·친척 관계가 이어지게", kind: "doc" },
    { label: "친척 범죄경력증명서", note: "16세 이후 12개월 넘게 산 모든 나라, 최근 10년", kind: "doc" },
    { label: "친척 여권 사본·호주 체류 자격 증빙", note: "시민권·영주권·유효한 장기 비자", kind: "doc" },
  ],
};
export const FORM_1229_LABEL = "Form 1229 · 부모 두 분의 비자 동의서";
export const UNDER14_LABEL = "개인정보 수집 동의서 (부모 서명)";
export const WELFARE_PHASE = "미성년 보호";

export const EDUCATION = ["검정고시", "고3·고졸", "대학 재학", "대졸", "직장인", "초중고"];

export const STUDENT_STATUS: Record<string, string> = {
  lead: "상담 중",
  active: "진행 중",
  done: "완료",
  hold: "보류",
  cancelled: "취소",
};

export const DOC_TYPES = ["여권", "성적·졸업 증명서", "영어 성적표", "재정 서류", "재직증명서", "추천서", "이민성 서신", "기타"];
