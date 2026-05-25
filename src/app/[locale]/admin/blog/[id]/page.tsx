import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import BlogForm, { type BlogRecord } from "../BlogForm";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blogs")
    .select("id, slug, title, body, excerpt, category, status, view_count, published_at, created_at, updated_at")
    .eq("id", id)
    .single();
  if (error || !data) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/blog" className="text-xs font-semibold text-navy-700 hover:text-gold-600">
        ← 블로그 목록으로
      </Link>
      <header>
        <h1 className="font-display text-3xl font-bold text-navy-900">
          ✍️ 글 편집
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          /{data.slug} · 조회 {data.view_count}
        </p>
      </header>
      <BlogForm mode="edit" blog={data as BlogRecord} />
    </div>
  );
}
