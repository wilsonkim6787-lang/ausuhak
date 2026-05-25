"use client";

import { useState, useMemo } from "react";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

export default function MarkdownPreviewToggle({
  name,
  defaultValue,
  rows = 20,
  placeholder,
  required,
}: {
  name: string;
  defaultValue: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}) {
  const [body, setBody] = useState(defaultValue);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const html = useMemo(() => {
    return mode === "preview" ? (marked.parse(body) as string) : "";
  }, [body, mode]);

  const wordCount = body.trim().length;
  const lineCount = body.split("\n").length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              mode === "edit"
                ? "bg-navy-900 text-white"
                : "border border-cream-300 bg-white text-navy-700 hover:bg-cream-100"
            }`}
          >
            ✏️ 편집
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              mode === "preview"
                ? "bg-navy-900 text-white"
                : "border border-cream-300 bg-white text-navy-700 hover:bg-cream-100"
            }`}
          >
            👁️ 미리보기
          </button>
        </div>
        <span className="text-[10px] text-ink-500">
          {lineCount}줄 · {wordCount}자
        </span>
      </div>

      {/* textarea = 항상 마운트 (form 제출 보장), preview 모드일 땐 hidden */}
      <textarea
        name={name}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className={`rounded-lg border border-cream-300 bg-cream-100/60 px-4 py-3 font-mono text-[13px] leading-[1.7] outline-none transition focus:border-gold-500 focus:bg-white ${
          mode === "edit" ? "" : "hidden"
        }`}
      />

      {mode === "preview" && (
        <>
          <div
            className="manual-markdown min-h-[400px] rounded-lg border border-cream-300 bg-white px-6 py-5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <style>{`
            .manual-markdown { color: #1A1A1A; line-height: 1.85; font-size: 15px; }
            @media (min-width: 640px) { .manual-markdown { font-size: 16px; } }
            .manual-markdown h1 { font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; color: #0A1628; margin: 1.5rem 0 0.75rem; line-height: 1.3; }
            .manual-markdown h1:first-child { margin-top: 0; }
            .manual-markdown h2 { font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: #0A1628; margin: 1.75rem 0 0.6rem; padding-top: 0.85rem; border-top: 1px solid #E8E0D0; line-height: 1.35; }
            .manual-markdown h2:first-child { border-top: 0; padding-top: 0; margin-top: 0; }
            .manual-markdown h3 { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: #0A1628; margin: 1.1rem 0 0.4rem; }
            .manual-markdown h4 { font-weight: 700; color: #C9962A; margin: 0.9rem 0 0.3rem; font-size: 0.92rem; text-transform: uppercase; letter-spacing: 0.05em; }
            .manual-markdown p { margin: 0.55rem 0; }
            .manual-markdown ul, .manual-markdown ol { margin: 0.55rem 0 0.7rem 1.5rem; }
            .manual-markdown li { margin: 0.3rem 0; padding-left: 0.25rem; }
            .manual-markdown ul { list-style: disc; }
            .manual-markdown ol { list-style: decimal; }
            .manual-markdown ul ul, .manual-markdown ol ol, .manual-markdown ul ol, .manual-markdown ol ul { margin: 0.2rem 0 0.2rem 1.25rem; }
            .manual-markdown strong { color: #0A1628; font-weight: 700; }
            .manual-markdown em { color: #4A4A4A; font-style: italic; }
            .manual-markdown code { background: #FBF7EE; padding: 0.15rem 0.45rem; border-radius: 5px; font-size: 0.88em; font-family: var(--font-mono); color: #C9962A; }
            .manual-markdown pre { background: #FBF7EE; padding: 0.9rem 1.1rem; border-radius: 10px; overflow-x: auto; margin: 0.85rem 0; border: 1px solid #E8E0D0; }
            .manual-markdown pre code { background: transparent; padding: 0; color: #1A1A1A; font-size: 0.85em; }
            .manual-markdown blockquote { border-left: 4px solid #C9962A; padding: 0.4rem 1rem; margin: 0.85rem 0; color: #4A4A4A; background: #FBF7EE; border-radius: 0 8px 8px 0; }
            .manual-markdown blockquote p { margin: 0.2rem 0; }
            .manual-markdown hr { border: 0; border-top: 1px solid #E8E0D0; margin: 1.5rem 0; }
            .manual-markdown table { border-collapse: collapse; width: 100%; margin: 0.85rem 0; font-size: 0.92em; }
            .manual-markdown th, .manual-markdown td { border: 1px solid #E8E0D0; padding: 0.4rem 0.75rem; text-align: left; }
            .manual-markdown th { background: #F5EFD9; font-weight: 700; color: #0A1628; }
            .manual-markdown a { color: #C9962A; text-decoration: underline; text-underline-offset: 2px; transition: color 0.15s; }
            .manual-markdown a:hover { color: #E5B445; }
          `}</style>
        </>
      )}
    </div>
  );
}
