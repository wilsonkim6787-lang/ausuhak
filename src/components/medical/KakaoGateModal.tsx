"use client";

// 풀세트 (ISAT id > 5 / MMI id !== 1) 접근 시 게이팅 모달.
// 카카오 채널 = pf.kakao.com/_GadTX (의대 패키지 결제 안내 종착지).

import { useEffect } from "react";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

type Props = {
  open: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  kakaoSource?: string;
};

export default function KakaoGateModal({
  open,
  onClose,
  title = "🔒 풀세트는 의대 패키지에서 이용 가능",
  description = "무료 체험 외 문제·스테이션은 결제 후 즉시 열립니다. ISAT 200문제 + MMI 40 스테이션 + Wilson 직접 피드백.",
  kakaoSource = "medical_gate",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kakao-gate-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
          의대 패키지 ₩300,000
        </p>
        <h3
          id="kakao-gate-title"
          className="mt-2 font-display text-xl font-bold text-navy-900 sm:text-2xl"
        >
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-700">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source={kakaoSource}
            className="rounded-full bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
          >
            💬 카카오로 결제 문의
          </a>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-cream-100"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
