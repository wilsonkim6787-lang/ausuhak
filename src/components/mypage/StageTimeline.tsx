import { STAGES } from "@/lib/stages";

// PART F-5: 마이페이지 메인의 Stage 12 시각화.
// 현재 stage 이전 = ✅ / 현재 = ▶️ / 이후 = ⬜
export default function StageTimeline({ currentStage }: { currentStage: number }) {
  return (
    <ol className="space-y-2">
      {STAGES.map((s) => {
        const done = s.num < currentStage;
        const active = s.num === currentStage;

        return (
          <li
            key={s.num}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
              active
                ? "border-gold-600 bg-gold-100/60 shadow-sm"
                : done
                ? "border-cream-300 bg-white/60 text-ink-500"
                : "border-cream-300/60 bg-cream-100/30 text-ink-500"
            }`}
          >
            <span
              className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                active
                  ? "bg-gold-600 text-white"
                  : done
                  ? "bg-success/20 text-success"
                  : "bg-cream-300 text-ink-500"
              }`}
            >
              {done ? "✓" : s.num}
            </span>
            <span
              className={`flex-1 text-sm ${
                active ? "font-semibold text-navy-900" : done ? "line-through" : ""
              }`}
            >
              {s.label}
            </span>
            {active && (
              <span className="rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gold-400">
                현재
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
