"use client";

// /admin/offers 후기(story) 작성용 — textarea + 실시간 markdown 미리보기.
// 깜깜이 작성·저장→publish→상세페이지 열기 왕복 제거 (P4 콘텐츠 파이프라인).
// 미리보기 렌더는 공개 상세페이지(src/app/[locale]/offers/[id]/page.tsx)와 픽셀 일치를 위해
// 같은 marked 옵션 + .offer-story CSS 를 미러. 상세페이지 스타일 변경 시 아래 STORY_CSS 도 함께 갱신.

import { useState } from "react";
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

const PLACEHOLDER =
  "## 학생 배경\n- 검정고시 / 19세 / IELTS 6.5\n\n## 지원 과정\n1. Wilson 1:1 상담 (2024.04)\n2. Foundation 6개월 ...\n\n## Wilson 노하우\n- ...";

// 공개 상세페이지의 .offer-story 블록과 동일 (드리프트 주의 — 한쪽 바꾸면 양쪽 갱신).
const STORY_CSS = `
.offer-story { color: #1A1A1A; line-height: 1.75; }
.offer-story h1, .offer-story h2 { font-family: var(--font-display); font-weight: 700; color: #0A1628; }
.offer-story h1 { font-size: 1.5rem; margin: 1.25rem 0 0.5rem; }
.offer-story h2 { font-size: 1.25rem; margin: 1.25rem 0 0.5rem; padding-top: 0.5rem; border-top: 1px solid #E8E0D0; }
.offer-story h2:first-of-type { border-top: 0; padding-top: 0; }
.offer-story h3 { font-size: 1.05rem; font-weight: 700; color: #0A1628; margin: 0.9rem 0 0.4rem; }
.offer-story p { margin: 0.5rem 0; }
.offer-story ul, .offer-story ol { margin: 0.5rem 0 0.5rem 1.25rem; }
.offer-story li { margin: 0.25rem 0; }
.offer-story ul { list-style: disc; }
.offer-story ol { list-style: decimal; }
.offer-story strong { color: #0A1628; font-weight: 700; }
.offer-story em { color: #4A4A4A; }
.offer-story code { background: #FBF7EE; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.85em; font-family: var(--font-mono); }
.offer-story blockquote { border-left: 3px solid #C9962A; padding: 0.25rem 0.75rem; margin: 0.75rem 0; color: #4A4A4A; background: #FBF7EE; }
.offer-story hr { border: 0; border-top: 1px solid #E8E0D0; margin: 1.5rem 0; }
.offer-story table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 0.9em; }
.offer-story th, .offer-story td { border: 1px solid #E8E0D0; padding: 0.4rem 0.75rem; text-align: left; }
.offer-story th { background: #F5EFD9; font-weight: 600; }
.offer-story a { color: #C9962A; text-decoration: underline; }
`;

export default function OfferStoryField({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const trimmed = value.trim();
  // 기본 옵션(async 미사용)에서 marked.parse 는 동기 string 반환.
  const html = trimmed ? (marked.parse(trimmed) as string) : "";

  return (
    <div className="flex flex-col gap-2">
      <textarea
        name="story"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={10}
        placeholder={PLACEHOLDER}
        className="rounded-md border border-cream-300 px-2 py-1 text-sm font-mono"
      />

      <div className="rounded-md border border-cream-300 bg-cream-100/40 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-500">
          👁️ 미리보기 · 상세페이지와 동일
        </p>
        {html ? (
          <article
            className="offer-story"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="text-xs text-ink-400">— markdown 입력 시 여기에 실시간 렌더됩니다</p>
        )}
      </div>

      <style>{STORY_CSS}</style>
    </div>
  );
}
