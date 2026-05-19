"use client";

// 소셜 로그인 버튼 (카카오·구글) — /login + /signup 공용.
// Supabase Auth OAuth provider 활성화 후 작동.

import { track } from "@vercel/analytics";
import { signInWithOAuthAction } from "@/app/[locale]/login/actions";

export default function OAuthButtons({ label = "로그인" }: { label?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* 카카오 — 카카오 브랜드 색 (#FEE500 + #3C1E1E) */}
      <form action={signInWithOAuthAction}>
        <input type="hidden" name="provider" value="kakao" />
        <button
          type="submit"
          onClick={() => track("oauth_click", { provider: "kakao", label })}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-4 py-3 text-sm font-bold text-[#3C1E1E] transition hover:scale-[1.01]"
        >
          <span aria-hidden>{"\u{1F4AC}"}</span>
          카카오로 {label}
        </button>
      </form>

      {/* 구글 */}
      <form action={signInWithOAuthAction}>
        <input type="hidden" name="provider" value="google" />
        <button
          type="submit"
          onClick={() => track("oauth_click", { provider: "google", label })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-cream-300 bg-white px-4 py-3 text-sm font-semibold text-navy-900 transition hover:bg-cream-100"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.331C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          구글로 {label}
        </button>
      </form>
    </div>
  );
}
