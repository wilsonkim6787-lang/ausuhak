"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { requestPasswordResetAction, type ResetState } from "./actions";

const initial: ResetState = {};

export default function ResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initial);

  if (state.sent) {
    return (
      <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
        ✅ 가입된 이메일이라면 재설정 링크가 발송됩니다. 메일함(스팸함 포함)을
        확인하고 링크를 클릭해 새 비밀번호를 설정해주세요.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-navy-700">가입한 이메일</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-navy-900 outline-none focus:border-gold-500"
          placeholder="you@example.com"
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="mt-2">
        {pending ? "발송 중…" : "재설정 링크 받기"}
      </Button>
    </form>
  );
}
