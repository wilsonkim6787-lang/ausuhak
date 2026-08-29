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


// ── 메인 공지 버튼 ─────────────────────────────────────────
// 글 하나를 메인 페이지 공지 팝업으로 올린다 (한 번에 하나).
// 스키마 변경 없이 site_settings notice_* 키를 글 내용으로 자동 채움:
//   notice_blog_id / notice_slug 로 현재 공지 글 추적, version +1 로 재노출.

function stripMarkdown(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")      // 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")   // 링크 → 텍스트
    .replace(/^#{1,6}\s+/gm, "")               // 헤딩
    .replace(/[*_`>~]/g, "")                   // 강조·코드·인용
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export async function setMainNoticeAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/admin/blog?nerr=권한 없음");
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/blog?nerr=id 누락");

  const supabase = await createClient();
  const { data: post, error: postErr } = await supabase
    .from("blogs")
    .select("id, slug, title, excerpt, body, status")
    .eq("id", id)
    .single();
  if (postErr || !post) redirect("/admin/blog?nerr=글을 찾을 수 없음");
  if (post.status !== "published") {
    redirect("/admin/blog?nerr=" + encodeURIComponent("발행(published) 상태의 글만 메인 공지로 올릴 수 있습니다"));
  }

  const { data: verRow } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "notice_version")
    .maybeSingle();
  const version = (parseInt(verRow?.value ?? "1", 10) || 1) + 1;

  const summary = stripMarkdown(post.excerpt || post.body || "").slice(0, 220);
  // is_public: true 필수 — 메인 페이지가 anon 클라이언트로 읽어서
  // RLS(is_public=true) 조건에 걸리면 팝업이 아예 안 뜸.
  const rows = [
    { key: "notice_active",  value: "true",           category: "notice", is_public: true },
    { key: "notice_title",   value: post.title,       category: "notice", is_public: true },
    { key: "notice_body",    value: summary || null,  category: "notice", is_public: true },
    { key: "notice_version", value: String(version),  category: "notice", is_public: true },
    { key: "notice_slug",    value: post.slug,        category: "notice", is_public: true },
    { key: "notice_blog_id", value: post.id,          category: "notice", is_public: true },
  ];
  const { error } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) redirect("/admin/blog?nerr=" + encodeURIComponent(`저장 실패: ${error.message}`));

  revalidatePath("/admin/blog");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout"); // 메인 팝업 즉시 갱신
  redirect("/admin/blog?nok=" + encodeURIComponent("메인 공지로 올렸습니다"));
}

export async function clearMainNoticeAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") redirect("/admin/blog?nerr=권한 없음");

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert(
      [
        { key: "notice_active",  value: "false", category: "notice", is_public: true },
        { key: "notice_blog_id", value: null,    category: "notice", is_public: true },
      ],
      { onConflict: "key" },
    );
  if (error) redirect("/admin/blog?nerr=" + encodeURIComponent(`해제 실패: ${error.message}`));

  revalidatePath("/admin/blog");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  redirect("/admin/blog?nok=" + encodeURIComponent("메인 공지를 내렸습니다"));
}
