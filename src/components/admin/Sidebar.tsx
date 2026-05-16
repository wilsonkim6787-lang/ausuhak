"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/[locale]/login/actions";

// PART E-1: 좌측 사이드바 메뉴 18개 (Phase 1 = 5개 활성 / 나머지 placeholder)
const menus = [
  { href: "/admin", label: "🌅 아침 대시보드", phase: 1 },
  { href: "/admin/students", label: "📊 학생 관리", phase: 1 },
  { href: "/admin/students/kanban", label: "📋 학생 칸반", phase: 2 },
  { href: "/admin/quotes", label: "💵 견적서", phase: 1 },
  { href: "/admin/payments", label: "💰 결제·커미션", phase: 1 },
  { href: "/admin/care", label: "🩺 학생 자동 케어", phase: 1 },
  { href: "/admin/activity", label: "🛡️ 활동 로그", phase: 1 },
  { href: "/admin/issues", label: "🚨 이슈 트래킹", phase: 2 },
  { href: "/admin/faqs", label: "📚 FAQ 통합 관리", phase: 1 },
  { href: "/admin/cases", label: "🧠 케이스 학습", phase: 2 },
  { href: "/admin/db-updates", label: "🔄 DB 업데이트", phase: 3 },
  { href: "/admin/graduates", label: "🎓 졸업생 DB", phase: 2 },
  { href: "/admin/staff", label: "👥 직원 관리", phase: 2 },
  { href: "/admin/blog", label: "✍️ 블로그", phase: 4 },
  { href: "/admin/youtube", label: "📺 유튜브", phase: 3 },
  { href: "/admin/ads", label: "📢 카톡 광고", phase: 4 },
  { href: "/admin/medical", label: "🩺 의대 도구", phase: 2 },
  { href: "/admin/stats", label: "📈 통계", phase: 2 },
  { href: "/admin/settings", label: "⚙️ 사이트 설정", phase: 1 },
];

export default function Sidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin" || pathname === "/ko/admin";
    return pathname.startsWith(href) || pathname.startsWith(`/ko${href}`);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-full bg-navy-900 p-2 text-white shadow-md hover:bg-navy-800 md:hidden"
        aria-label="메뉴 열기"
      >
        <Menu className="size-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-cream-300 bg-white transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-cream-300 px-5 py-5">
          <Link href="/admin" className="font-display text-lg font-bold text-navy-900">
            ausuhak
            <span className="italic text-gold-600">.com</span>
            <span className="ml-1 text-[10px] font-normal text-ink-500">admin</span>
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
              const isPhase1 = m.phase === 1;
              const itemClass = `flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-navy-900 font-semibold text-white"
                  : isPhase1
                    ? "text-navy-700 hover:bg-cream-200"
                    : "cursor-not-allowed text-ink-300"
              }`;
              const inner = (
                <>
                  <span>{m.label}</span>
                  {!isPhase1 && (
                    <span className="rounded-full bg-cream-200 px-1.5 py-0.5 text-[9px] font-medium text-ink-500">
                      P{m.phase}
                    </span>
                  )}
                </>
              );
              return (
                <li key={m.href}>
                  {isPhase1 ? (
                    <Link href={m.href} onClick={() => setOpen(false)} className={itemClass}>
                      {inner}
                    </Link>
                  ) : (
                    <span className={itemClass} aria-disabled="true">
                      {inner}
                    </span>
                  )}
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

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
