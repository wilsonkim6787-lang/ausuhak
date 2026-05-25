import PlaceholderPage from "@/components/admin/PlaceholderPage";

export default function AdminAdsPage() {
  return (
    <PlaceholderPage
      emoji="📢"
      title="카톡 광고"
      phase={4}
      body="카카오 비즈니스 광고 캠페인·전환 추적. Phase 4 (마케팅 단계) 에서 본격 활성화. 사업자 등록 + 카카오 비즈채널 인증 필요."
      bullets={[
        "캠페인별 UTM 추적 (web_diagnose 등 source 매핑)",
        "광고 → 진단 → 결제 conversion funnel",
        "ROI / 클릭당 비용 / 학생 획득 비용",
      ]}
      related={[
        { href: "/admin/activity", label: "활동 로그 (signup·oauth_click 이벤트)" },
        { href: "/admin/students?filter=new_today", label: "오늘 신규 학생" },
      ]}
    />
  );
}
