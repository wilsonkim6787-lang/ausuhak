import { cache } from "react";
import { publicClient, storageUrl } from "./supabase/public";

export type Offer = {
  id: string;
  school: string;
  program: string | null;
  year: number | null;
  student_alias: string | null;
  image_path: string | null;
  story: string | null;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  published_at: string | null;
  body?: string | null;
};

export const getOffers = cache(async (): Promise<Offer[]> => {
  const sb = publicClient();
  if (!sb) return [];
  const { data } = await sb
    .from("offers")
    .select("id, school, program, year, student_alias, image_path, story")
    .eq("status", "published")
    .order("display_order")
    .order("year", { ascending: false });
  return (data as Offer[]) ?? [];
});

export const getOffer = cache(async (id: string): Promise<Offer | null> => {
  const sb = publicClient();
  if (!sb || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await sb
    .from("offers")
    .select("id, school, program, year, student_alias, image_path, story")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  return (data as Offer) ?? null;
});

export function offerImage(o: Offer) {
  return o.image_path ? storageUrl("offers", o.image_path) : null;
}

export const getPosts = cache(async (): Promise<Post[]> => {
  const sb = publicClient();
  if (!sb) return [];
  const { data } = await sb
    .from("blogs")
    .select("id, slug, title, excerpt, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data as Post[]) ?? [];
});

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const sb = publicClient();
  if (!sb) return null;
  const { data } = await sb
    .from("blogs")
    .select("id, slug, title, body, excerpt, category, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as Post) ?? null;
});

export function fmtDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const k = new Date(d.getTime() + 9 * 3600 * 1000);
  return `${k.getUTCFullYear()}.${String(k.getUTCMonth() + 1).padStart(2, "0")}.${String(k.getUTCDate()).padStart(2, "0")}`;
}
