"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import { BLOG_CATEGORIES } from "./constants";

export type BlogState = { ok?: boolean; error?: string; id?: string };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || "post";
}

function parsePayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugInput ? slugify(slugInput) : slugify(title);
  const body = String(formData.get("body") ?? "");
  const excerpt = String(formData.get("excerpt") ?? "").trim() || null;
  const category = String(formData.get("category") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "draft");
  const publishedAtRaw = String(formData.get("published_at") ?? "").trim();
  const publishedAt = publishedAtRaw ? publishedAtRaw : null;
  return {
    title, slug, body, excerpt, category, status, publishedAt,
  };
}

function validate(p: ReturnType<typeof parsePayload>): string | null {
  if (!p.title) return "제목 필수";
  if (!p.slug) return "slug 필수";
  if (!["draft", "published", "archived"].includes(p.status)) return "status 값 오류";
  if (p.category && !(BLOG_CATEGORIES as readonly string[]).includes(p.category)) return "category 값 오류";
  return null;
}

export async function createBlogAction(
  _prev: BlogState,
  formData: FormData,
): Promise<BlogState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한 없음" };
  const p = parsePayload(formData);
  const err = validate(p);
  if (err) return { error: err };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blogs")
    .insert({
      slug: p.slug,
      title: p.title,
      body: p.body,
      excerpt: p.excerpt,
      category: p.category,
      status: p.status,
      author_id: user.id,
      published_at:
        p.status === "published"
          ? p.publishedAt ?? new Date().toISOString()
          : p.publishedAt,
    })
    .select("id")
    .single();
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${data.id}`);
}

export async function updateBlogAction(
  _prev: BlogState,
  formData: FormData,
): Promise<BlogState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한 없음" };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "id 누락" };
  const p = parsePayload(formData);
  const err = validate(p);
  if (err) return { error: err };

  const supabase = await createClient();
  const { error } = await supabase
    .from("blogs")
    .update({
      slug: p.slug,
      title: p.title,
      body: p.body,
      excerpt: p.excerpt,
      category: p.category,
      status: p.status,
      published_at:
        p.status === "published"
          ? p.publishedAt ?? new Date().toISOString()
          : p.publishedAt,
    })
    .eq("id", id);
  if (error) return { error: `저장 실패: ${error.message}` };

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  return { ok: true };
}

export async function deleteBlogAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("blogs").delete().eq("id", id);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

