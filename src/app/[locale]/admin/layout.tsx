import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import Sidebar from "@/components/admin/Sidebar";

// /admin/* 진입 시 1차 보호 (서버 컴포넌트 레벨).
// 미들웨어가 cookie 기반으로 1차 차단하고, 이 레이아웃이 role까지 다시 검증.
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "super_admin") redirect("/");

  return (
    <div className="flex min-h-screen bg-cream-100">
      <Sidebar userName={user.name} userEmail={user.email} />
      <main className="ml-0 flex-1 md:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
