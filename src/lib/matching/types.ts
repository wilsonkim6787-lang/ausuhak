// 매칭 엔진 타입 (PART 0-7 6변수 표준)

export type Education = "검정고시" | "고졸" | "대학재학" | "대졸" | "워홀러";
export type EnglishLevel = "없음" | "4.0-5.0" | "5.5" | "6.0" | "6.5" | "7.0+";
export type Region =
  | "시드니" | "멜번" | "브리즈번" | "골드코스트" | "퍼스"
  | "애들레이드" | "호바트" | "캔버라" | "추천받기";
export type Major =
  | "간호" | "IT" | "비즈니스" | "공학" | "요리·호텔"
  | "유아교육" | "디자인" | "Trade" | "의료" | "미정";
export type BudgetRange = "$25-35K" | "$35-50K" | "$50-65K" | "$65-80K" | "$80K+";
export type AgeRange = "18미만" | "18-24" | "25-32" | "33-39" | "40+";

export type DiagnoseInput = {
  age?: number;
  education: Education;
  english_level: EnglishLevel;
  preferred_region: Region;
  major: Major;
  budget_range: BudgetRange;
};

export type MedicalPathway = "direct" | "undergrad" | "graduate" | "converter" | "transfer";

export type PathwayPlan = {
  pathway: string;
  steps: string[];
  duration_years_min: number;
  duration_years_max: number;
  total_budget_min?: number;
  total_budget_max?: number;
};

export type SchoolPick = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  type: string;
  qs: number | null;
  reason: string;
  programs: Array<{ name?: string; ielts?: string | number; tuition?: string | number; pr_cat?: string; pr_grade?: string }>;
};

export type AppliedBlock = {
  rule_id: string;
  severity: "hard" | "soft";
  title: string;
  message: string;
  alternative: string | null;
};

export type AppliedAlert = {
  alert_id: string;
  title: string;
  truth: string;
};

export type Cards = {
  card1_schools: {
    title: string;
    items: SchoolPick[];                  // 경로 A: 학사 직접 입학 (universities)
    pathway_items?: SchoolPick[];          // 경로 B: Foundation/Diploma (고졸/검정고시만)
    show_dual_path?: boolean;
    pathway_note?: string;                 // 두 경로 비교 메시지
    consultation_note?: string;            // "정확한 경로는 내신/영어 평가 후 카톡 상담"
    empty_message?: string;
    faq_text?: string;
  };
  card2_region:  { title: string; region: string; description: string; faq_text?: string };
  card3_pathway: { title: string; plan: PathwayPlan; scenario_id?: string; faq_text?: string };
  card4_major:   { title: string; major: string; description: string; faq_text?: string; pr_info?: string };
  card5_visa_pr: { title: string; visa: string; pr_paths: string[]; faq_text?: string };
  card6_wilson:  { title: string; quote: string; recommendation: string };
  card7_next:    { title: string; actions: Array<{ label: string; href?: string; kind: "kakao" | "form" | "info" }> };
};

export type MatchResult = {
  age_range: AgeRange | null;
  is_medical: boolean;
  medical_pathway: MedicalPathway | null;
  scenario_id: string | null;
  blocks_hard: AppliedBlock[];
  blocks_soft: AppliedBlock[];
  alerts: AppliedAlert[]; // 운영자 전용 / 학생 카드에 노출 X
  cards: Cards;
};
