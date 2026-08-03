"use client";

import { useEffect, useState } from "react";

// Hero 배경 영상 레이어.
// - 데스크탑(≥640px)은 항상, 모바일은 한국 IP(proxy가 심는 ip-country 쿠키)만 재생
//   → 국내 모바일은 데이터 부담이 낮아 풀 경험, 해외(호주 현지 등) 모바일은 절약.
// - 기존 next/image 히어로 포스터(영상 첫 프레임)가 LCP 역할을 그대로 담당하고,
//   영상은 로드 완료 후 동일 프레임 위로 페이드인 → 전환이 보이지 않음.
// - prefers-reduced-motion·데이터 절약 모드에서는 어디서든 마운트하지 않음.
// - 파일이 없거나(404)·재생 실패 시 조용히 제거 → 포스터 이미지로 자동 폴백.
export default function HeroVideo({ src }: { src: string }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 640px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const koreanIp = /(?:^|;\s*)ip-country=KR(?:;|$)/.test(document.cookie);
    const saveData =
      (navigator as { connection?: { saveData?: boolean } }).connection
        ?.saveData === true;
    const update = () =>
      setEnabled(
        (desktop.matches || koreanIp) && !reducedMotion.matches && !saveData,
      );
    update();
    desktop.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  if (!enabled || failed) return null;

  return (
    <video
      src={src}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      }`}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      onCanPlay={() => setReady(true)}
      onError={() => setFailed(true)}
    />
  );
}
