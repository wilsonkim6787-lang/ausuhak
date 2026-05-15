// PART B-1: 학생 라이프사이클 12단계 (일반·의대 공용)
// 의대도 같은 12단계 / Stage 7 내부 내용만 더 복잡 (ISAT·MMI)

export type Stage = {
  num: number;
  label: string;
  short: string;
};

export const STAGES: Stage[] = [
  { num: 1, label: "카톡 1차 상담 (30분 무료)", short: "1차 상담" },
  { num: 2, label: "결제 (자동 회원가입)", short: "결제" },
  { num: 3, label: "1:1 상담 + 견적서", short: "1:1 상담" },
  { num: 4, label: "학교 선정 + 다중 지원", short: "학교 선정" },
  { num: 5, label: "영어 준비", short: "영어" },
  { num: 6, label: "학생 서류 수집", short: "서류" },
  { num: 7, label: "학교 지원 (Application)", short: "지원" },
  { num: 8, label: "Offer Letter 수령", short: "Offer" },
  { num: 9, label: "학비 송금 + CoE 발급", short: "송금/CoE" },
  { num: 10, label: "학생비자 500 신청", short: "비자" },
  { num: 11, label: "출국 준비 + 출국", short: "출국" },
  { num: 12, label: "호주 도착 + 학업", short: "도착" },
];

export function getStage(num: number): Stage | null {
  return STAGES.find((s) => s.num === num) ?? null;
}
