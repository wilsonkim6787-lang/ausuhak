"use client";

import { useState } from "react";

// 학생 자동 케어 — 하단 "케어 규칙 7개" 접이식 참조 패널.
// 코드 조건 텍스트 없음. 평이한 한국어 + 윌슨/학생 태그 + N명.
export default function CareRulesPanel({
  rules,
}: {
  rules: { label: string; audience: "wilson" | "student"; count: number }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-dashed border-cream-300 bg-cream-100/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm text-navy-700">
          케어 규칙 <span className="font-semibold">{rules.length}개</span> — 작동 중
        </span>
        <span className="shrink-0 text-xs text-ink-500">
          {open ? "▴ 접기" : "▾ 눌러서 펼치기"}
        </span>
      </button>

      {open && (
        <ul className="divide-y divide-cream-200 border-t border-cream-300">
          {rules.map((r, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  r.audience === "wilson"
                    ? "bg-gold-100 text-gold-600"
                    : "bg-info/15 text-info"
                }`}
              >
                {r.audience === "wilson" ? "윌슨" : "학생"}
              </span>
              <span className="min-w-0 flex-1 text-navy-700">
                {r.label}
                {r.audience === "student" && (
                  <span className="ml-1.5 text-[10px] text-ink-500">· 사업자등록 후 작동</span>
                )}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  r.count > 0 ? "bg-error text-white" : "bg-cream-200 text-ink-500"
                }`}
              >
                {r.count}명
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
