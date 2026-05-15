import { redirect } from "next/navigation";
import { getCurrentUser, type AppUser } from "./getUser";
import { logUnauthorized } from "@/lib/audit/log";

// /staff/* 가드: 직원만 진입.
// 비로그인 → /login / 학생 → /mypage / Wilson → /admin
export async function requireStaff(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) {
    await logUnauthorized("/staff", "staff", null, null);
    redirect("/login");
  }
  if (user.role === "super_admin") redirect("/admin");
  if (user.role === "student") {
    await logUnauthorized("/staff", "staff", "student", user.id);
    redirect("/mypage");
  }
  if (user.role !== "staff") {
    await logUnauthorized("/staff", "staff", user.role, user.id);
    redirect("/");
  }
  return user;
}
