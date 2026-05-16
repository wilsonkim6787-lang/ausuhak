// ISAT 200 + MMI 40 데이터 진입점.
// 무료 체험 = ISAT id 1~5 / MMI station id 1 (고정 / Wilson 결정 2026-05-16).
// id > 5 (ISAT) 또는 id !== 1 (MMI) = 결제 잠금 → KakaoGateModal.

import isatRaw from "./isat.json";
import mmiRaw from "./mmi.json";

export type IsatCategory = "critical_reasoning" | "quantitative_reasoning";

export type IsatQuestion = {
  id: number;
  category: IsatCategory;
  passage: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

export type MmiCategory =
  | "ethics"
  | "communication"
  | "teamwork"
  | "motivation"
  | "social";

export type MmiStation = {
  id: number;
  category: MmiCategory;
  title: string;
  scenario: string;
  time_seconds: number;
  criteria: string[];
  model_answer: string;
};

const isatData = isatRaw as { questions: IsatQuestion[] };
const mmiData = mmiRaw as { stations: MmiStation[] };

export const ISAT_QUESTIONS: IsatQuestion[] = isatData.questions;
export const MMI_STATIONS: MmiStation[] = mmiData.stations;

export const ISAT_FREE_MAX_ID = 5;
export const MMI_FREE_STATION_ID = 1;

export function getIsatFreeTrial(): IsatQuestion[] {
  return ISAT_QUESTIONS.filter((q) => q.id <= ISAT_FREE_MAX_ID);
}

export function getMmiFreeStation(): MmiStation {
  const station = MMI_STATIONS.find((s) => s.id === MMI_FREE_STATION_ID);
  if (!station) throw new Error(`MMI station id=${MMI_FREE_STATION_ID} 누락`);
  return station;
}

export const isIsatFree = (id: number) => id <= ISAT_FREE_MAX_ID;
export const isMmiFree = (id: number) => id === MMI_FREE_STATION_ID;

export const ISAT_CATEGORY_COUNTS = {
  critical_reasoning: ISAT_QUESTIONS.filter(
    (q) => q.category === "critical_reasoning"
  ).length,
  quantitative_reasoning: ISAT_QUESTIONS.filter(
    (q) => q.category === "quantitative_reasoning"
  ).length,
};

export const MMI_CATEGORY_COUNTS: Record<MmiCategory, number> = (() => {
  const counts: Record<MmiCategory, number> = {
    ethics: 0,
    communication: 0,
    teamwork: 0,
    motivation: 0,
    social: 0,
  };
  for (const s of MMI_STATIONS) counts[s.category] += 1;
  return counts;
})();

export const MMI_CATEGORY_META: Array<{
  key: MmiCategory;
  label: string;
  desc: string;
}> = [
  { key: "ethics", label: "Ethics", desc: "윤리 딜레마" },
  { key: "communication", label: "Communication", desc: "의사 소통" },
  { key: "teamwork", label: "Teamwork", desc: "팀워크" },
  { key: "motivation", label: "Motivation", desc: "의대 동기" },
  { key: "social", label: "Social", desc: "사회 이슈" },
];
