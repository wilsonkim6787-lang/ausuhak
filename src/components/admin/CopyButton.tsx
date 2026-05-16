"use client";

// 클립보드 복사 버튼 — care 페이지 카톡 ID·메시지 복사용.
// Step 2.5 카톡 알림톡 자동 발송 활성화 전 임시 도구.

import { useState } from "react";

type Props = {
  value: string;
  label: string;
  copiedLabel?: string;
  size?: "xs" | "sm";
};

export default function CopyButton({
  value,
  label,
  copiedLabel = "복사됨",
  size = "xs",
}: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 구형 브라우저 대비 fallback
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const sizeCls =
    size === "xs"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-xs";

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-md border border-cream-300 bg-white font-semibold transition hover:bg-cream-100 ${sizeCls} ${
        copied ? "border-success/40 bg-success/5 text-success" : "text-navy-700"
      }`}
    >
      {copied ? `✓ ${copiedLabel}` : label}
    </button>
  );
}
