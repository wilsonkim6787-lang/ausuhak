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
      {/* 인쇄 시(견적서 PDF 저장) 사이드바가 숨겨지므로 좌측 여백도 제거 (print:ml-0) */}
      <div className="ml-0 flex flex-1 flex-col md:ml-64 print:ml-0">
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </div>
        </main>
        {/* 견적서 PDF 인쇄물에 사이트 푸터가 딸려 나오지 않도록 숨김 */}
        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    </div>
  );
}
