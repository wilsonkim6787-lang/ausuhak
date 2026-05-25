"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  createBlogAction,
  updateBlogAction,
  deleteBlogAction,
  type BlogState,
} from "./actions";
import { BLOG_CATEGORIES } from "./constants";

export type BlogRecord = {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string | null;
  category: string | null;
  status: string;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

const initial: BlogState = {};

export default function BlogForm({
  mode,
  blog,
}: {
  mode: "new" | "edit";
  blog?: BlogRecord;
}) {
  const action = mode === "new" ? createBlogAction : updateBlogAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const [status, setStatus] = useState(blog?.status ?? "draft");

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-5">
        {blog && <input type="hidden" name="id" value={blog.id} />}

        <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-navy-900">제목·요약</h2>
          <div className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">제목 *</span>
              <input
                type="text"
                name="title"
                required
                defaultValue={blog?.title ?? ""}
                placeholder="예: 호주 비자 신청 5단계"
                className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">
                Slug (URL / 비우면 제목 기반 자동 생성)
              </span>
              <input
                type="text"
                name="slug"
                defaultValue={blog?.slug ?? ""}
                placeholder="예: visa-500-guide"
                className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 font-mono text-sm outline-none focus:border-gold-500"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-navy-700">
                요약 (메인·list 카드용 / 1-2줄)
              </span>
              <textarea
                name="excerpt"
                rows={2}
                defaultValue={blog?.excerpt ?? ""}
                placeholder="비우면 본문 첫 줄 자동 사용 (v2)"
                className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-navy-700">카테고리</span>
                <select
                  name="category"
                  defaultValue={blog?.category ?? ""}
                  className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
                >
                  <option value="">— 선택 안 함 —</option>
                  {BLOG_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-navy-700">발행일 (선택)</span>
                <input
                  type="date"
                  name="published_at"
                  defaultValue={blog?.published_at ? blog.published_at.slice(0, 10) : ""}
                  className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm outline-none focus:border-gold-500"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-navy-900">
            본문 (markdown)
          </h2>
          <p className="mt-1 text-xs text-ink-500">
            ## 헤더 / **굵게** / [텍스트](url) / - 리스트 등 markdown 사용 가능. 렌더링은 공개 페이지 노출 시점에 적용.
          </p>
          <textarea
            name="body"
            rows={20}
            defaultValue={blog?.body ?? ""}
            placeholder={"## 시작\n호주 비자 신청은 3단계로...\n\n## 1단계 GS 작성\n..."}
            className="mt-4 w-full rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:border-gold-500"
          />
        </section>

        <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
          <h2 className="font-display text-base font-bold text-navy-900">발행 상태</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["draft", "published", "archived"] as const).map((s) => (
              <label
                key={s}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                  status === s
                    ? "border-gold-500 bg-gold-100 font-semibold text-navy-900"
                    : "border-cream-300 bg-white text-navy-700 hover:bg-cream-100"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="size-3.5 accent-gold-600"
                />
                {s === "draft" ? "📝 draft" : s === "published" ? "✅ published" : "📦 archived"}
              </label>
            ))}
          </div>
          {blog && (
            <p className="mt-3 text-[11px] text-ink-500">
              조회수 {blog.view_count} · 최근 수정 {new Date(blog.updated_at).toLocaleString("ko-KR")}
            </p>
          )}
        </section>

        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-2xl border border-cream-300 bg-white p-4 shadow-md">
          <div className="text-xs">
            {state.error && (
              <span className="rounded-lg bg-error/10 px-2.5 py-1 text-error">{state.error}</span>
            )}
            {state.ok && !pending && (
              <span className="rounded-lg bg-success/10 px-2.5 py-1 text-success">✓ 저장됨</span>
            )}
            {!state.error && !state.ok && (
              <span className="text-ink-500">공개 페이지 노출은 메인 개편 시점에.</span>
            )}
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "저장 중…" : mode === "new" ? "💾 새 글 저장" : "💾 저장"}
          </Button>
        </div>
      </form>

      {blog && (
        <form action={deleteBlogAction} className="flex justify-end border-t border-cream-200 pt-3">
          <input type="hidden" name="id" value={blog.id} />
          <button type="submit" className="text-[11px] text-error hover:underline">
            🗑️ 이 글 삭제
          </button>
        </form>
      )}
    </div>
  );
}
