"use client";

import { useState } from "react";

// 아침 대시보드 하단 — 0인(이상 없는) 항목 + 준비 중(P2/P3) 항목을 한 줄로 접어둔다.
// "지금 할 것만 크게" 원칙: 0짜리 큰 카드를 렌더링하지 않고 여기로 모은다.
export default function DashboardCollapse({
  okItems,
  futureItems,
}: {
  okItems: string[];
  futureItems: { label: string; phase: number }[];
}) {
  const [open, setOpen] = useState(false);

  if (okItems.length === 0 && futureItems.length === 0) return null;

  const preview = okItems.slice(0, 4).join(", ");
  const more = okItems.length > 4 ? ` 외 ${okItems.length - 4}개` : "";

  return (
    <div className="rounded-xl border border-dashed border-cream-300 bg-cream-100/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm text-ink-500">
          이상 없는 항목 <span className="font-semibold text-navy-700">{okItems.length}개</span>
          {preview && <span className="text-ink-500"> — {preview}{more}</span>}
        </span>
        <span className="shrink-0 text-xs text-ink-500">
          {open ? "▴ 접기" : "▾ 펼쳐보기"}
        </span>
      </button>

      {open && (
        <div className="space-y-1.5 border-t border-cream-300 px-4 py-3">
          {okItems.map((label) => (
            <div key={label} className="flex items-center gap-2 text-sm text-navy-700">
              <span className="size-1.5 rounded-full bg-success" />
              <span className="flex-1">{label}</span>
              <span className="text-xs text-ink-500">이상 없음</span>
            </div>
          ))}
          {futureItems.map((it) => (
            <div key={it.label} className="flex items-center gap-2 text-sm text-ink-500">
              <span className="size-1.5 rounded-full bg-cream-300" />
              <span className="flex-1">{it.label}</span>
              <span className="rounded-full bg-cream-200 px-1.5 py-0.5 text-[10px] font-medium text-ink-500">
                P{it.phase} 준비 중
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
