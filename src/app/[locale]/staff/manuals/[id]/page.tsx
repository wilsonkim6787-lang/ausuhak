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

// marked 옵션: GFM 기본 + breaks (개행 = <br>)
marked.setOptions({
  gfm: true,
  breaks: false,
});

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

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/staff/manuals"
        className="text-xs font-semibold text-navy-700 hover:text-gold-600"
      >
        ← 매뉴얼 목록
      </Link>

      <header className="flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-sm font-bold text-gold-600">
          #{m.number}
        </span>
        <h1 className="font-display text-2xl font-bold text-navy-900">{m.title}</h1>
        {m.category && (
          <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] text-ink-700">
            {m.category}
          </span>
        )}
      </header>

      <article
        className="manual-markdown rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <style>{`
        .manual-markdown { color: #1A1A1A; line-height: 1.75; }
        .manual-markdown h1 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: #0A1628; margin: 1.5rem 0 0.75rem; }
        .manual-markdown h2 { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: #0A1628; margin: 1.5rem 0 0.5rem; padding-top: 0.5rem; border-top: 1px solid #E8E0D0; }
        .manual-markdown h2:first-of-type { border-top: 0; padding-top: 0; }
        .manual-markdown h3 { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: #0A1628; margin: 1rem 0 0.5rem; }
        .manual-markdown h4 { font-weight: 600; color: #2C4F8A; margin: 0.75rem 0 0.25rem; }
        .manual-markdown p { margin: 0.5rem 0; }
        .manual-markdown ul, .manual-markdown ol { margin: 0.5rem 0 0.5rem 1.25rem; }
        .manual-markdown li { margin: 0.25rem 0; }
        .manual-markdown ul { list-style: disc; }
        .manual-markdown ol { list-style: decimal; }
        .manual-markdown strong { color: #0A1628; font-weight: 700; }
        .manual-markdown em { color: #4A4A4A; }
        .manual-markdown code { background: #FBF7EE; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.85em; font-family: var(--font-mono); }
        .manual-markdown pre { background: #FBF7EE; padding: 0.75rem 1rem; border-radius: 8px; overflow-x: auto; margin: 0.75rem 0; }
        .manual-markdown pre code { background: transparent; padding: 0; }
        .manual-markdown blockquote { border-left: 3px solid #C9962A; padding: 0.25rem 0.75rem; margin: 0.75rem 0; color: #4A4A4A; background: #FBF7EE; }
        .manual-markdown hr { border: 0; border-top: 1px solid #E8E0D0; margin: 1.5rem 0; }
        .manual-markdown table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 0.9em; }
        .manual-markdown th, .manual-markdown td { border: 1px solid #E8E0D0; padding: 0.4rem 0.75rem; text-align: left; }
        .manual-markdown th { background: #F5EFD9; font-weight: 600; }
        .manual-markdown a { color: #C9962A; text-decoration: underline; }
        .manual-markdown a:hover { color: #E5B445; }
      `}</style>
    </div>
  );
}
