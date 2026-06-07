import {
  PHASES,
  phaseIsComplete,
  currentPhaseIndex,
  type SubstepStatus,
} from "@/lib/progress";

// 5 phase 가로 진행바. 완료 = gold 체크 / 현재 = navy 확대+glow / 예정 = 빈 회색.
// 뒤 트랙 라인 + 현재 phase 까지 gold 채움. 표시 전용 (no interactivity).
export default function PhaseBar({
  statusMap,
}: {
  statusMap: Record<string, SubstepStatus>;
}) {
  const curIdx = currentPhaseIndex(statusMap);
  const fillPct = curIdx * 20; // 5 phase → 셀 폭 20%, 중심 10%/30%/.../90%

  return (
    <div className="relative px-1 py-1">
      {/* 트랙 (회색) — 첫·마지막 dot 중심(10%~90%) */}
      <div className="absolute left-[10%] right-[10%] top-[18px] h-1 rounded-full bg-cream-300" />
      {/* gold 채움 — 현재 phase 까지 */}
      <div
        className="absolute left-[10%] top-[18px] h-1 rounded-full bg-gold-500 transition-all"
        style={{ width: `${fillPct}%` }}
      />

      <ol className="relative grid grid-cols-5">
        {PHASES.map((phase, i) => {
          const complete = phaseIsComplete(phase, statusMap);
          const current = i === curIdx;

          return (
            <li key={phase.key} className="flex flex-col items-center gap-1.5">
              <span
                className={
                  current
                    ? "flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white ring-4 ring-navy-900/15"
                    : complete
                      ? "flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-white"
                      : "flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 bg-cream-200 text-sm font-semibold text-ink-400"
                }
              >
                {complete ? "✓" : i + 1}
              </span>
              <span
                className={`text-center text-[11px] leading-tight ${
                  current
                    ? "font-bold text-navy-900"
                    : complete
                      ? "font-medium text-navy-700"
                      : "text-ink-400"
                }`}
              >
                {phase.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
