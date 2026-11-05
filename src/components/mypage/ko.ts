// Small Korean text helpers for MyPage.

function lastHangul(word: string) {
  const t = word.trim();
  const c = t.charCodeAt(t.length - 1);
  return c >= 0xac00 && c <= 0xd7a3 ? c - 0xac00 : -1;
}

// 받침 유무 (non-Hangul endings are treated as no batchim).
export function hasBatchim(word: string) {
  const i = lastHangul(word);
  return i >= 0 && i % 28 !== 0;
}

/** josa("학생", "과", "와") -> "학생과" */
export function josa(word: string, withBatchim: string, without: string) {
  return word + (hasBatchim(word) ? withBatchim : without);
}

/** 으로/로 (ㄹ 받침은 "로") */
export function ro(word: string) {
  const i = lastHangul(word);
  const b = i >= 0 ? i % 28 : 0;
  return word + (b === 0 || b === 8 ? "로" : "으로");
}

/** "2026-11-06" -> "11월 6일" (date-only strings, no timezone shift) */
export function fmtMonthDay(s: string | null | undefined) {
  if (!s) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return s;
  return `${Number(m[2])}월 ${Number(m[3])}일`;
}

/** "2027-02" -> "2027년 2월" */
export function fmtIntake(s: string | null | undefined) {
  if (!s) return "";
  const m = /^(\d{4})-(\d{1,2})/.exec(s);
  return m ? `${m[1]}년 ${Number(m[2])}월` : s;
}

const seoul = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function seoulParts(d: Date) {
  const p: Record<string, string> = {};
  for (const x of seoul.formatToParts(d)) p[x.type] = x.value;
  return { y: Number(p.year), m: Number(p.month), d: Number(p.day), hm: `${p.hour}:${p.minute}` };
}

/** Message time in Korea time: "오늘 08:30", "어제 22:40", "11월 2일 14:05", "2025년 12월 3일" */
export function fmtWhen(iso: string, now = new Date()) {
  const t = new Date(iso);
  if (isNaN(t.getTime())) return "";
  const a = seoulParts(t);
  const n = seoulParts(now);
  const dayA = Date.UTC(a.y, a.m - 1, a.d);
  const dayN = Date.UTC(n.y, n.m - 1, n.d);
  const diff = Math.round((dayN - dayA) / 86400000);
  if (diff === 0) return `오늘 ${a.hm}`;
  if (diff === 1) return `어제 ${a.hm}`;
  if (a.y === n.y) return `${a.m}월 ${a.d}일 ${a.hm}`;
  return `${a.y}년 ${a.m}월 ${a.d}일`;
}

/** "이하은" -> "하은" (3-syllable Korean names drop the family name) */
export function givenName(name: string) {
  const t = name.trim();
  return /^[가-힣]{3}$/.test(t) ? t.slice(1) : t;
}
