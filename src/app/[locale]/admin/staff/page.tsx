import PlaceholderPage from "@/components/admin/PlaceholderPage";

export default function AdminStaffPage() {
  return (
    <PlaceholderPage
      emoji="👥"
      title="직원 관리"
      phase={2}
      body="직원 계정·role·담당 학생·활동 추적. 직원 수 늘면 활성화. 현재는 super_admin (Wilson) 단독 운영."
      bullets={[
        "직원 계정 생성·비활성화",
        "담당 학생 할당 / 학생별 staff_id 매핑",
        "직원 활동 로그 (activity_logs 필터)",
      ]}
      related={[
        { href: "/staff", label: "직원 홈 (현재)" },
        { href: "/admin/activity", label: "활동 로그" },
      ]}
    />
  );
}
