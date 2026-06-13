"use client";

// 합격증 상세 진입 측정 — offers 퍼널의 "조회" 단계.
// 카드클릭(offer_card_click) → 상세조회(offer_view) → 카카오전환(kakao_click source=offer_detail_*)
// 으로 offer별 전환율을 추적. 마운트 시 1회 발화.

import { useEffect } from "react";
import { track } from "@vercel/analytics";

export default function OfferViewTracker({
  offerId,
  school,
  hasStory,
}: {
  offerId: string;
  school: string;
  hasStory: boolean;
}) {
  useEffect(() => {
    track("offer_view", { offer_id: offerId, school, has_story: hasStory });
  }, [offerId, school, hasStory]);

  return null;
}
