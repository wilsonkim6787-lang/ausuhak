// ✍️ 블로그 — admin 글 list. 신규 작성·편집·삭제. 공개 페이지는 메인 개편 시 노출.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { buttonStyles } from "@/components/ui/Button";
import { setMainNoticeAction, clearMainNoticeAction } from "./actions";

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  status: string;
  view_count: number;
  published_at: string | null;
  updated_at: string;
};

type SP = { status?: string; category?: string; nok?: string; nerr?: string };

export default async function AdminBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SP>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  let q = supabase
    .from("blogs")
    .select("id, slug, title, excerpt, category, status, view_count, published_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(300);
  if (sp.status) q = q.eq("status", sp.status);
  if (sp.category) q = q.eq("category", sp.category);

  const { data, error } = await q;

  // 현재 메인 공지중인 글 (site_settings notice_blog_id / notice_active)
  const { data: noticeRows } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["notice_blog_id", "notice_active"]);
  const noticeMap = new Map((noticeRows ?? []).map((r) => [r.key as string, r.value as string | null]));
  const mainNoticeBlogId =
    noticeMap.get("notice_active") === "true" ? (noticeMap.get("notice_blog_id") ?? null) : null;
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold text-navy-900">✍️ 블로그</h1>
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          <p className="font-semibold">조회 실패</p>
          <p className="mt-2 font-mono text-xs">{error.message}</p>
          <p className="mt-3 text-xs text-ink-700">
            migration 033 (blogs 테이블) 미적용 가능성. Supabase SQL Editor 에서 apply.
          </p>
        </div>
      </div>
    );
  }
  const rows = (data ?? []) as BlogRow[];

  const draftCount = rows.filter((r) => r.status === "draft").length;
  const publishedCount = rows.filter((r) => r.status === "published").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            콘텐츠 · 블로그
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
            ✍️ 블로그
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            글 {rows.length}개 · 발행 {publishedCount} · draft {draftCount}. 공개 페이지는 메인 개편 시 활성화.
          </p>
        </div>
        <Link href="/admin/blog/new" className={`${buttonStyles()} self-start`}>
          + 새 글 작성
        </Link>
      </header>

      <nav className="flex flex-wrap gap-2 text-xs">
        <FilterChip status={undefined} current={sp.status} label="전체" />
        <FilterChip status="draft" current={sp.status} label="📝 draft" />
        <FilterChip status="published" current={sp.status} label="✅ published" />
        <FilterChip status="archived" current={sp.status} label="📦 archived" />
      </nav>

      {sp.nerr && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">⚠️ {sp.nerr}</p>
      )}
      {sp.nok && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">✅ {sp.nok}</p>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center">
          <p className="text-4xl">✍️</p>
          <p className="mt-3 font-display text-lg font-bold text-navy-900">
            글이 없습니다
          </p>
          <p className="mt-1 text-sm text-ink-500">
            위 [+ 새 글 작성] 클릭. markdown 으로 본문 작성 → draft 저장 → 검토 후 published 전환.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.id}>
              <div className="rounded-xl border border-cream-300 bg-white p-4 shadow-sm transition hover:shadow-md">
                <Link href={`/admin/blog/${r.id}`} className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-base font-bold text-navy-900">
                      {r.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {r.id === mainNoticeBlogId && (
                        <span className="rounded-full bg-gold-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          📢 메인 공지중
                        </span>
                      )}
                      {r.category && (
                        <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-medium text-navy-700">
                          {r.category}
                        </span>
                      )}
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                  <p className="font-mono text-[11px] text-ink-500">/{r.slug}</p>
                  {r.excerpt && (
                    <p className="mt-1 line-clamp-2 text-xs text-ink-700">{r.excerpt}</p>
                  )}
                  <p className="text-[10px] text-ink-500">
                    조회 {r.view_count} ·{" "}
                    {r.published_at
                      ? `발행 ${new Date(r.published_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}`
                      : `최근 수정 ${new Date(r.updated_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}`}
                  </p>
                </Link>

                {/* 메인 공지 버튼 — published 글만. 한 번에 하나 (새로 올리면 이전 것 교체) */}
                {(r.id === mainNoticeBlogId || r.status === "published") && (
                  <div className="mt-2 flex items-center justify-end gap-2 border-t border-cream-200 pt-2">
                    {r.id === mainNoticeBlogId ? (
                      <form action={clearMainNoticeAction}>
                        <button
                          type="submit"
                          className="text-[11px] text-ink-500 underline hover:text-navy-700"
                        >
                          공지 내리기
                        </button>
                      </form>
                    ) : (
                      <form action={setMainNoticeAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-gold-600 px-2.5 py-1 text-[11px] font-semibold text-gold-600 transition hover:bg-gold-600 hover:text-white"
                        >
                          📢 메인 공지로 올리기
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  status,
  current,
  label,
}: {
  status: string | undefined;
  current: string | undefined;
  label: string;
}) {
  const href = status ? `/admin/blog?status=${status}` : "/admin/blog";
  const active = (current ?? undefined) === status;
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 font-medium transition ${
        active
          ? "bg-navy-900 text-white"
          : "border border-cream-300 bg-white text-navy-700 hover:bg-cream-200"
      }`}
    >
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    draft: { bg: "bg-warning/20", fg: "text-warning", label: "📝 draft" },
    published: { bg: "bg-success/15", fg: "text-success", label: "✅ published" },
    archived: { bg: "bg-cream-300", fg: "text-ink-700", label: "📦 archived" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.bg} ${s.fg}`}>
      {s.label}
    </span>
  );
}
