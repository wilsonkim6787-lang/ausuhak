"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type TabDef = {
  href: string;          // /admin/students/[id] 뒤에 붙는 경로 (""=기본)
  label: string;
  phase: 1 | 2 | 3;
};

// PART E-4 11탭. Phase 1 활성 3개 / 나머지 disabled.
const TABS: TabDef[] = [
  { href: "",                label: "기본 정보",     phase: 1 },
  { href: "/stage",          label: "진행 단계",     phase: 1 },
  { href: "/notes",          label: "메모",         phase: 1 },
  { href: "/applications",   label: "학교 지원",     phase: 2 },
  { href: "/documents",      label: "서류",         phase: 2 },
  { href: "/deadlines",      label: "마감일",       phase: 2 },
  { href: "/payments",       label: "결제",         phase: 2 },
  { href: "/visa",           label: "비자",         phase: 2 },
  { href: "/notifications",  label: "알림 이력",     phase: 2 },
  { href: "/activity",       label: "활동 로그",     phase: 3 },
  { href: "/assignments",    label: "담당 관리",     phase: 2 },
];

export default function StudentTabNav({ studentId }: { studentId: string }) {
  const pathname = usePathname();
  const base = `/admin/students/${studentId}`;
  const baseKo = `/ko${base}`;

  const matches = (href: string) => {
    const full = `${base}${href}`;
    const fullKo = `${baseKo}${href}`;
    if (href === "") {
      // 정확히 매칭만 (서브 탭 매칭 방지)
      return pathname === base || pathname === baseKo;
    }
    return pathname.startsWith(full) || pathname.startsWith(fullKo);
  };

  return (
    <nav
      className="-mx-1 overflow-x-auto"
      role="tablist"
      aria-label="학생 상세 탭"
    >
      <ul className="flex min-w-max gap-1 px-1 py-1">
        {TABS.map((t) => {
          const active = matches(t.href);
          const isPhase1 = t.phase === 1;
          const cls = cn(
            "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition",
            active
              ? "bg-navy-900 text-white"
              : isPhase1
                ? "border border-cream-300 bg-white text-navy-700 hover:bg-cream-200"
                : "border border-cream-300 bg-cream-100 text-ink-300",
          );
          const phaseBadge = !isPhase1 && (
            <span className="rounded-full bg-cream-200 px-1.5 py-0.5 text-[9px] font-medium text-ink-500">
              P{t.phase}
            </span>
          );

          return (
            <li key={t.href || "basic"}>
              {isPhase1 ? (
                <Link href={`${base}${t.href}`} className={cls} role="tab" aria-selected={active}>
                  {t.label}
                  {phaseBadge}
                </Link>
              ) : (
                <span className={cls} aria-disabled="true">
                  {t.label}
                  {phaseBadge}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
