"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import OAuthButtons from "@/components/auth/OAuthButtons";
import { loginAction, type LoginState } from "./actions";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <div className="flex flex-col gap-5">
      <OAuthButtons label="로그인" />
      <div className="flex items-center gap-2 text-[11px] text-ink-500">
        <div className="h-px flex-1 bg-cream-300" />
        <span>또는 이메일</span>
        <div className="h-px flex-1 bg-cream-300" />
      </div>
      <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-navy-700">이메일</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-navy-900 outline-none focus:border-gold-500"
          placeholder="wilsonkim6787@gmail.com"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-navy-700">비밀번호</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-navy-900 outline-none focus:border-gold-500"
          placeholder="••••••••"
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="mt-2">
        {pending ? "로그인 중…" : "로그인"}
      </Button>
      </form>
    </div>
  );
}
