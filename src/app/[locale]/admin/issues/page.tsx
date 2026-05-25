// 이슈 트래킹 = activity_logs 가 본체 (보안·권한·변경 자동 기록).
// 별도 페이지 만들 가치 X — /admin/activity 로 redirect.

import { redirect } from "next/navigation";

export default function IssuesRedirect() {
  redirect("/admin/activity");
}
