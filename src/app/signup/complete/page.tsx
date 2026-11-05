import { redirect } from "next/navigation";
import AuthFrame from "@/components/auth/AuthFrame";
import { CompleteForm } from "@/components/auth/forms";
import { getSession } from "@/lib/auth";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "가입 마무리 - AusUhak(호주유학)", description: "가입 마무리", path: "/signup/complete", noindex: true });

export default async function Page() {
  const { user, profile } = await getSession();
  if (!user) redirect("/login");
  if (profile?.role === "admin") redirect("/admin");
  if (profile?.family_id) redirect("/mypage");
  return <AuthFrame><CompleteForm /></AuthFrame>;
}
