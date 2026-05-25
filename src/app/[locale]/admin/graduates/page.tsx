// 졸업생 DB = /admin/offers 에 통합 (story markdown 으로 졸업·진로까지 담음).
// [project-offers-unified] 메모리 참조.

import { redirect } from "next/navigation";

export default function GraduatesRedirect() {
  redirect("/admin/offers");
}
