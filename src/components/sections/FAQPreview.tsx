"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type CategoryKey =
  | "cat1"
  | "cat2"
  | "cat3"
  | "cat4"
  | "cat5"
  | "cat6"
  | "cat7"
  | "cat8"
  | "cat9"
  | "cat10";

const CATEGORIES: { icon: string; key: CategoryKey }[] = [
  { icon: "\u{1F331}", key: "cat1" },
  { icon: "\u{1F4B0}", key: "cat2" },
  { icon: "\u{1F393}", key: "cat3" },
  { icon: "\u{1F3E5}", key: "cat4" },
  { icon: "\u{1F373}", key: "cat5" },
  { icon: "\u{1F4BC}", key: "cat6" },
  { icon: "\u{1F6C2}", key: "cat7" },
  { icon: "\u{1F3E0}", key: "cat8" },
  { icon: "\u{1F46A}", key: "cat9" },
  { icon: "\u{1F4DE}", key: "cat10" },
];

const FAQ_BY_CATEGORY: Record<CategoryKey, string[]> = {
  cat1: [
    "검정고시로 호주 대학에 갈 수 있나요?",
    "영어 점수 없이 시작할 수 있나요?",
    "한국 대학 재학 중인데 편입이 가능한가요?",
    "나이 제한이 있나요? 30~40대도 가능한가요?",
    "고등학교를 중퇴했어도 가능한가요?",
  ],
  cat2: [
    "호주 유학 1년에 학비·생활비 얼마 정도 들까요?",
    "생활비는 어느 정도 잡아야 안전한가요?",
    "장학금 받을 방법이 있나요?",
    "환율 변동에 어떻게 대비해야 하나요?",
    "일하면서 학비 보태는 게 가능한가요?",
  ],
  cat3: [
    "시드니·멜번 중 어디가 우리 아이에게 맞을까요?",
    "Go8 같은 명문대 진학이 현실적으로 가능한가요?",
    "학교 이름과 전공 중 어느 게 더 중요한가요?",
    "입학 후 학교 변경이 가능한가요?",
    "지방 도시 학교가 영주권에 더 유리한가요?",
  ],
  cat4: [
    "간호학과 영어 점수가 얼마나 필요한가요?",
    "호주 의대를 학사로 바로 갈 수 있나요?",
    "한국 간호사 면허가 호주에서 인정되나요?",
    "AHPRA 등록은 어떻게 진행하나요?",
    "약대는 한국 학생도 입학 가능한가요?",
  ],
  cat5: [
    "요리 학교 졸업 후 영주권이 가능한가요?",
    "Trade 비자 트랙은 어떻게 진행되나요?",
    "호텔 매니지먼트 졸업 후 취업이 잘 되나요?",
    "자동차 정비·전기 같은 기술 직군 비자가 있나요?",
    "미용·헤어 자격증이 호주에서 인정되나요?",
  ],
  cat6: [
    "IT 석사 졸업 후 영주권 트랙은 어떻게 되나요?",
    "경영학 전공으로 호주 취업이 가능한가요?",
    "회계 전공이 영주권에 유리한가요?",
    "교직 전공 영주권 트랙은 어떤가요?",
    "한국 학사 전공과 다른 전공으로 갈 수 있나요?",
  ],
  cat7: [
    "학생비자 받기가 까다로운가요?",
    "워홀 비자에서 학생비자로 전환 가능한가요?",
    "졸업 후 영주권은 어떤 절차로 진행되나요?",
    "영주권 점수 계산은 어떻게 되나요?",
    "부모님이 자녀 따라 호주에 갈 수 있나요?",
  ],
  cat8: [
    "호주 처음인데 적응이 많이 어려운가요?",
    "한국 음식·한국 친구는 어디서 만나나요?",
    "의료보험 OSHC는 어떻게 가입하나요?",
    "은행 계좌·휴대폰은 도착 후 어떻게 만드나요?",
    "인종차별이 걱정되는데 실제 어떤가요?",
  ],
  cat9: [
    "결혼한 사람도 학생비자가 가능한가요?",
    "가족 동반 비자 조건은 어떻게 되나요?",
    "자녀를 한국에 두고 가도 괜찮을까요?",
    "형제·자매가 같이 유학 갈 수 있나요?",
    "특정 종교·식이 제한이 있어도 적응 가능한가요?",
  ],
  cat10: [
    "상담 후 바로 진행을 결정해야 하나요?",
    "상담료가 따로 있나요?",
    "카카오 상담 운영 시간은 언제인가요?",
    "Wilson과 직접 통화 상담도 가능한가요?",
    "상담 후 자료·견적서를 받아볼 수 있나요?",
  ],
};

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default function FAQPreview() {
  const t = useTranslations("FAQPreview");
  const [activeIdx, setActiveIdx] = useState(0);
  const activeCategory = CATEGORIES[activeIdx];
  const questions = FAQ_BY_CATEGORY[activeCategory.key];

  return (
    <section id="faq" className="bg-cream-200">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-navy-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-3">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-pressed={activeIdx === i}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeIdx === i
                  ? "bg-navy-900 text-cream-100 shadow-md"
                  : "bg-white text-ink-700 hover:bg-cream-100"
              }`}
            >
              <span aria-hidden>{c.icon}</span>
              {t(c.key)}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white p-7 shadow-sm sm:p-9">
          <ul className="divide-y divide-cream-300">
            {questions.map((q, i) => (
              <li key={i} className="flex items-start gap-3 py-4">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold-600"
                />
                <span className="text-base text-navy-900 sm:text-lg">{q}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-ink-500">
            {t("moreLabel")}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-navy-900 p-8 text-center text-cream-100 sm:p-10">
          <p className="font-display text-xl font-bold sm:text-2xl">
            {t("ctaTitle")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cream-200 sm:text-base">
            {t("ctaBody")}
          </p>
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="faq-preview"
            className="mt-7 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-3.5 text-base font-semibold text-navy-900 shadow-md transition hover:bg-gold-500 hover:shadow-lg"
          >
            {t("ctaKakao")} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
