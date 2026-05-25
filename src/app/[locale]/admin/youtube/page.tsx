// 📺 유튜브 — 영상 메타 수동 등록. v2 (YouTube Data API 자동 sync) 는 Phase 3.

import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { upsertVideoAction, deleteVideoAction } from "./actions";
import { VIDEO_CATEGORIES } from "./constants";

type Video = {
  id: string;
  youtube_id: string | null;
  youtube_url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  display_order: number;
  status: string;
  published_at: string | null;
  created_at: string;
};

export default async function AdminYoutubePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edit?: string; new?: string; err?: string; ok?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, youtube_id, youtube_url, title, description, thumbnail_url, category, display_order, status, published_at, created_at")
    .order("display_order")
    .order("published_at", { ascending: false });
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold text-navy-900">📺 유튜브</h1>
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          <p className="font-semibold">조회 실패</p>
          <p className="mt-2 font-mono text-xs">{error.message}</p>
          <p className="mt-3 text-xs text-ink-700">
            migration 033 (videos 테이블) 미적용 가능성.
          </p>
        </div>
      </div>
    );
  }
  const videos = (data ?? []) as Video[];

  let editing: Video | null = null;
  if (sp.edit) {
    const found = videos.find((v) => v.id === sp.edit);
    if (!found) notFound();
    editing = found;
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          콘텐츠 · 유튜브
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          📺 유튜브 영상 관리
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          영상 {videos.length}개. v2 (YouTube Data API 자동 sync) = Phase 3.
        </p>
      </header>

      {sp.err && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">⚠️ {sp.err}</p>
      )}
      {sp.ok && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">✅ 저장됨</p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* 리스트 */}
        <section className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-navy-900">총 {videos.length}개</p>
            <Link
              href="/admin/youtube?new=1"
              className="rounded-full bg-gold-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-gold-500"
            >
              + 신규 영상
            </Link>
          </div>

          {videos.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">— 아직 영상 없음. 우상단 + 신규.</p>
          ) : (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {videos.map((v) => {
                const active = sp.edit === v.id;
                return (
                  <li key={v.id}>
                    <Link
                      href={`/admin/youtube?edit=${v.id}`}
                      className={`block overflow-hidden rounded-xl border bg-cream-100/50 transition hover:scale-[1.02] ${
                        active ? "border-gold-600 ring-2 ring-gold-600/40" : "border-cream-300"
                      }`}
                    >
                      <div className="relative aspect-video bg-cream-200">
                        {v.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.thumbnail_url} alt={v.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-ink-500">
                            (썸네일 없음)
                          </div>
                        )}
                        <span
                          className={`absolute right-1.5 top-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            v.status === "published"
                              ? "bg-success text-white"
                              : v.status === "draft"
                                ? "bg-warning text-white"
                                : "bg-cream-300 text-ink-700"
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="text-[11px] font-semibold text-navy-900 line-clamp-2">
                          {v.title}
                        </p>
                        {v.category && (
                          <p className="mt-0.5 text-[10px] text-ink-500">{v.category}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 편집 폼 */}
        <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
          {!editing && !sp.new ? (
            <p className="text-sm text-ink-500">← 카드 선택 또는 + 신규 영상</p>
          ) : (
            <VideoForm key={editing?.id ?? "new"} editing={editing} />
          )}
        </section>
      </div>
    </div>
  );
}

function VideoForm({ editing }: { editing: Video | null }) {
  const isNew = !editing;
  return (
    <div className="flex flex-col gap-3">
      <form action={upsertVideoAction} className="flex flex-col gap-3">
        {editing && <input type="hidden" name="id" value={editing.id} />}

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">YouTube URL *</span>
          <input
            type="url"
            name="youtube_url"
            required
            defaultValue={editing?.youtube_url ?? ""}
            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
            className="rounded-md border border-cream-300 px-2 py-1 text-xs font-mono"
          />
          {editing?.youtube_id && (
            <span className="text-[10px] text-ink-500">ID: {editing.youtube_id}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">제목 *</span>
          <input
            name="title"
            required
            defaultValue={editing?.title ?? ""}
            placeholder="영상 제목"
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">설명</span>
          <textarea
            name="description"
            defaultValue={editing?.description ?? ""}
            rows={3}
            placeholder="짧은 영상 설명 (학생용)"
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">
            썸네일 URL (선택 / 비우면 YouTube 자동)
          </span>
          <input
            type="url"
            name="thumbnail_url"
            defaultValue={editing?.thumbnail_url ?? ""}
            placeholder="자동 = https://i.ytimg.com/vi/{id}/hqdefault.jpg"
            className="rounded-md border border-cream-300 px-2 py-1 text-xs font-mono"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">카테고리</span>
            <select
              name="category"
              defaultValue={editing?.category ?? ""}
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            >
              <option value="">— 선택 안 함 —</option>
              {VIDEO_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">정렬 (작을수록 먼저)</span>
            <input
              name="display_order"
              type="number"
              defaultValue={editing?.display_order != null ? String(editing.display_order) : "0"}
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">상태</span>
          <select
            name="status"
            defaultValue={editing?.status ?? "published"}
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          >
            <option value="draft">📝 draft</option>
            <option value="published">✅ published</option>
            <option value="archived">📦 archived</option>
          </select>
        </label>

        <div className="flex justify-end">
          <Button type="submit" size="sm">
            {isNew ? "+ 추가" : "저장"}
          </Button>
        </div>
      </form>

      {!isNew && editing && (
        <form action={deleteVideoAction} className="flex justify-end border-t border-cream-200 pt-2">
          <input type="hidden" name="id" value={editing.id} />
          <button type="submit" className="text-[11px] text-error hover:underline">
            🗑️ 이 영상 삭제
          </button>
        </form>
      )}
    </div>
  );
}
