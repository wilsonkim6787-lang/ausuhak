"use client";

import { useActionState, useEffect } from "react";
import { track } from "@vercel/analytics";
import { Button } from "@/components/ui/Button";
import OAuthButtons from "@/components/auth/OAuthButtons";
import { signupAction, type SignupState } from "./actions";

const initial: SignupState = {};

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initial);

  useEffect(() => {
    if (state.notice && !state.error) {
      track("signup", { method: "email", pending_email_confirm: true });
    }
  }, [state.notice, state.error]);

  return (
    <div className="flex flex-col gap-5">
      <OAuthButtons label="가입" />
      <div className="flex items-center gap-2 text-[11px] text-ink-500">
        <div className="h-px flex-1 bg-cream-300" />
        <span>또는 이메일</span>
        <div className="h-px flex-1 bg-cream-300" />
      </div>
      <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-navy-700">이름</span>
        <input
          type="text"
          name="name"
          required
          minLength={2}
          autoComplete="name"
          className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-navy-900 outline-none focus:border-gold-500"
          placeholder="홍길동"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-navy-700">이메일</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-navy-900 outline-none focus:border-gold-500"
          placeholder="student@example.com"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-navy-700">비밀번호 (8자 이상)</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-navy-900 outline-none focus:border-gold-500"
          placeholder="••••••••"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-navy-700">
          전화번호 <span className="font-normal text-ink-500">(선택 · 카톡 안내용)</span>
        </span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-navy-900 outline-none focus:border-gold-500"
          placeholder="010-1234-5678"
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
          {state.error}
        </p>
      )}

      {state.notice && (
        <p className="rounded-lg bg-gold-100 px-3 py-2 text-xs text-navy-900">
          {state.notice}
        </p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="mt-2">
        {pending ? "가입 중…" : "가입하기"}
      </Button>
      </form>
    </div>
  );
}
