"use client";

import { useEffect, useState } from "react";

// Hero 배경 영상 레이어 (데스크탑 전용).
// - 기존 next/image 히어로 이미지가 LCP·poster 역할을 그대로 담당하고,
//   영상은 로드 완료 후 그 위로 페이드인만 한다.
// - 모바일(<640px)·prefers-reduced-motion 에서는 마운트하지 않음 → 데이터·배터리 절약.
// - 파일이 없거나(404)·재생 실패 시 조용히 제거 → 이미지 배경으로 자동 폴백.
//   (Flow 영상 도착 전에도 배포 안전)
export default function HeroVideo({ src }: { src: string }) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 640px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(desktop.matches && !reducedMotion.matches);
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
