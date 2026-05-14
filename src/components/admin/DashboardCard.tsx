import Link from "next/link";

// 대시보드 카드 (PART E-2). Phase 1 활성 = 클릭 시 해당 메뉴로 이동.
// Phase 2+ 위젯 = phase prop으로 회색 처리 + 클릭 X.
type Variant = "urgent" | "todo" | "kpi" | "info";

export default function DashboardCard({
  icon,
  label,
  count,
  href,
  phase,
  variant = "info",
  hint,
}: {
  icon: string;
  label: string;
  count: number | string;
  href?: string;
  phase?: 1 | 2 | 3 | 4;
  variant?: Variant;
  hint?: string;
}) {
  const isLocked = phase !== undefined && phase > 1;
  const isHot = variant === "urgent" && typeof count === "number" && count > 0;

  const ringClass = isHot
    ? "ring-2 ring-error/40"
    : "ring-1 ring-cream-300";

  const inner = (
    <div
      className={`flex h-full flex-col gap-2 rounded-xl bg-white p-4 shadow-sm transition ${ringClass} ${
        isLocked ? "opacity-60" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-base">{icon}</span>
        {phase && phase > 1 && (
          <span className="rounded-full bg-cream-200 px-1.5 py-0.5 text-[9px] font-medium text-ink-500">
            P{phase}
          </span>
        )}
      </div>
      <div
        className={`font-display text-2xl font-bold ${
          isHot ? "text-error" : "text-navy-900"
        }`}
      >
        {count}
      </div>
      <div className="text-xs leading-snug text-navy-700">{label}</div>
      {hint && <div className="text-[10px] text-ink-500">{hint}</div>}
    </div>
  );

  if (href && !isLocked) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
