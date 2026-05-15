"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/[locale]/login/actions";

// PART F-5: 마이페이지 7개 메뉴
const ITEMS = [
  { href: "/mypage", label: "진행 단계", icon: "🎯" },
  { href: "/mypage/cards", label: "카드 7장", icon: "📄" },
  { href: "/mypage/quote", label: "견적서", icon: "📋" },
  { href: "/mypage/documents", label: "서류", icon: "📁" },
  { href: "/mypage/payments", label: "결제 내역", icon: "💳" },
  { href: "/mypage/self-guide", label: "셀프 가이드", icon: "📚" },
  { href: "/mypage/notifications", label: "알림", icon: "🔔" },
];

export default function MypageNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-cream-300 bg-white sm:border-b-0 sm:border-r sm:bg-cream-100/40">
      <div className="px-4 py-4 sm:px-5">
        <p className="text-xs font-semibold text-ink-500">마이페이지</p>
        <p className="mt-0.5 font-display text-lg font-bold text-navy-900">
          {userName} 님
        </p>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 sm:flex-col sm:gap-0.5 sm:overflow-visible sm:px-3">
        {ITEMS.map((item) => {
          // /mypage 만 정확 매칭 / 하위는 startsWith
          const active =
            item.href === "/mypage"
              ? pathname?.endsWith("/mypage") || pathname?.endsWith("/mypage/")
              : pathname?.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm transition sm:shrink ${
                active
                  ? "bg-navy-900 text-gold-400"
                  : "text-navy-700 hover:bg-cream-200"
              }`}
            >
              <span className="mr-1.5">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-cream-300 px-3 py-3 sm:px-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-xs text-ink-500 transition hover:bg-cream-200 hover:text-navy-900"
          >
            ← 로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
