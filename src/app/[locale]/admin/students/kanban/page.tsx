// 기존 /admin/students/kanban 라우트 → /admin/students?view=kanban 으로 통합.
// 외부 link 호환용 redirect.

import { redirect } from "next/navigation";

export default async function KanbanRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && v) params.set(k, v);
  }
  params.set("view", "kanban");
  redirect(`/admin/students?${params.toString()}`);
}
