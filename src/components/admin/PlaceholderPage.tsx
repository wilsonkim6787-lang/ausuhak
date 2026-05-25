// admin 사이드바 메뉴의 Phase 2/3/4 페이지용 공통 placeholder.
// 각 페이지가 일관된 안내·관련 link 형식으로 표시.

import Link from "next/link";

type Phase = 2 | 3 | 4;

const PHASE_LABEL: Record<Phase, string> = {
  2: "Phase 2 — 준비 중",
  3: "Phase 3 — 자동화 예정",
  4: "Phase 4 — 콘텐츠·마케팅 단계",
};

export default function PlaceholderPage({
  emoji,
  title,
  phase,
  body,
  bullets,
  related,
}: {
  emoji: string;
  title: string;
  phase: Phase;
  body: string;
  bullets?: string[];
  related?: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          {PHASE_LABEL[phase]}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          {emoji} {title}
        </h1>
      </header>

      <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <p className="text-sm text-ink-700">{body}</p>
        {bullets && bullets.length > 0 && (
          <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-ink-500">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </div>

      {related && related.length > 0 && (
        <div className="rounded-2xl border border-cream-300 bg-cream-100/40 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
            지금 사용 가능
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 shadow-sm hover:bg-cream-100"
                >
                  → {r.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
