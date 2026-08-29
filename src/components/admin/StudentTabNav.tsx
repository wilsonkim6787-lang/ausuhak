"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

// BLOCK 4 — 학생 상세 = 4탭 (진행 / 서류 / 메시지 / 메모).
const TABS: { href: string; label: string }[] = [
  { href: "", label: "진행" },
  { href: "/documents", label: "서류" },
  { href: "/messages", label: "메시지" },
  { href: "/notes", label: "메모" },
];

export default function StudentTabNav({
  studentId,
  unreadMessages = 0,
}: {
  studentId: string;
  unreadMessages?: number;
}) {
  const pathname = usePathname();
  const base = `/admin/students/${studentId}`;
  // localePrefix "as-needed" — 기본(ko) 경로엔 /ko prefix 가 붙지 않음

  const matches = (href: string) => {
    if (!pathname.startsWith(base)) return false;
    const sub = pathname.slice(base.length);
    if (href === "") {
      // 진행 탭 = 기본. 다른 탭 경로가 아니면(applications/deadlines/payments 등
      // 진행 화면에서 들어가는 하위 페이지 포함) 활성 유지.
      return !TABS.some((t) => t.href !== "" && sub.startsWith(t.href));
    }
    return sub.startsWith(href);
  };

  return (
    <nav className="-mx-1 overflow-x-auto" role="tablist" aria-label="학생 상세 탭">
      <ul className="flex min-w-max gap-1 px-1 py-1">
        {TABS.map((t) => {
          const active = matches(t.href);
          return (
            <li key={t.href || "progress"}>
              <Link
                href={`${base}${t.href}`}
                role="tab"
                aria-selected={active}
                className={cn(
                  "block whitespace-nowrap rounded-full px-5 py-1.5 text-sm font-semibold transition",
                  active
                    ? "bg-navy-900 text-white"
                    : "border border-cream-300 bg-white text-navy-700 hover:bg-cream-200",
                )}
              >
                {t.label}
                {t.href === "/messages" && unreadMessages > 0 && (
                  <span className="ml-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
