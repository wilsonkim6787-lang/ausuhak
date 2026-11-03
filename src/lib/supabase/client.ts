import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client (anon key + the signed-in user's session cookie, RLS applies).
// Returns null when env is not configured.
export function browserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
