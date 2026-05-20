// 매뉴얼 상세 — markdown 렌더링.
// requireStaff 가드. trusted content (Wilson 작성) 라서 dangerouslySetInnerHTML 안전.

import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { requireStaff } from "@/lib/auth/requireStaff";
import { createClient } from "@/lib/supabase/server";

type Manual = {
  id: string;
  number: number;
  category: string | null;
  title: string;
  content: string;
  updated_at: string;
};

marked.setOptions({
  gfm: true,
  breaks: false,
});

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export default async function StaffManualDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_manuals")
    .select("id, number, category, title, content, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  const m = data as Manual;
  const html = await marked.parse(m.content);

  const backHref = m.category
    ? `/staff/manuals?cat=${encodeURIComponent(m.category)}`
    : "/staff/manuals";

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 transition hover:text-gold-600"
      >
        <span aria-hidden>←</span> 매뉴얼 목록
      </Link>

      <header className="rounded-2xl border border-cream-300 bg-white px-6 py-5 shadow-sm sm:px-8 sm:py-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex h-8 w-14 shrink-0 items-center justify-center rounded-full bg-gold-100 font-mono text-xs font-bold text-gold-600">
            #{m.number}
          </span>
          {m.category && (
            <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-medium text-navy-700">
              {m.category}
            </span>
          )}
          <span className="ml-auto text-[11px] text-ink-500">
            최종 수정 {formatUpdatedAt(m.updated_at)}
          </span>
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
          {m.title}
        </h1>
      </header>

      <article
        className="manual-markdown rounded-2xl border border-cream-300 bg-white px-6 py-7 shadow-sm sm:px-10 sm:py-9"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="flex items-center justify-between border-t border-cream-300 pt-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 transition hover:text-gold-600"
        >
          <span aria-hidden>←</span> 매뉴얼 목록
        </Link>
        <a
          href="https://pf.kakao.com/_GadTX"
          target="_blank"
          rel="noopener noreferrer"
          data-kakao-source="staff-manual-detail"
          className="inline-flex items-center gap-2 rounded-full bg-gold-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
        >
          학생에게 안내 카톡 →
        </a>
      </div>

      <style>{`
        .manual-markdown { color: #1A1A1A; line-height: 1.85; font-size: 15px; }
        @media (min-width: 640px) { .manual-markdown { font-size: 16px; } }
        .manual-markdown h1 { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: #0A1628; margin: 1.75rem 0 0.75rem; line-height: 1.3; }
        .manual-markdown h2 { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: #0A1628; margin: 2rem 0 0.75rem; padding-top: 1rem; border-top: 1px solid #E8E0D0; line-height: 1.35; }
        .manual-markdown h2:first-of-type { border-top: 0; padding-top: 0; margin-top: 0; }
        .manual-markdown h3 { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: #0A1628; margin: 1.25rem 0 0.5rem; }
        .manual-markdown h4 { font-weight: 700; color: #C9962A; margin: 1rem 0 0.35rem; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .manual-markdown p { margin: 0.6rem 0; }
        .manual-markdown ul, .manual-markdown ol { margin: 0.6rem 0 0.75rem 1.5rem; }
        .manual-markdown li { margin: 0.35rem 0; padding-left: 0.25rem; }
        .manual-markdown ul { list-style: disc; }
        .manual-markdown ol { list-style: decimal; }
        .manual-markdown ul ul, .manual-markdown ol ol, .manual-markdown ul ol, .manual-markdown ol ul { margin: 0.25rem 0 0.25rem 1.25rem; }
        .manual-markdown strong { color: #0A1628; font-weight: 700; }
        .manual-markdown em { color: #4A4A4A; font-style: italic; }
        .manual-markdown code { background: #FBF7EE; padding: 0.15rem 0.45rem; border-radius: 5px; font-size: 0.88em; font-family: var(--font-mono); color: #C9962A; }
        .manual-markdown pre { background: #FBF7EE; padding: 1rem 1.25rem; border-radius: 10px; overflow-x: auto; margin: 1rem 0; border: 1px solid #E8E0D0; }
        .manual-markdown pre code { background: transparent; padding: 0; color: #1A1A1A; font-size: 0.85em; }
        .manual-markdown blockquote { border-left: 4px solid #C9962A; padding: 0.5rem 1rem; margin: 1rem 0; color: #4A4A4A; background: #FBF7EE; border-radius: 0 8px 8px 0; }
        .manual-markdown blockquote p { margin: 0.25rem 0; }
        .manual-markdown hr { border: 0; border-top: 1px solid #E8E0D0; margin: 2rem 0; }
        .manual-markdown table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.92em; }
        .manual-markdown th, .manual-markdown td { border: 1px solid #E8E0D0; padding: 0.5rem 0.85rem; text-align: left; }
        .manual-markdown th { background: #F5EFD9; font-weight: 700; color: #0A1628; }
        .manual-markdown a { color: #C9962A; text-decoration: underline; text-underline-offset: 2px; transition: color 0.15s; }
        .manual-markdown a:hover { color: #E5B445; }
      `}</style>
    </div>
  );
}
