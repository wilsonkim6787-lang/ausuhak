"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";

const KAKAO_HOST = "pf.kakao.com/_GadTX";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    function handler(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!href.includes(KAKAO_HOST)) return;
      const source = anchor.dataset.kakaoSource ?? "unlabeled";
      track("kakao_click", { source, page: pathname ?? "unknown" });
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [pathname]);

  return null;
}
