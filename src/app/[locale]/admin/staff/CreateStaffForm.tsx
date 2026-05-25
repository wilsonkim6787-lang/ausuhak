"use client";

import { useActionState, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { createStaffAction, type CreateStaffState } from "./actions";

const initial: CreateStaffState = {};

export default function CreateStaffForm() {
  const [state, formAction, pending] = useActionState(createStaffAction, initial);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function copyUrl() {
    if (!state.recoveryUrl) return;
    navigator.clipboard.writeText(state.recoveryUrl).then(
      () => {
        setCopied(true);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
      },
      () => alert("복사 실패 — link 를 직접 선택해 복사하세요."),
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-gold-600 px-4 py-2 text-xs font-semibold text-white hover:bg-gold-500"
      >
        + 신규 직원 추가
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-gold-400/40 bg-gold-100/40 p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm font-bold text-navy-900">
          + 신규 직원 추가
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-500 hover:text-navy-900"
        >
          ✕ 닫기
        </button>
      </div>

      {/* 결과 — recovery URL */}
      {state.ok && state.recoveryUrl && (
        <div className="mt-4 rounded-xl border border-success/30 bg-success/5 p-4">
          <p className="text-xs font-bold text-success">
            ✓ {state.isNewAccount ? "신규 직원 계정 생성됨" : "기존 user role → staff 승격됨"}
          </p>
          <p className="mt-1 text-xs text-ink-700">
            <strong>{state.email}</strong> — 아래 link 를 직원에게 카톡으로 전달해주세요.
            클릭하면 비밀번호를 설정하고 로그인합니다. (link 유효 1시간)
          </p>
          <div className="mt-3 flex items-stretch gap-2">
            <input
              type="text"
              readOnly
              value={state.recoveryUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 rounded-lg border border-cream-300 bg-white px-3 py-2 font-mono text-[11px] text-navy-900"
            />
            <button
              type="button"
              onClick={copyUrl}
              className="shrink-0 rounded-lg bg-navy-900 px-4 text-xs font-semibold text-gold-400 hover:bg-navy-700"
            >
              {copied ? "✓ 복사됨" : "📋 복사"}
            </button>
          </div>
          <p className="mt-3 text-[11px] text-ink-500">
            link 발급 후 직원이 활성화하면 이 페이지 목록에 자동 등장합니다.
          </p>
        </div>
      )}

      {/* 에러 */}
      {state.error && (
        <p className="mt-3 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
          {state.error}
        </p>
      )}

      {/* 폼 */}
      <form action={formAction} className="mt-4 flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">이메일 *</span>
          <input
            type="email"
            name="email"
            required
            placeholder="직원 이메일"
            className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">이름 (선택)</span>
          <input
            type="text"
            name="name"
            placeholder="직원 이름"
            className="rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500"
          />
        </label>
        <p className="text-[11px] text-ink-500">
          이미 회원가입된 이메일이면 → role 만 staff 로 승격. 새 이메일이면 → 계정 자동 생성 + 비밀번호 설정 link 발급.
        </p>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "생성 중…" : "+ 직원 추가"}
          </Button>
        </div>
      </form>
    </div>
  );
}
