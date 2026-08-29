// PostgREST/Postgres의 LIKE/ILIKE 패턴에서 와일드카드를 리터럴로 이스케이프.
// 이메일처럼 '_'·'%'가 들어갈 수 있는 값을 .ilike()로 "정확히(대소문자 무시)"
// 매칭할 때 필수. 이스케이프 없이 넘기면 '_'가 임의의 한 글자로 작동해
// kim_ji@x.com 이 kimaji@x.com 등 엉뚱한 행과 매칭될 수 있음.
// (Postgres LIKE 기본 ESCAPE 문자는 백슬래시)
export function likeEscape(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}
