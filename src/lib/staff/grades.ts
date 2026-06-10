// 직원 등급 프리셋 — staff_permissions 16키를 묶음으로 한 번에 적용.
// Wilson(super_admin)은 등급 위 최고 관리자. 등급은 role='staff' 직원에만 적용.

export const ALL_PERM_KEYS = [
  "view_all_students",
  "edit_student_info",
  "check_documents",
  "upload_offer",
  "confirm_payment",
  "write_shared_memo",
  "view_manuals",
  "edit_manuals",
  "view_internal_faqs",
  "edit_internal_faqs",
  "write_blog",
  "publish_blog",
  "send_kakao_alert",
  "create_quote",
  "view_stats",
  "manage_other_staff_permissions",
] as const;

export type PermKey = (typeof ALL_PERM_KEYS)[number];

export type StaffGrade = {
  key: string;
  label: string;
  desc: string;
  perms: PermKey[];
};

const VIEWER: PermKey[] = [
  "view_all_students",
  "view_manuals",
  "view_internal_faqs",
  "view_stats",
];
const CONSULTANT: PermKey[] = [
  ...VIEWER,
  "edit_student_info",
  "check_documents",
  "upload_offer",
  "write_shared_memo",
  "send_kakao_alert",
  "create_quote",
];
const SENIOR: PermKey[] = [
  ...CONSULTANT,
  "confirm_payment",
  "edit_manuals",
  "edit_internal_faqs",
  "write_blog",
  "publish_blog",
];
const MANAGER: PermKey[] = [...ALL_PERM_KEYS];

export const STAFF_GRADES: StaffGrade[] = [
  { key: "viewer", label: "조회 전용", desc: "학생·매뉴얼·FAQ·통계 조회만", perms: VIEWER },
  { key: "consultant", label: "상담 직원", desc: "학생 관리·서류·견적·카톡까지", perms: CONSULTANT },
  { key: "senior", label: "선임 직원", desc: "결제 확정·콘텐츠 편집/발행까지", perms: SENIOR },
  { key: "manager", label: "매니저", desc: "전체 권한 + 타 직원 권한 관리", perms: MANAGER },
];

// 현재 활성 권한 집합이 어느 등급과 정확히 일치하는지 (없으면 null = 커스텀)
export function detectGrade(activeKeys: Set<string>): StaffGrade | null {
  for (const g of STAFF_GRADES) {
    if (
      g.perms.length === activeKeys.size &&
      g.perms.every((k) => activeKeys.has(k))
    ) {
      return g;
    }
  }
  return null;
}
