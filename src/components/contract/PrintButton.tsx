"use client";
export default function PrintButton({ label = "인쇄하거나 PDF로 저장" }: { label?: string }) {
  return (
    <button type="button" className="ct-link" onClick={() => window.print()}>
      {label}
    </button>
  );
}
