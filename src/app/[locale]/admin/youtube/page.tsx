import PlaceholderPage from "@/components/admin/PlaceholderPage";

export default function AdminYoutubePage() {
  return (
    <PlaceholderPage
      emoji="📺"
      title="유튜브"
      phase={3}
      body="유튜브 채널 콘텐츠·통계 sync. Phase 3 (자동화) 단계 — YouTube Data API 연동으로 영상 메타데이터 자동 수집."
      bullets={[
        "최신 영상 메타데이터 sync (제목·조회수·반응)",
        "FAQ·블로그와 영상 cross-link",
        "Wilson 노하우 영상 시리즈 관리",
      ]}
      related={[
        { href: "/admin/blog", label: "블로그 (P4)" },
        { href: "/admin/faqs", label: "FAQ 통합 관리" },
      ]}
    />
  );
}
