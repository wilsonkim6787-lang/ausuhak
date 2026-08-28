import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

// 사이트 공개 연락처 (site_settings) 로드.
// - 어드민 "사이트 설정" 저장분을 푸터/연락처에 실제 반영하기 위한 다리.
// - anon(비로그인) 클라이언트로 읽음 → is_public=true 행만 (연락처 키는 전부 public).
// - seed 플레이스홀더([입력 필요]/[Enter])나 빈 값은 null 로 취급 → 호출부가 기존
//   하드코딩/i18n 기본값으로 폴백하게 함 (미입력 시 사이트가 나빠지지 않도록).
// - React cache(): 같은 요청 내 중복 조회 제거.

export type PublicContact = {
  phone: string | null;
  kakaoUrl: string | null;
  businessHours: string | null;
  holidays: string | null;
  address: string | null;
};

const CONTACT_KEYS = [
  "phone",
  "kakao_channel_url",
  "business_hours",
  "holidays",
  "address",
] as const;

const PLACEHOLDERS = new Set(["[입력 필요]", "[enter]", "[입력필요]"]);

function clean(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const s = raw.trim();
  if (s === "") return null;
  if (PLACEHOLDERS.has(s.toLowerCase())) return null;
  return s;
}

export const getPublicContact = cache(
  async (locale: string): Promise<PublicContact> => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value, value_en")
      .in("key", CONTACT_KEYS as unknown as string[]);

    const pick = (key: string): string | null => {
      const row = (data ?? []).find((r) => r.key === key) as
        | { value: string | null; value_en: string | null }
        | undefined;
      if (!row) return null;
      const localized = locale === "en" ? row.value_en ?? row.value : row.value;
      return clean(localized);
    };

    return {
      phone: pick("phone"),
      kakaoUrl: pick("kakao_channel_url"),
      businessHours: pick("business_hours"),
      holidays: pick("holidays"),
      address: pick("address"),
    };
  },
);
