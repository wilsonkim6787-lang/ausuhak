import data from "@/content/faq.json";

export type Faq = { id: string; category: string; q: string; a: string };

export const FAQS: Faq[] = data as Faq[];

// Display order and URL slugs for categories.
export const FAQ_CATEGORIES: { name: string; slug: string; desc: string }[] = [
  { name: "처음 시작할 때", slug: "start", desc: "학력별로 어디서부터 시작하는지" },
  { name: "학교 고르기", slug: "schools", desc: "대학·칼리지·도시 비교" },
  { name: "간호·의대·약대", slug: "health", desc: "보건 계열 입학 요건과 루트" },
  { name: "IT·경영·교육", slug: "it-business", desc: "IT, 경영·회계, 교육 전공" },
  { name: "요리·트레이드", slug: "trade", desc: "요리·호텔·기술직 과정" },
  { name: "비자와 영주권", slug: "visa", desc: "학생비자, 졸업 후 비자, 영주권" },
  { name: "워킹홀리데이", slug: "working-holiday", desc: "나이·비용·일과 공부, 학생비자로 이어 가기" },
  { name: "학비와 생활비", slug: "costs", desc: "학비, 생활비, 예산 줄이는 법" },
  { name: "호주에서의 일상", slug: "life", desc: "집, 아르바이트, 생활 정보" },
  { name: "가족·특별한 상황", slug: "family", desc: "동반 가족, 나이, 특수한 경우" },
  { name: "상담 받기", slug: "consult", desc: "상담 방법과 진행 순서" },
];

export function faqsByCategory() {
  return FAQ_CATEGORIES.map((c) => ({ ...c, items: FAQS.filter((f) => f.category === c.name) }));
}

export function getFaq(id: string) {
  return FAQS.find((f) => f.id === id);
}

export function categoryOf(f: Faq) {
  return FAQ_CATEGORIES.find((c) => c.name === f.category);
}

// Plain-text answer for meta descriptions and JSON-LD.
export function plain(a: string) {
  return a.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\s+/g, " ").trim();
}

export function snippet(a: string, n = 150) {
  const p = plain(a);
  return p.length > n ? p.slice(0, n - 1).trimEnd() + "…" : p;
}
