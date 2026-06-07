"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

// BLOCK 4 — 학생 상세 = 3탭 (진행 / 서류 / 메모).
const TABS: { href: string; label: string }[] = [
  { href: "", label: "진행" },
  { href: "/documents", label: "서류" },
  { href: "/notes", label: "메모" },
];

export default function StudentTabNav({ studentId }: { studentId: string }) {
  const pathname = usePathname();
  const base = `/admin/students/${studentId}`;
  const baseKo = `/ko${base}`;

  const matches = (href: string) => {
    if (href === "") return pathname === base || pathname === baseKo;
    return pathname.startsWith(`${base}${href}`) || pathname.startsWith(`${baseKo}${href}`);
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
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
