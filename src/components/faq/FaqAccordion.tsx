"use client";

import { useState } from "react";
import { renderAnswer } from "./answerRenderer";

interface Item {
  q: string;
  a: string;
}

export default function FaqAccordion({ items }: { items: Item[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <ul className="space-y-3">
      {items.map((it, i) => {
        const open = openIdx === i;
        return (
          <li
            key={i}
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
              open ? "border-gold-600 shadow-md" : "border-cream-300"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-cream-100/60 sm:px-7 sm:py-5"
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
              <div className="border-t border-cream-300 bg-cream-100/40 px-5 py-5 sm:px-7 sm:py-6">
                {renderAnswer(it.a)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
