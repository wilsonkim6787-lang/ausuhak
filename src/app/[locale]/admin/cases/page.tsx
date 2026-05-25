// 케이스 학습 = /admin/offers 에 통합 (합격증·후기·졸업생 케이스 모두).
// [project-offers-unified] 메모리 참조.

import { redirect } from "next/navigation";

export default function CasesRedirect() {
  redirect("/admin/offers");
}
