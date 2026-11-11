// Site-wide facts used by metadata, JSON-LD and shared UI.
export const SITE = {
  url: "https://www.ausuhak.com",
  name: "AusUhak(호주유학)",
  shortName: "호주유학",
  description:
    "호주 대학 교직원 출신 Wilson이 20년 동안 직접 상담했습니다. 검정고시, 간호, 약대, 의대, 경영 진학 루트와 학생비자 문의까지, 상황을 보내 주시면 가능한 길을 먼저 알려 드립니다.",
  phone: "010-9848-7789",
  phoneIntl: "+82-10-9848-7789",
  email: "ausuhak@gmail.com",
  kakao: "https://pf.kakao.com/_GadTX",
  hours: "평일 10:00 ~ 19:00",
  owner: "김구복",
  bizNo: "884-25-02296",
  // 통신판매업 신고번호: shown in the footer once filled in.
  mailOrderNo: "",
  bizAddress: "서울 강남구 테헤란로6길 26, 3층 318호",
  officeAddress: {
    street: "역삼로 521 대종빌딩 3층",
    locality: "강남구",
    region: "서울특별시",
    country: "KR",
    full: "서울 강남구 역삼로 521 대종빌딩 3층",
    lat: 37.5038,
    lng: 127.06025,
  },
  // Add when the accounts exist; empty values are skipped everywhere.
  social: {
    instagram: "",
    naverBlog: "https://blog.naver.com/ausuhak",
    youtube: "",
  } as Record<string, string>,
} as const;

export function socialLinks(): string[] {
  return [SITE.kakao, ...Object.values(SITE.social).filter(Boolean)];
}
