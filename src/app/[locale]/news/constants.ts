// 공개 News(소식) 페이지 공용 상수·헬퍼.
// DB blogs.category 값(admin/blog/constants.ts BLOG_CATEGORIES)을 공개용 표시명으로 매핑한다.

export const NEWS_CATEGORY_LABELS: Record<string, string> = {
  합격사례: "합격 소식",
  장학금: "장학금",
  비자: "비자·이민성",
  학교: "학교·입학일정",
  이벤트: "프로모션·이벤트",
  생활: "호주 생활",
  노하우: "유학 노하우",
  기타: "기타",
};

export function newsCategoryLabel(category: string | null): string {
  if (!category) return "공지";
  return NEWS_CATEGORY_LABELS[category] ?? category;
}

// "2026-08-03T…" → "2026.08.03"
export function formatNewsDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}`;
}

export type NewsListRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  published_at: string | null;
};
