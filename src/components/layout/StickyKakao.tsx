"use client";

// PART O O-5-6: 모바일 sticky 카톡 버튼 (우측 하단 56×56 / 데스크톱 확장 형태)
// PART 0-12: 카카오 노란색 #FEE500
export default function StickyKakao() {
  const kakaoUrl = "https://pf.kakao.com/_GadTX";

  return (
    <a
      href={kakaoUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Wilson 카톡 채널로 1:1 상담"
      data-kakao-source="sticky"
      className="fixed bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-[#FEE500] px-4 py-3 text-sm font-bold text-[#3C1E1E] shadow-lg transition hover:scale-105 hover:shadow-xl sm:bottom-6 sm:right-6 sm:px-5 sm:py-3.5 sm:text-base"
    >
      <span className="text-xl leading-none">💬</span>
      <span className="hidden sm:inline">카톡 상담 →</span>
    </a>
  );
}
