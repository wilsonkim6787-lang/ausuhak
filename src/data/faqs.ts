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
