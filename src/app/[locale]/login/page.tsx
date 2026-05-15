import Link from "next/link";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 이미 로그인된 super_admin은 /admin으로 / 그 외는 메인으로
  const user = await getCurrentUser();
  if (user?.role === "super_admin") redirect("/admin");
  if (user?.role === "student") redirect("/mypage");
  if (user) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream-100 px-4 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-baseline gap-2.5 justify-center">
          <span className="font-display text-2xl font-bold tracking-tight text-navy-900">
            ausuhak
            <span className="italic text-gold-600">.com</span>
          </span>
          <span className="text-xs font-medium text-ink-500">(호주유학)</span>
        </Link>

        <div className="rounded-2xl border border-cream-300 bg-white p-8 shadow-md">
          <h1 className="font-display text-2xl font-bold text-navy-900">
            로그인
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            학생·직원·관리자 통합 로그인.
          </p>

          <div className="mt-6">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          아직 회원이 아니신가요?{" "}
          <Link href="/signup" className="text-navy-700 underline">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
