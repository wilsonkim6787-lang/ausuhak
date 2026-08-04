import raw from "./wilson-faqs.json";

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqCategory {
  icon: string;
  name: string;
  items: FaqItem[];
}

interface FaqData {
  categories: FaqCategory[];
}

const data = raw as FaqData;

export const FAQ_CATEGORIES: FaqCategory[] = data.categories;

/** 페이지에 표시하는 정보 기준일 — 배포(빌드) 시점의 한국 날짜로 자동 갱신 */
const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
export const FAQ_LAST_UPDATED = `${kstNow.getUTCFullYear()}.${String(
  kstNow.getUTCMonth() + 1,
).padStart(2, "0")}.${String(kstNow.getUTCDate()).padStart(2, "0")}`;

export function getCategoryPreview(limit = 5): { icon: string; name: string; items: FaqItem[] }[] {
  return FAQ_CATEGORIES.map((c) => ({
    icon: c.icon,
    name: c.name,
    items: c.items.slice(0, limit),
  }));
}

export function getCategoryBySlug(idx: number): FaqCategory | undefined {
  return FAQ_CATEGORIES[idx];
}

export function getTotalCount(): number {
  return FAQ_CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);
}

export interface FaqSearchHit {
  catIdx: number;
  icon: string;
  item: FaqItem;
  score: number;
}

/**
 * FAQ 통합 검색 — DiagnoseCTA / FAQPreview 공용.
 * 공백으로 분리한 단어 중 하나라도 q+a 에 포함되면 hit (OR),
 * 단 일치한 단어 수(score)가 많은 항목을 우선 정렬한다.
 */
export function searchFaqs(
  query: string,
  categories: { icon: string; items: FaqItem[] }[] = FAQ_CATEGORIES,
  limit = 12,
): FaqSearchHit[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const hits: FaqSearchHit[] = [];
  categories.forEach((c, catIdx) => {
    c.items.forEach((item) => {
      const text = `${item.q} ${item.a}`.toLowerCase();
      const score = words.reduce((n, w) => (text.includes(w) ? n + 1 : n), 0);
      if (score > 0) hits.push({ catIdx, icon: c.icon, item, score });
    });
  });
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}
