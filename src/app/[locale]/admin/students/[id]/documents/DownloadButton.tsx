"use client";

// signed URL 발급 후 새 탭으로 열기. 5분 유효 URL.

import { useState, useTransition } from "react";
import { getDocumentDownloadUrl } from "../actions";

export default function DownloadButton({ documentId }: { documentId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setError(null);
    startTransition(async () => {
      const result = await getDocumentDownloadUrl(documentId);
      if (result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        setError(result.error ?? "URL 발급 실패");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs font-semibold text-navy-900 transition hover:bg-cream-100 disabled:opacity-50"
      >
        {pending ? "..." : "📥 다운로드"}
      </button>
      {error && <span className="ml-2 text-[11px] text-error">{error}</span>}
    </>
  );
}
