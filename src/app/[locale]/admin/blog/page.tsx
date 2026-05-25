import PlaceholderPage from "@/components/admin/PlaceholderPage";

export default function AdminBlogPage() {
  return (
    <PlaceholderPage
      emoji="✍️"
      title="블로그"
      phase={4}
      body="ausuhak.com 블로그 글 작성·발행. SEO 콘텐츠 + Wilson 노하우 글. Phase 4 (콘텐츠·마케팅 단계) 에서 활성화."
      bullets={[
        "글 작성 (markdown) · 발행·draft",
        "카테고리 (학교·비자·생활·합격 사례)",
        "FAQ 365 와 cross-link",
        "Open Graph + sitemap",
      ]}
      related={[
        { href: "/admin/faqs", label: "FAQ 통합 관리 (현재)" },
        { href: "/admin/offers", label: "합격증 갤러리" },
      ]}
    />
  );
}
