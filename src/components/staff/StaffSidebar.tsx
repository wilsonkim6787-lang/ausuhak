"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/[locale]/login/actions";

// PART G-3: 기본 메뉴 (모든 직원).
// 권한별 동적 메뉴는 Phase 3 — 일단 기본 5개만 활성, 나머지는 보류.
const menus = [
  { href: "/staff", label: "🌅 오늘 할 일", active: true },
  { href: "/staff/students", label: "📋 담당 학생", active: true },
  { href: "/staff/manuals", label: "📚 매뉴얼 475", active: true },
  { href: "/staff/faqs", label: "🔍 내부 FAQ 84", active: true },
  { href: "/staff/cases", label: "🧠 케이스 학습", active: true },
];

export default function StaffSidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/staff") return pathname === "/staff" || pathname === "/ko/staff";
    return pathname.startsWith(href) || pathname.startsWith(`/ko${href}`);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-full bg-navy-900 p-2 text-white shadow-md hover:bg-navy-800 md:hidden"
        aria-label="메뉴 열기"
      >
        <Menu className="size-5" />
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-cream-300 bg-white transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-cream-300 px-5 py-5">
          <Link href="/staff" className="font-display text-lg font-bold text-navy-900">
            ausuhak
            <span className="italic text-gold-600">.com</span>
            <span className="ml-1 text-[10px] font-normal text-ink-500">staff</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-navy-900 md:hidden"
            aria-label="메뉴 닫기"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-0.5">
            {menus.map((m) => {
              const active = isActive(m.href);
              return (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-navy-900 font-semibold text-white"
                        : "text-navy-700 hover:bg-cream-200"
                    }`}
                  >
                    <span>{m.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-cream-300 px-5 py-4">
          <p className="text-xs font-semibold text-navy-900">{userName}</p>
          <p className="truncate text-[10px] text-ink-500">{userEmail}</p>
          <form action={logoutAction} className="mt-3">
            <Button type="submit" variant="secondary" size="sm" className="w-full">
              <LogOut className="size-3.5" />
              로그아웃
            </Button>
          </form>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
