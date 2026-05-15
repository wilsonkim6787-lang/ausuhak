import { redirect } from "next/navigation";
import { getCurrentUser, type AppUser } from "./getUser";

// /staff/* 가드: 직원만 진입.
// 비로그인 → /login / 학생 → /mypage / Wilson → /admin
export async function requireStaff(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "super_admin") redirect("/admin");
  if (user.role === "student") redirect("/mypage");
  if (user.role !== "staff") redirect("/");
  return user;
}
