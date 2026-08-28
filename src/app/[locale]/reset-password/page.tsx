// 비밀번호 찾기 — 이메일로 재설정 링크 발송.
// 링크 클릭 → /auth/callback?next=/update-password → 새 비밀번호 설정.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Footer from "@/components/layout/Footer";
import ResetForm from "./ResetForm";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <main className="flex flex-1 items-center justify-center bg-cream-100 px-4 py-16">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-baseline gap-2.5 justify-center">
            <span className="font-display text-2xl font-bold tracking-tight text-navy-900">
              ausuhak
              <span className="italic text-gold-600">.com</span>
            </span>
            <span className="text-xs font-medium text-ink-500">(호주유학)</span>
          </Link>

          <div className="rounded-2xl border border-cream-300 bg-white p-8 shadow-md">
            <h1 className="font-display text-2xl font-bold text-navy-900">비밀번호 찾기</h1>
            <p className="mt-2 text-sm text-ink-500">
              가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>

            <div className="mt-6">
              <ResetForm />
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-ink-500">
            비밀번호가 기억나셨나요?{" "}
            <Link href="/login" className="text-navy-700 underline">
              로그인으로 돌아가기
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
