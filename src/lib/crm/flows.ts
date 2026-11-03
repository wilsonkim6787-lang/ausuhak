// Services, workflow templates and display labels for the student CRM.

export type Service = "study" | "language" | "visa" | "other";

export const SERVICES: { key: Service; label: string; color: string; bg: string }[] = [
  { key: "study", label: "진학", color: "#0E4C92", bg: "#E7F0FB" },
  { key: "language", label: "어학연수", color: "#1F6B5C", bg: "#E5F2EE" },
  { key: "visa", label: "비자", color: "#5B43A0", bg: "#F0ECF9" },
  { key: "other", label: "기타", color: "#8A5A1F", bg: "#FBF1E3" },
];

export function serviceOf(key: string) {
  return SERVICES.find((s) => s.key === key) ?? SERVICES[3];
}

type Phase = { phase: string; color: string; steps: [string, string][] };

// Default steps created with a new case. Wilson can rename/skip/add per case.
export const FLOWS: Record<Service, Phase[]> = {
  study: [
    { phase: "상담", color: "#5B6577", steps: [["c_kakao", "카톡 1차 상담"], ["c_signup", "마이페이지 가입"], ["c_quote", "1:1 상담 + 견적서"]] },
    { phase: "학교 지원", color: "#0E4C92", steps: [["a_select", "학교 선정"], ["a_english", "영어 준비"], ["a_docs", "지원 서류 수집"], ["a_submit", "지원서 제출"]] },
    { phase: "입학허가", color: "#1F6B5C", steps: [["o_offer", "Offer Letter 수령"], ["o_tuition", "학비 납부"], ["o_coe", "입학허가서(CoE)"]] },
    { phase: "비자", color: "#5B43A0", steps: [["v_prep", "비자 서류 준비"], ["v_956a", "956A 수신인 지정"], ["v_form", "신청서 작성"], ["v_submit", "비자 신청 제출"], ["v_grant", "비자 승인"]] },
    { phase: "출국", color: "#8A5A1F", steps: [["d_ticket", "항공권 예약"], ["d_insurance", "보험 가입"], ["d_prep", "출국 준비 안내"], ["d_arrive", "호주 도착"]] },
  ],
  language: [
    { phase: "상담", color: "#5B6577", steps: [["lc_kakao", "카톡 1차 상담"], ["lc_quote", "견적서"]] },
    { phase: "학교·기간", color: "#0E4C92", steps: [["l_school", "어학원·지역 선택"], ["l_course", "과정·기간 확정"], ["l_apply", "등록 신청"]] },
    { phase: "등록", color: "#1F6B5C", steps: [["l_offer", "입학허가 수령"], ["l_fee", "등록금 납부"], ["l_coe", "CoE (학생비자일 때)"]] },
    { phase: "비자", color: "#5B43A0", steps: [["lv_type", "비자 종류 결정"], ["lv_956a", "956A 수신인 지정"], ["lv_submit", "비자 신청"], ["lv_grant", "비자 승인"]] },
    { phase: "출국", color: "#8A5A1F", steps: [["ld_home", "숙소·홈스테이"], ["ld_ticket", "항공권·보험"], ["ld_arrive", "호주 도착"]] },
  ],
  visa: [
    { phase: "상담", color: "#5B6577", steps: [["vc_kakao", "카톡 1차 상담"], ["vc_check", "비자 종류·요건 확인"]] },
    { phase: "서류", color: "#8A5A1F", steps: [["vd_list", "서류 목록 안내"], ["vd_collect", "서류 수집"], ["vd_translate", "번역·공증"], ["vd_956a", "956A 수신인 지정"]] },
    { phase: "신청서", color: "#0E4C92", steps: [["vf_gs", "진술서 작성"], ["vf_form", "신청서 작성"], ["vf_review", "학생 확인"]] },
    { phase: "접수", color: "#5B43A0", steps: [["vl_pay", "신청비 결제"], ["vl_lodge", "접수"], ["vl_health", "신체검사·추가 서류"]] },
    { phase: "결과", color: "#1F6B5C", steps: [["vg_grant", "승인"], ["vg_explain", "조건 안내"]] },
  ],
  other: [
    { phase: "상담", color: "#5B6577", steps: [["oc_kakao", "요청 내용 확인"]] },
    { phase: "진행", color: "#0E4C92", steps: [["od_1", "진행"]] },
    { phase: "마무리", color: "#1F6B5C", steps: [["oe_done", "완료 안내"]] },
  ],
};

export function phaseColor(service: string, phase: string) {
  const f = FLOWS[service as Service] ?? FLOWS.other;
  return f.find((p) => p.phase === phase)?.color ?? "#5B6577";
}

export const STEP_STATE: Record<string, { label: string; color: string }> = {
  todo: { label: "대기", color: "#8A94A6" },
  doing: { label: "진행 중", color: "#9B2C3E" },
  done: { label: "완료", color: "#1F6B5C" },
  skip: { label: "해당 없음", color: "#8A94A6" },
};

export const CASE_STATUS: Record<string, string> = {
  active: "진행 중",
  done: "완료",
  hold: "보류",
  cancelled: "취소",
};

// Document states, admin wording and family wording.
export const DOC_STATE: Record<string, { admin: string; family: string; color: string; bg: string }> = {
  requested: { admin: "요청함", family: "올려 주세요", color: "#9B2C3E", bg: "#F9E9EC" },
  received: { admin: "받음", family: "받았습니다", color: "#0E4C92", bg: "#E7F0FB" },
  reviewing: { admin: "검토 중", family: "제가 보는 중", color: "#0E4C92", bg: "#E7F0FB" },
  ok: { admin: "확인 완료", family: "완료", color: "#1F6B5C", bg: "#E5F2EE" },
  redo: { admin: "다시 요청", family: "다시 올려 주세요", color: "#9B2C3E", bg: "#F9E9EC" },
};

export const FEE_KIND: Record<string, string> = {
  charge: "AusUhak 진행 비용",
  payment: "받은 금액",
  external: "학교·이민성 직접 납부",
  commission: "학교 커미션 (나만 보기)",
};

export const ENROL_STATUS: Record<string, string> = {
  planned: "지원 예정",
  applied: "지원함",
  conditional: "조건부 오퍼",
  unconditional: "무조건 오퍼",
  accepted: "오퍼 수락",
  coe: "CoE 발급",
  withdrawn: "취소",
  rejected: "불합격",
};

// Student visa (500) expiry rule of thumb (Home Affairs): course ends Nov-Dec ->
// 15 March next year; otherwise +2 months (+1 month for courses of 10 months or less).
export function expectedVisaExpiry(lastEnd: Date, totalMonths: number): Date {
  const m = lastEnd.getMonth();
  if (m === 10 || m === 11) return new Date(lastEnd.getFullYear() + 1, 2, 15);
  const d = new Date(lastEnd);
  d.setMonth(d.getMonth() + (totalMonths <= 10 ? 1 : 2));
  return d;
}

export function fmtDateKo(s: string | null | undefined) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function fmtMoney(amount: number | string, currency: string) {
  const n = Number(amount);
  if (currency === "KRW") return n.toLocaleString("ko-KR") + "원";
  const sym = currency === "AUD" ? "A$" : currency === "USD" ? "US$" : currency + " ";
  return sym + n.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
