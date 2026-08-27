"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { updatePasswordAction, type UpdatePasswordState } from "./actions";

const initial: UpdatePasswordState = {};

export default function UpdateForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-navy-700">새 비밀번호 (8자 이상)</span>
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
        <span className="text-xs font-semibold text-navy-700">새 비밀번호 확인</span>
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-navy-900 outline-none focus:border-gold-500"
          placeholder="••••••••"
        />
      </label>

      {state.error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{state.error}</p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="mt-2">
        {pending ? "변경 중…" : "비밀번호 변경"}
      </Button>
    </form>
  );
}
