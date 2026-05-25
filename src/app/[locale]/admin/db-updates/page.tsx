import PlaceholderPage from "@/components/admin/PlaceholderPage";

export default function DbUpdatesPage() {
  return (
    <PlaceholderPage
      emoji="🔄"
      title="DB 업데이트"
      phase={3}
      body="학교·이민·비자 등 외부 데이터 sync 자동화. Phase 3 (사업자 등록 + cron) 활성화 후 자동 수집·차분 비교·승인 흐름."
      bullets={[
        "monitoring_sites (411 사이트) 정기 스크랩",
        "school catalog 변경 감지 + Wilson 승인 → 정본 반영",
        "비자/이민 정책 변경 alert",
      ]}
      related={[
        { href: "/admin/sites", label: "자료 사이트 411 (현재)" },
        { href: "/admin/activity", label: "활동 로그" },
      ]}
    />
  );
}
