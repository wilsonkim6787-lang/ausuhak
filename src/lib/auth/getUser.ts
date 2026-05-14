import { createClient } from "@/lib/supabase/server";

export type UserRole = "super_admin" | "staff" | "student";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

// 서버 컴포넌트 / Server Action에서 현재 로그인 사용자 + role 조회
// - auth.users 세션 확인
// - public.users에서 role 조회
// 로그인 안 했거나 public.users row 없으면 null
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, name, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return profile as AppUser;
}
