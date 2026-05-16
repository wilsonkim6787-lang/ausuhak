"use client";

// OfferShowcase 의 client carousel — PC 3개씩 자동 회전 (5초), 모바일 기존 swipe.
// hover 시 일시정지, dots 클릭으로 수동 점프.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type OfferItem = {
  id?: string;
  school: string;
  program: string | null;
  year: number | null;
  student_alias: string | null;
  image_url: string | null;
  is_pdf?: boolean;
};

const ROTATE_MS = 5000;

export default function OfferCarousel({
  items,
  placeholderLabel,
}: {
  items: OfferItem[];
  placeholderLabel: string;
}) {
  const groups: OfferItem[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    groups.push(items.slice(i, i + 3));
  }
  const groupCount = Math.max(groups.length, 1);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || groupCount <= 1) return;
    timerRef.current = setInterval(() => {
      setPage((p) => (p + 1) % groupCount);
    }, ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, groupCount]);

  const current = groups[page] ?? [];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 모바일 = 가로 스와이프 전체 / PC = 현재 페이지 3개만 */}
      <div className="-mx-4 overflow-x-auto pb-2 sm:mx-0 sm:overflow-visible sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* PC 페이지 그리드 */}
        <ul className="hidden snap-x snap-mandatory gap-5 sm:grid sm:grid-cols-3 sm:px-0">
          {current.map((o, i) => (
            <CardLi key={`pc-${page}-${o.id ?? i}`} o={o} placeholderLabel={placeholderLabel} />
          ))}
        </ul>
        {/* 모바일 전체 스와이프 */}
        <ul className="flex snap-x snap-mandatory gap-5 px-4 sm:hidden">
          {items.map((o, i) => (
            <CardLi key={`m-${o.id ?? i}`} o={o} placeholderLabel={placeholderLabel} />
          ))}
        </ul>
      </div>

      {/* dots (PC 만 / 그룹 2개 이상일 때) */}
      {groupCount > 1 && (
        <div className="mt-5 hidden items-center justify-center gap-2 sm:flex">
          {groups.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`페이지 ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === page ? "w-8 bg-gold-600" : "w-1.5 bg-cream-300 hover:bg-gold-600/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CardLi({ o, placeholderLabel }: { o: OfferItem; placeholderLabel: string }) {
  const card = (
    <div className="group h-full overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/5] border-b border-cream-300">
        {o.image_url && !o.is_pdf ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={o.image_url}
            alt={`${o.school} 합격증`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : o.image_url && o.is_pdf ? (
          <>
            {/* PC: PDF 첫 페이지 인라인 렌더링 (브라우저 내장 viewer). pointer-events:none → 부모 Link 클릭 통과 */}
            <object
              data={`${o.image_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`}
              type="application/pdf"
              className="pointer-events-none absolute inset-0 h-full w-full bg-white"
              aria-label={`${o.school} PDF 합격증`}
            >
              {/* fallback: 모바일·PDF 미지원 브라우저 */}
              <div className="flex h-full items-center justify-center bg-cream-200">
                <div className="text-center">
                  <span className="text-5xl">📄</span>
                  <p className="mt-3 text-[11px] font-bold tracking-[0.2em] text-ink-700">
                    PDF 합격증
                  </p>
                  <p className="mt-1 text-[10px] text-ink-500">{o.year ?? "—"} OFFER</p>
                </div>
              </div>
            </object>
          </>
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{
              background:
                "repeating-linear-gradient(135deg, #FBF7EE 0, #FBF7EE 10px, #F5EFD9 10px, #F5EFD9 20px)",
            }}
          >
            <div className="text-center">
              <div className="font-display text-5xl text-gold-600 opacity-50">
                {"\u{1F4DC}"}
              </div>
              <p className="mt-3 text-[11px] font-bold tracking-[0.2em] text-ink-500">
                {placeholderLabel}
              </p>
              <p className="mt-1 text-[10px] text-ink-500">{o.year ?? "—"} OFFER</p>
            </div>
          </div>
        )}
        {o.student_alias && (
          <div className="absolute right-3 top-3 rounded-full bg-navy-900/85 px-3 py-1 text-[10px] font-bold tracking-wider text-cream-100">
            {o.student_alias}
          </div>
        )}
        {o.id && (
          <div className="absolute bottom-3 left-3 rounded-full bg-gold-600/90 px-3 py-1 text-[10px] font-bold tracking-wider text-white opacity-0 transition group-hover:opacity-100">
            후기 보기 →
          </div>
        )}
      </div>
      <div className="p-5">
        {o.year && (
          <p className="text-xs font-bold tracking-wider text-gold-600">{o.year}</p>
        )}
        <p className="mt-1.5 text-sm font-bold leading-snug text-navy-900 sm:text-base">
          {o.school}
        </p>
        {o.program && (
          <p className="mt-1 text-xs leading-relaxed text-ink-700 sm:text-sm">
            {o.program}
          </p>
        )}
      </div>
    </div>
  );
  return (
    <li className="w-[80vw] max-w-[340px] shrink-0 list-none snap-center sm:w-auto sm:max-w-none">
      {o.id ? (
        <Link href={`/offers/${o.id}`} className="block h-full">
          {card}
        </Link>
      ) : (
        card
      )}
    </li>
  );
}
