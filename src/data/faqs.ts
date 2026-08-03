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

/** 비자·수수료 수치를 마지막으로 검증한 날짜 — 이민성 변경 반영 시 갱신 */
export const FAQ_LAST_UPDATED = "2026.08.03";

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
