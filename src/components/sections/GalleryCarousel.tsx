"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type GalleryItem = {
  id: string;
  image_url: string;
  caption: string | null;
};

const ROTATE_MS = 3000;

export default function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  const count = items.length;
  const [idx, setIdx] = useState(() => (count > 0 ? Math.floor(Math.random() * count) : 0));
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, count]);

  if (count === 0) return null;

  const current = items[idx];
  const goPrev = () => setIdx((i) => (i - 1 + count) % count);
  const goNext = () => setIdx((i) => (i + 1) % count);

  return (
    <div
      className="relative mx-auto max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.id}
          src={current.image_url}
          alt={current.caption ?? "갤러리 사진"}
          className="aspect-[4/3] w-full object-cover transition-opacity duration-500"
          loading="lazy"
        />
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="이전"
            className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy-900 shadow-sm backdrop-blur-sm transition hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="다음"
            className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy-900 shadow-sm backdrop-blur-sm transition hover:bg-white"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {current.caption && (
        <p className="mt-3 text-center text-sm text-ink-500">{current.caption}</p>
      )}

      {count > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`사진 ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-6 bg-gold-600" : "w-1.5 bg-cream-300 hover:bg-gold-600/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
