"use client";
import { useActionState } from "react";
import { sendMessageAction } from "@/app/mypage/actions";

export default function MessageForm() {
  const [s, act, pending] = useActionState(sendMessageAction, undefined);
  return (
    <form className="mp-msg-form" action={act}>
      <label>
        메시지 쓰기
        {/* key resets the textarea after each sent message */}
        <textarea key={s?.ok ?? 0} name="body" rows={3} maxLength={4000} required placeholder="궁금한 점을 남겨 주세요" />
      </label>
      {s?.error ? <p className="mp-msg-err" role="alert">{s.error}</p> : null}
      <button type="submit" className="mp-msg-send" disabled={pending}>
        {pending ? "보내는 중…" : "보내기"}
      </button>
    </form>
  );
}
