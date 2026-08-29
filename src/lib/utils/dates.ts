// KST(Asia/Seoul) 고정 날짜 헬퍼 — 단일 정본.
// Vercel 서버는 UTC로 돌기 때문에 로컬 시간 기반 포맷/경계 계산은
// 화면마다 9시간씩 어긋나고(새벽엔 날짜가 하루 밀림), 클라이언트 컴포넌트에선
// 서버/브라우저 결과가 달라 hydration 불일치까지 만든다. 표기·경계는 전부 여기로.

const KST_OFFSET_MS = 9 * 3600 * 1000;

// DB 일부 컬럼이 TIMESTAMP(시간대 없음, UTC 저장)라 "2026-08-29T11:00:00" 같은
// naive 문자열이 온다. new Date()는 이를 "실행 환경 로컬"로 해석해 환경마다 결과가
// 달라지므로(UTC 서버 vs KST 브라우저), 시간대 표기가 없으면 UTC로 못박아 해석한다.
function parseAsUtc(input: string | Date): Date {
  if (input instanceof Date) return input;
  const s = input.trim();
  const hasTz = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(s);
  const hasTime = /\d{2}:\d{2}/.test(s);
  if (hasTime && !hasTz) return new Date(s.replace(" ", "T") + "Z");
  return new Date(s); // 날짜만("YYYY-MM-DD")은 스펙상 이미 UTC 자정으로 해석됨
}

/** naive TIMESTAMP 문자열을 UTC 로 확정 파싱해 Date 반환 (비교·계산용) */
export function parseUtc(input: string | Date): Date {
  return parseAsUtc(input);
}

function toKstParts(input: string | Date) {
  const d = parseAsUtc(input);
  const k = new Date(d.getTime() + KST_OFFSET_MS);
  return {
    y: k.getUTCFullYear(),
    mo: k.getUTCMonth() + 1,
    da: k.getUTCDate(),
    h: k.getUTCHours(),
    mi: k.getUTCMinutes(),
  };
}

const p2 = (n: number) => String(n).padStart(2, "0");

/** "2026. 8. 29." — toLocaleDateString("ko-KR") 대체 */
export function fmtDate(input: string | Date): string {
  const { y, mo, da } = toKstParts(input);
  return `${y}. ${mo}. ${da}.`;
}

/** "2026. 8. 29. 14:05" — toLocaleString("ko-KR") 대체 (초 생략) */
export function fmtDateTime(input: string | Date): string {
  const { y, mo, da, h, mi } = toKstParts(input);
  return `${y}. ${mo}. ${da}. ${p2(h)}:${p2(mi)}`;
}

/** "2026.08.29" */
export function fmtYmd(input: string | Date): string {
  const { y, mo, da } = toKstParts(input);
  return `${y}.${p2(mo)}.${p2(da)}`;
}

/** "2026.08.29 14:05" */
export function fmtYmdHm(input: string | Date): string {
  const { y, mo, da, h, mi } = toKstParts(input);
  return `${y}.${p2(mo)}.${p2(da)} ${p2(h)}:${p2(mi)}`;
}

/** "8.29 14:05" — 메시지 타임스탬프용 */
export function fmtMdHm(input: string | Date): string {
  const { mo, da, h, mi } = toKstParts(input);
  return `${mo}.${da} ${p2(h)}:${p2(mi)}`;
}

/** KST 자정(오늘 00:00)의 UTC 시각 */
export function kstTodayStart(): Date {
  const k = new Date(Date.now() + KST_OFFSET_MS);
  const midnight = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate());
  return new Date(midnight - KST_OFFSET_MS);
}

export function kstTodayStartISO(): string {
  return kstTodayStart().toISOString();
}

/** KST 내일 00:00의 UTC ISO — "오늘" 범위 비교의 상한 */
export function kstTomorrowStartISO(): string {
  return new Date(kstTodayStart().getTime() + 24 * 3600 * 1000).toISOString();
}

/** KST 자정 기준 n일 전 (timestamptz 비교용 ISO) */
export function kstDaysAgoISO(days: number): string {
  return new Date(kstTodayStart().getTime() - days * 24 * 3600 * 1000).toISOString();
}

/** KST 기준 오늘 날짜 "YYYY-MM-DD" (DATE 컬럼 비교용) */
export function kstTodayYmd(): string {
  const { y, mo, da } = toKstParts(new Date());
  return `${y}-${p2(mo)}-${p2(da)}`;
}

/** KST 기준 내일 날짜 "YYYY-MM-DD" */
export function kstTomorrowYmd(): string {
  const { y, mo, da } = toKstParts(new Date(Date.now() + 24 * 3600 * 1000));
  return `${y}-${p2(mo)}-${p2(da)}`;
}

/**
 * KST 기준 D-day 계산 — "YYYY-MM-DD"(DATE 컬럼) 입력 전용.
 * 오늘=0, 내일=1, 어제=-1. 화면마다 제각각이던 daysUntil 구현의 단일 정본.
 */
export function daysUntilKST(dateStr: string): number {
  const target = Date.UTC(
    Number(dateStr.slice(0, 4)),
    Number(dateStr.slice(5, 7)) - 1,
    Number(dateStr.slice(8, 10)),
  );
  const t = toKstParts(new Date());
  const today = Date.UTC(t.y, t.mo - 1, t.da);
  return Math.round((target - today) / (24 * 3600 * 1000));
}

/** D-day 표기 통일: 0 → "D-day", 3 → "D-3", -2 → "D+2" */
export function dDayLabel(n: number): string {
  if (n === 0) return "D-day";
  return n > 0 ? `D-${n}` : `D+${-n}`;
}

/** KST 기준 이번 달 1일 00:00의 UTC 시각 (timestamptz 비교용 ISO) */
export function kstMonthStartISO(): string {
  const k = new Date(Date.now() + KST_OFFSET_MS);
  const start = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), 1);
  return new Date(start - KST_OFFSET_MS).toISOString();
}
