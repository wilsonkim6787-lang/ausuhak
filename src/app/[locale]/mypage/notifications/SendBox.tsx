"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendStudentMessageAction, type SendMessageState } from "./actions";

const initial: SendMessageState = {};

export default function SendBox() {
  const [state, formAction, pending] = useActionState(sendStudentMessageAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  // 전송 성공 시 입력창 비우기
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <textarea
          name="body"
          rows={2}
          required
          maxLength={2000}
          placeholder="궁금한 점을 남겨주세요. 확인 후 답변드립니다."
          className="min-h-[52px] flex-1 resize-y rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-[52px] shrink-0 rounded-xl bg-navy-900 px-5 text-sm font-bold text-gold-400 transition hover:bg-navy-800 disabled:opacity-60"
        >
          {pending ? "전송 중…" : "보내기"}
        </button>
      </div>
      {state.error && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">⚠️ {state.error}</p>
      )}
    </form>
  );
}
