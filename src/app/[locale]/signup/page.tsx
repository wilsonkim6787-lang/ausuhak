import Link from "next/link";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth/getUser";
import SignupForm from "./SignupForm";

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 이미 로그인된 사용자는 role별 홈으로
  const user = await getCurrentUser();
  if (user?.role === "super_admin") redirect("/admin");
  if (user) redirect("/"); // TODO Step 2.2: student → /mypage

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
            학생 회원가입
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            결제 시 자동 가입되지만, 진단·견적 이력을 미리 저장하고 싶으시면 먼저 가입하셔도 됩니다.
          </p>

          <div className="mt-6">
            <SignupForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          이미 가입하셨나요?{" "}
          <Link href="/login" className="text-navy-700 underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
