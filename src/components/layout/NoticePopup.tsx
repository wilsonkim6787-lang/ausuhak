"use client";

import { useEffect, useState } from "react";

// 메인 페이지 공지 팝업.
// site_settings 의 notice_active=true 일 때 마운트.
// localStorage 의 ausuhak_notice_dismissed_v{version} 키로 dismiss 추적.
// version 바뀌면 같은 사용자도 다시 보임.

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default function NoticePopup({
  title,
  body,
  version,
}: {
  title: string;
  body: string;
  version: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const key = `ausuhak_notice_dismissed_v${version}`;
    try {
      if (!localStorage.getItem(key)) {
        // 페이지 마운트 직후 짧은 지연 (메인 콘텐츠 먼저 보이게)
        const t = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage 불가 환경 — 그냥 표시
      setOpen(true);
    }
  }, [version]);

  function dismiss() {
    try {
      localStorage.setItem(`ausuhak_notice_dismissed_v${version}`, "1");
    } catch {
      /* noop */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <h2 id="notice-title" className="font-display text-xl font-bold text-navy-900">
            📣 {title || "공지"}
          </h2>
          <button
            type="button"
            onClick={dismiss}
            className="-mt-1 -mr-1 rounded-full p-1 text-ink-500 hover:bg-cream-100 hover:text-navy-900"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
          {body}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="notice_popup"
            className="flex-1 rounded-full bg-gold-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-gold-500"
          >
            💬 카카오 상담하기
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="flex-1 rounded-full border border-cream-300 bg-white px-4 py-3 text-sm font-semibold text-navy-700 hover:bg-cream-100"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
