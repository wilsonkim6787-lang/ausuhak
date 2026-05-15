"use client";

// 브라우저 인쇄 다이얼로그 트리거. Server Component에서 사용할 수 있도록 분리.
export default function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ??
        "rounded-full bg-navy-900 px-4 py-1.5 text-xs font-semibold text-gold-400 transition hover:bg-navy-800"
      }
    >
      🖨️ 인쇄 / PDF로 저장
    </button>
  );
}
