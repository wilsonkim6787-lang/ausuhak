import { setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth/requireStaff";
import StaffSidebar from "@/components/staff/StaffSidebar";
import Footer from "@/components/layout/Footer";

export default async function StaffLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireStaff();

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <StaffSidebar userName={user.name} userEmail={user.email} />
      <main className="flex-1 md:pl-64">
        <div className="container mx-auto max-w-6xl px-4 py-8 pt-16 sm:px-6 sm:py-10 md:pt-10">
          {children}
        </div>
      </main>
      <div className="md:pl-64">
        <Footer />
      </div>
    </div>
  );
}
