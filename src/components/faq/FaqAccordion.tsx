"use client";

import { useState } from "react";

interface Item {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: Item[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <ul className="space-y-2">
      {items.map((it, i) => {
        const open = openIdx === i;
        return (
          <li
            key={i}
            className="overflow-hidden rounded-xl border border-cream-300 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-cream-100 sm:px-6 sm:py-5"
            >
              <span className="text-base font-semibold text-navy-900 sm:text-lg">
                {it.q}
              </span>
              <span
                aria-hidden
                className={`shrink-0 font-display text-2xl text-gold-600 transition-transform ${
                  open ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {open && (
              <div className="whitespace-pre-line border-t border-cream-300 px-5 py-4 text-sm leading-relaxed text-ink-700 sm:px-6 sm:py-5 sm:text-base">
                {it.a}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
