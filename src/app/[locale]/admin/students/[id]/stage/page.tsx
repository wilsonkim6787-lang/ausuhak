// 옛 /stage 라우트 → 기본 정보 페이지에 통합. 외부 link 호환용 redirect.

import { redirect } from "next/navigation";

export default async function StageRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // #stage 앵커는 대상 페이지에 없어 무의미 → 상세 페이지로만 이동
  redirect(`/admin/students/${id}`);
}
