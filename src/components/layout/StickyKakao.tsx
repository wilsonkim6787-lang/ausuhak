"use client";

import Link from "next/link";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default function StickyKakao() {
  return (
    <>
      {/* 모바일 — 하단 가로 풀 너비 2버튼 (진단 + 카카오) */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-cream-300 bg-white/95 p-2 shadow-[0_-4px_20px_rgba(10,22,40,0.08)] backdrop-blur sm:hidden">
        <Link
          href="/diagnose"
          aria-label="30초 가능성 진단 시작"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold-600 px-3 py-3.5 text-sm font-bold text-white shadow-md"
        >
          <span aria-hidden>{"\u{1F3AF}"}</span>
          30초 진단
        </Link>
        <a
          href={KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-kakao-source="sticky-mobile"
          aria-label="Wilson 카톡 채널로 문의"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] px-3 py-3.5 text-sm font-bold text-[#3C1E1E] shadow-md"
        >
          <span aria-hidden>{"\u{1F4AC}"}</span>
          카톡 문의
        </a>
      </div>

      {/* PC — 우측 하단 단일 카톡 버튼 */}
      <a
        href={KAKAO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Wilson 카톡 채널로 1:1 상담"
        data-kakao-source="sticky-desktop"
        className="fixed bottom-6 right-6 z-30 hidden items-center gap-2 rounded-full bg-[#FEE500] px-5 py-3.5 text-base font-bold text-[#3C1E1E] shadow-lg transition hover:scale-105 hover:shadow-xl sm:flex"
      >
        <span className="text-xl leading-none" aria-hidden>{"\u{1F4AC}"}</span>
        카톡 문의 →
      </a>
    </>
  );
}
