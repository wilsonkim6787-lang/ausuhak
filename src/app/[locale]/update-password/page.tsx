// 새 비밀번호 설정 — 재설정 메일 링크(/auth/callback?next=/update-password)로 진입.
// 복구 세션이 없으면(링크 만료/직접 접근) 재요청 안내.

import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Footer from "@/components/layout/Footer";
import UpdateForm from "./UpdateForm";

export default async function UpdatePasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
            <h1 className="font-display text-2xl font-bold text-navy-900">새 비밀번호 설정</h1>

            {user ? (
              <>
                <p className="mt-2 text-sm text-ink-500">
                  {user.email} 계정의 새 비밀번호를 입력해주세요.
                </p>
                <div className="mt-6">
                  <UpdateForm />
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-ink-500">
                  링크가 만료되었거나 잘못된 접근입니다. 비밀번호 찾기를 다시 요청해주세요.
                </p>
                <Link
                  href="/reset-password"
                  className="mt-6 inline-block rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-gold-400"
                >
                  비밀번호 찾기로 이동
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
