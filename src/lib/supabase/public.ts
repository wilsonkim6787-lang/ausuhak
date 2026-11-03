import { createClient } from "@supabase/supabase-js";

// Anonymous client for published public content (offers, news). No cookies, so
// pages stay statically cacheable. Returns null when env is not configured
// (e.g. a local build), and callers render an empty state.
export function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function storageUrl(bucket: string, path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
