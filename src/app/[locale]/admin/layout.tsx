import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import { logUnauthorized } from "@/lib/audit/log";
import Sidebar from "@/components/admin/Sidebar";
import Footer from "@/components/layout/Footer";

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
  if (!user) {
    await logUnauthorized("/admin", "super_admin", null, null);
    redirect("/login");
  }
  if (user.role !== "super_admin") {
    await logUnauthorized("/admin", "super_admin", user.role, user.id);
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-cream-100">
      <Sidebar userName={user.name} userEmail={user.email} />
      <div className="ml-0 flex flex-1 flex-col md:ml-64">
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
