import PlaceholderPage from "@/components/admin/PlaceholderPage";

export default function AdminMedicalToolPage() {
  return (
    <PlaceholderPage
      emoji="🩺"
      title="의대 도구"
      phase={2}
      body="ISAT/MMI 일정·점수 관리, 의대 학생 별도 케어 도구. 현재는 학생 기본 정보의 is_medical · medical_pathway 필드 + /medical 메인 페이지로 충분."
      bullets={[
        "ISAT 시험 일정·점수 입력 (학생별)",
        "MMI 인터뷰 일정·결과 기록",
        "의대 전용 critical_deadlines (isat_test/mmi_interview/gamsat)",
        "GAMSAT 트랙 별도 분기",
      ]}
      related={[
        { href: "/admin/students?is_medical=true", label: "의대 학생만 (현재)" },
        { href: "/medical", label: "/medical 사용자 페이지" },
      ]}
    />
  );
}
