import type { Metadata } from "next";
import "@/components/admin/admin.css";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import { AdminNavLinks } from "@/components/admin/client";

export const metadata: Metadata = {
  title: "관리",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sb, profile } = await requireAdmin();
  const [students, mail, consults, unread] = await Promise.all([
    sb.from("crm_students").select("id", { count: "exact", head: true }).eq("status", "active"),
    sb.from("crm_inbound_emails").select("id", { count: "exact", head: true }).eq("status", "new"),
    sb.from("consult_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    sb.from("crm_messages").select("id", { count: "exact", head: true }).eq("from_admin", false).eq("read_by_admin", false),
  ]);
  const items = [
    { href: "/admin", label: "오늘 할 일", count: unread.count ?? 0, alert: true },
    { href: "/admin/students", label: "학생", count: students.count ?? 0 },
    { href: "/admin/mail", label: "메일 서류함", count: mail.count ?? 0, alert: true },
    { href: "/admin/consults", label: "상담 신청", count: consults.count ?? 0, alert: true },
    { href: "/admin/minors", label: "미성년 학생" },
    { href: "/admin/stats", label: "홈페이지 반응" },
  ];
  return (
    <div className="ad">
      <nav aria-label="관리 메뉴" className="ad-nav">
        <div className="ad-brand">
          <b>AusUhak</b>
          <span>호주유학 관리</span>
        </div>
        <AdminNavLinks items={items} />
        <div className="ad-me">
          <span>{profile.name || "Wilson Kim"} · 대표</span>
          <form action={logoutAction}>
            <button type="submit">로그아웃</button>
          </form>
        </div>
      </nav>
      <main className="ad-main">{children}</main>
    </div>
  );
}
