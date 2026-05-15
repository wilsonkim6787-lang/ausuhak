// PART F-5 셀프 가이드 4영역 (학생 자율 학습)
// 학생 절대 X (내부 매뉴얼·notes·internal_faqs)는 포함 안 함.

type Section = {
  num: number;
  emoji: string;
  title: string;
  items: { label: string; note?: string }[];
};

const SECTIONS: Section[] = [
  {
    num: 1,
    emoji: "📌",
    title: "입학 준비",
    items: [
      { label: "서류 체크리스트", note: "여권 / 학력 / 영어 / 재정 / GS Statement" },
      { label: "GS Statement 4가지 질문 (예시)", note: "유학 동기 / 학교 선택 이유 / 학업 계획 / 졸업 후 계획" },
      { label: "영문 이력서 가이드", note: "역연대순 / Education → Experience / 1페이지 권장" },
      { label: "추천서 (의대 필수)", note: "한국 학교 교수·교사 2~3명 / 영문 / 학업 능력 + 인성" },
    ],
  },
  {
    num: 2,
    emoji: "🗣️",
    title: "영어 준비",
    items: [
      { label: "IELTS 영역별 학습 자료 (무료 추천)", note: "Listening · Reading · Writing · Speaking" },
      { label: "일주일 학습 플랜 예시", note: "월·수·금 = 영역별 / 화·목 = 모의 시험 / 주말 = 복습" },
      { label: "PTE 대안 검토", note: "IELTS 6.5+ 어려우면 PTE 65 (대부분 학교 동등)" },
      { label: "영어 7.0+ 필요한 케이스", note: "의대 · 간호 · 교사 학과 (AHPRA 등록 요건 포함)" },
    ],
  },
  {
    num: 3,
    emoji: "🌏",
    title: "호주 생활 (출국 전)",
    items: [
      { label: "도시별 한인 커뮤니티 (이름 안내)", note: "시드니·멜번·브리즈번·퍼스" },
      { label: "은행·통신사 안내", note: "Commonwealth Bank / ANZ · Telstra / Optus / Vodafone" },
      { label: "비자 응급 처치", note: "도착 후 비자 조건 점검 / 학업 위반 시 즉시 카톡" },
      { label: "안전·비상 연락처", note: "응급 000 / 한국 영사 콜센터" },
    ],
  },
  {
    num: 4,
    emoji: "✈️",
    title: "호주 도착 후",
    items: [
      { label: "첫 1주 체크리스트", note: "기숙사·렌트 / 휴대폰·은행 / 학교 오리엔테이션" },
      { label: "첫 1개월 체크리스트", note: "Tax File Number / Medicare(영주권자만) / OSHC 등록 확인" },
      { label: "알바 구하기 + 영문 면접", note: "20시간/주 (학기 중) / Cover Letter + Resume" },
      { label: "영주권 계획 (전공별)", note: "간호 RN → 491/189 / IT → 491/190 / Trade → 482/494" },
    ],
  },
];

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default function MypageSelfGuidePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">📚 셀프 가이드</h1>
        <p className="mt-1 text-sm text-ink-500">
          학생이 스스로 학습할 수 있는 4영역 자료. 자세한 케이스는 1:1 카톡 상담.
        </p>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((sec) => (
          <section
            key={sec.num}
            className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
              <span>{sec.emoji}</span>
              <span>
                {sec.num}. {sec.title}
              </span>
            </h2>
            <ul className="space-y-2.5">
              {sec.items.map((it, i) => (
                <li key={i} className="border-l-2 border-gold-100 pl-3">
                  <p className="text-sm font-medium text-navy-900">{it.label}</p>
                  {it.note && <p className="mt-0.5 text-xs text-ink-500">{it.note}</p>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-navy-800/20 bg-navy-900 p-5 text-center text-cream-100">
        <p className="text-sm">개인 케이스 진단·조언은 1:1 카톡 상담에서</p>
        <a
          href={KAKAO_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-kakao-source="mypage_self_guide"
          className="mt-3 inline-flex rounded-full bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-500"
        >
          💬 Wilson에게 1:1 상담
        </a>
      </div>
    </div>
  );
}
