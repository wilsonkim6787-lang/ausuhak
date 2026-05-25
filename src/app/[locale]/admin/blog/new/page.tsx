import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import BlogForm from "../BlogForm";

export default async function NewBlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/blog" className="text-xs font-semibold text-navy-700 hover:text-gold-600">
        ← 블로그 목록으로
      </Link>
      <header>
        <h1 className="font-display text-3xl font-bold text-navy-900">
          ✍️ 새 글 작성
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          markdown 으로 작성 후 draft 저장 → 검토 후 published 전환.
        </p>
      </header>
      <BlogForm mode="new" />
    </div>
  );
}
