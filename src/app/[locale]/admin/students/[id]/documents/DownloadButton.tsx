"use client";

// signed URL 발급 후 새 탭으로 열기. 5분 유효 URL.

import { useState, useTransition } from "react";
import { getDocumentDownloadUrl } from "../actions";

export default function DownloadButton({ documentId }: { documentId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    setError(null);
    // 팝업 차단 회피: 사용자 클릭(제스처) 동안 빈 탭을 먼저 열고, URL 은 발급 후 주입.
    // (await 뒤에 window.open 을 부르면 Safari 등에서 차단됨.)
    const win = window.open("about:blank", "_blank");
    startTransition(async () => {
      const result = await getDocumentDownloadUrl(documentId);
      if (result.url) {
        if (win && !win.closed) {
          try {
            win.opener = null;
          } catch {
            /* noop */
          }
          win.location.href = result.url;
        } else {
          // 팝업이 막힌 경우 현재 탭에서 이동
          window.location.href = result.url;
        }
      } else {
        if (win && !win.closed) win.close();
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
