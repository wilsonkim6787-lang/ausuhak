// PART I-2: 5진학루트 데이터.
// Wilson 직접 응대 (직원 위임 X). 카드 = /medical 메인 비교 + /diagnose 의대 분기 공용.

export type MedicalRouteKey =
  | "direct"
  | "undergrad"
  | "graduate"
  | "converter"
  | "transfer";

export type MedicalRoute = {
  key: MedicalRouteKey;
  num: number;
  emoji: string;
  title: string;
  subtitle: string;
  target: string;
  duration: string;
  difficulty: number; // 1~5
  requirements: string[];
  flow: string[];
  schoolsHint: string;
};

export const MEDICAL_ROUTES: MedicalRoute[] = [
  {
    key: "direct",
    num: 1,
    emoji: "🎯",
    title: "Direct (Year 12 / IB / 수능)",
    subtitle: "고등학생부터 의대 본 과정 5~6년",
    target: "한국 고등학생 / 검정고시 / IB 학생",
    duration: "5~6년",
    difficulty: 5,
    requirements: [
      "ATAR 99+ / IB 42~44+ / 수능 우수",
      "IELTS 7.0 (각 영역 7.0)",
      "ISAT 또는 UCAT 응시 (학교별)",
      "MMI 인터뷰 통과",
    ],
    flow: [
      "Year 12 / IB 졸업",
      "Bachelor of Medicine 5~6년",
      "Internship 1년",
      "Resident 2~3년",
      "Specialist Training (선택)",
    ],
    schoolsHint: "Adelaide / Monash Direct / UNSW / UWA / WSU·Charles Sturt 조인트",
  },
  {
    key: "undergrad",
    num: 2,
    emoji: "📚",
    title: "Undergrad → Graduate Entry MD",
    subtitle: "호주 학사 후 MD 진학 (한국 학생 인기)",
    target: "학사 졸업 후 MD 지원",
    duration: "7~8년 (학사 3 + MD 4)",
    difficulty: 4,
    requirements: [
      "호주 학사 졸업 + GPA 5.5/7.0+",
      "GAMSAT (Graduate Australian Medical School Test)",
      "IELTS 7.0",
      "GEMSAS 지원 + MMI 인터뷰",
    ],
    flow: [
      "Bachelor of Biomedicine 등 3년",
      "GAMSAT + GPA 5.5+ 확보",
      "GEMSAS 지원",
      "MMI 인터뷰",
      "MD 4년 → Internship → Specialist",
    ],
    schoolsHint:
      "USyd · UMelb · Monash Grad · UQ · ANU · Deakin · Flinders · Griffith · Notre Dame · UoW",
  },
  {
    key: "graduate",
    num: 3,
    emoji: "🧪",
    title: "Graduate (학사 + MCAT)",
    subtitle: "주로 미국 의대 / 호주는 GAMSAT 권장",
    target: "한국 학사 졸업자 (해외 의대)",
    duration: "학사 + MCAT 1년 이상",
    difficulty: 5,
    requirements: [
      "한국 학사 졸업",
      "MCAT 510+ 권장",
      "IELTS 7.0 / GPA 3.5+",
    ],
    flow: [
      "한국 학사 + 우수 GPA",
      "MCAT 응시",
      "미국 의대 진학 (주로)",
    ],
    schoolsHint: "호주 진학은 루트 2 GAMSAT 권장 / MCAT 인정 학교 제한적",
  },
  {
    key: "converter",
    num: 4,
    emoji: "🩺",
    title: "Converter (한국 의사 → AMC)",
    subtitle: "한국 면허 보유자 → 호주 면허",
    target: "한국 의사 면허 보유자",
    duration: "1~3년 (AMC 시험 + Internship)",
    difficulty: 4,
    requirements: [
      "한국 의사 면허 (M.D. + 면허)",
      "한국 인턴 1년 + 레지던트 경력 (선호)",
      "IELTS 7.0 (각 7.0) 또는 OET",
      "AMC MCQ + Clinical Examination",
    ],
    flow: [
      "한국 의사 면허",
      "AMC MCQ (200문제 / 통과율 30~40%)",
      "AMC Clinical 또는 1년 Internship",
      "AHPRA Registration",
      "호주 의사 활동",
    ],
    schoolsHint: "시간·비용 큰 투자 / Wilson 1:1 자세한 상담 필수",
  },
  {
    key: "transfer",
    num: 5,
    emoji: "🔄",
    title: "Transfer (한국 의대생 → 호주 의대)",
    subtitle: "학점 인정 거의 X / 처음부터 다시",
    target: "한국 의대 재학생 (1~6학년)",
    duration: "4~6년 (처음부터)",
    difficulty: 4,
    requirements: [
      "한국 의대 재학 中",
      "호주 의대 재지원 (Direct 또는 GAMSAT)",
      "IELTS 7.0 / 우수 GPA",
    ],
    flow: [
      "한국 의대 재학 中",
      "호주 의대 재지원",
      "학점 인정 매우 제한적",
      "Wilson 케이스별 1:1 상담",
    ],
    schoolsHint: "케이스마다 다름 / Wilson 직접 상담 필수",
  },
];

// PART I-2: 호주 의대 21개 학교 (Wilson 큐레이션).
// 정확한 프로그램·기간·요건은 master_v2_clean.json 참고 / 페이지에선 카드 안내용.
export const MEDICAL_SCHOOLS: Array<{
  name: string;
  city: string;
  state: string;
  pathway: MedicalRouteKey[];
  note?: string;
}> = [
  { name: "University of Sydney (USyd)", city: "Sydney", state: "NSW", pathway: ["undergrad"] },
  { name: "UNSW Sydney", city: "Sydney", state: "NSW", pathway: ["direct"], note: "Year 12 Direct" },
  { name: "Western Sydney University / Charles Sturt (Joint)", city: "Sydney/Bathurst", state: "NSW", pathway: ["direct"] },
  { name: "University of Newcastle / UNE (Joint Medical Program)", city: "Newcastle/Armidale", state: "NSW", pathway: ["direct", "undergrad"] },
  { name: "University of Wollongong (UoW MD)", city: "Wollongong", state: "NSW", pathway: ["undergrad"] },
  { name: "University of Notre Dame Sydney", city: "Sydney", state: "NSW", pathway: ["undergrad"] },
  { name: "Australian National University (ANU MD)", city: "Canberra", state: "ACT", pathway: ["undergrad"] },
  { name: "Monash University (Direct + Graduate Entry MD)", city: "Melbourne", state: "VIC", pathway: ["direct", "undergrad"] },
  { name: "University of Melbourne (UMelb MD)", city: "Melbourne", state: "VIC", pathway: ["undergrad"] },
  { name: "Deakin University (Deakin MD)", city: "Geelong", state: "VIC", pathway: ["undergrad"] },
  { name: "University of Queensland (UQ MD)", city: "Brisbane", state: "QLD", pathway: ["undergrad"] },
  { name: "Griffith University (Griffith MD)", city: "Gold Coast", state: "QLD", pathway: ["undergrad"] },
  { name: "James Cook University (JCU MBBS)", city: "Townsville/Cairns", state: "QLD", pathway: ["direct"], note: "Rural Focus" },
  { name: "Bond University", city: "Gold Coast", state: "QLD", pathway: ["direct"], note: "Private / 4yr 8mo Direct" },
  { name: "University of Adelaide", city: "Adelaide", state: "SA", pathway: ["direct"] },
  { name: "Flinders University", city: "Adelaide", state: "SA", pathway: ["undergrad"] },
  { name: "University of Western Australia (UWA)", city: "Perth", state: "WA", pathway: ["direct", "undergrad"] },
  { name: "Curtin University", city: "Perth", state: "WA", pathway: ["direct"] },
  { name: "University of Notre Dame Fremantle", city: "Fremantle", state: "WA", pathway: ["undergrad"] },
  { name: "University of Tasmania (UTAS)", city: "Hobart", state: "TAS", pathway: ["direct"] },
  { name: "Charles Darwin University (Joint NT MP)", city: "Darwin", state: "NT", pathway: ["direct"] },
];
