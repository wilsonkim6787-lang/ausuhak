// 메인 페이지 "내 상황별 FAQ 진입점" — DiagnoseCTA 대체.
// 6 변수 (학력·영어·전공·예산·비자·가족) 별 카드 → 가장 관련 FAQ 카테고리 link.
// hint 카피는 기존 DiagnoseCTA 의 진단 폼 안내 텍스트 재사용.

import Link from "next/link";
import { FAQ_CATEGORIES, getTotalCount } from "@/data/faqs";

// 6 변수 → 가장 관련 FAQ 카테고리 매핑.
// FAQ_CATEGORIES (10): 처음 시작/학비/학교/간호의대/요리트레이드/IT경영/비자/일상/가족/상담
const SITUATIONS: {
  emoji: string;
  label: string;
  hint: string;
  catIndex: number; // FAQ_CATEGORIES index
}[] = [
  {
    emoji: "🎓",
    label: "학력 별 진학 루트",
    hint: "학력에 따라 가능한 루트가 달라집니다. 검정고시·고졸·대학재학·대졸·워홀러.",
    catIndex: 0, // 처음 시작할 때
  },
  {
    emoji: "📊",
    label: "영어 별 시작점",
    hint: "영어 없어도 시작합니다 — 시작 학생 절반. IELTS·PTE·ELICOS.",
    catIndex: 0, // 처음 시작할 때
  },
  {
    emoji: "📚",
    label: "전공 별 학교·졸업",
    hint: "간호·의대·IT·경영·요리·트레이드. 전공마다 학교·졸업·취업 다릅니다.",
    catIndex: 2, // 학교 고르기
  },
  {
    emoji: "💰",
    label: "학비·예산",
    hint: "학비·생활비·숙소·항공·비자. 학생 예산에 맞는 현실적 옵션.",
    catIndex: 1, // 학비와 생활비
  },
  {
    emoji: "🛂",
    label: "비자·영주권",
    hint: "졸업 → 비자 → 영주권 트랙. 직업·지역에 따라 다른 경로.",
    catIndex: 6, // 비자와 영주권
  },
  {
    emoji: "👨‍👩‍👧",
    label: "가족·조기유학",
    hint: "동반자·미성년·가족 동반·특수 케이스.",
    catIndex: 8, // 가족·특별한 상황
  },
];

export default function FaqIndex() {
  const total = getTotalCount();

  return (
    <section className="bg-cream-100 py-16 sm:py-20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wider text-gold-600">
          내 상황부터 확인
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">
          내 상황에 맞는 안내부터 보세요
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
          Wilson 이 19년 동안 가장 많이 받은 질문 {total}개. 학생 상황별로 정리했습니다.
          본인 케이스와 가까운 카드부터 클릭하세요.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SITUATIONS.map((s, i) => {
            const cat = FAQ_CATEGORIES[s.catIndex];
            return (
              <li key={i}>
                <Link
                  href={`/faq?cat=${s.catIndex}`}
                  className="group flex h-full flex-col gap-2 rounded-2xl border border-cream-300 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-600 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-100 text-xl"
                    >
                      {s.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-base font-bold text-navy-900 group-hover:text-gold-600">
                        {s.label}
                      </p>
                      {cat && (
                        <p className="mt-0.5 text-[11px] text-ink-500">
                          {cat.icon} {cat.name} · {cat.items.length}개 질문
                        </p>
                      )}
                    </div>
                    <span
                      aria-hidden
                      className="shrink-0 text-gold-600 transition group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-700">
                    {s.hint}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-full border border-navy-900 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-navy-900 hover:text-white"
          >
            📚 전체 10 카테고리 보기
          </Link>
          <p className="text-xs text-ink-500">
            답을 못 찾으시면 Wilson 카카오 1:1 상담에서 직접 안내합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
