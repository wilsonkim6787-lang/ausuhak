import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import DiagnoseCompleteTracker from "@/components/diagnose/DiagnoseCompleteTracker";
import { matchDiagnose } from "@/lib/matching";
import type {
  DiagnoseInput, Education, EnglishLevel, Region, Major, BudgetRange,
} from "@/lib/matching";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

// DiagnoseCTA 의 영문 enum → matching 의 한글 enum
const EDU_MAP: Record<string, Education> = {
  high: "고졸",
  ged: "검정고시",
  "uni-current": "대학재학",
  "uni-grad": "대졸",
  master: "대졸",
};
const ENGLISH_MAP: Record<string, EnglishLevel> = {
  none: "없음",
  "5.0": "5.5",
  "6.0": "6.0",
  "6.5": "6.5",
  "7.0": "7.0+",
};
const REGION_MAP: Record<string, Region> = {
  nsw: "시드니",
  vic: "멜번",
  qld: "브리즈번",
  goldcoast: "골드코스트",
  sa: "애들레이드",
  wa: "퍼스",
  tas: "호바트",
  any: "추천받기",
};
const MAJOR_MAP: Record<string, Major> = {
  nursing: "간호",
  business: "비즈니스",
  it: "IT",
  cooking: "요리·호텔",
  hotel: "요리·호텔",
  medicine: "의료",
  pharmacy: "의료",
  other: "미정",
};
const BUDGET_MAP: Record<string, BudgetRange> = {
  save: "$25-35K",
  mid: "$35-50K",
  high: "$50-65K",
  premium: "$65-80K",
  vip: "$80K+",
};

export default async function DiagnosePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const pick = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : "";
  };

  const education = EDU_MAP[pick("edu")];
  const english_level = ENGLISH_MAP[pick("english")];
  const preferred_region = REGION_MAP[pick("region")];
  const major = MAJOR_MAP[pick("major")];
  const budget_range = BUDGET_MAP[pick("budget")];

  if (!education || !english_level || !preferred_region || !major || !budget_range) {
    redirect("/#diagnose");
  }

  const input: DiagnoseInput = {
    education, english_level, preferred_region, major, budget_range,
  };
  const result = matchDiagnose(input);

  return (
    <>
      <Header />
      <DiagnoseCompleteTracker
        education={input.education}
        english_level={input.english_level}
        preferred_region={input.preferred_region}
        major={input.major}
        budget_range={input.budget_range}
        is_medical={result.is_medical}
      />
      <main className="flex-1 bg-cream-100">
        <section className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-600/30 bg-gold-600/10 px-3 py-1 text-xs font-bold tracking-wider text-gold-600">
              <span className="size-1.5 rounded-full bg-success" />
              진단 완료
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">
              {input.education} · {input.major} · {input.preferred_region}
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              영어 {input.english_level} · 예산 {input.budget_range}
            </p>
            {result.is_medical && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-2.5 py-1 text-xs font-bold text-gold-400">
                의대 트랙 ({result.medical_pathway})
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-lg font-bold text-navy-900">
              Wilson 이 직접 검토합니다
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              학생 상황 (학력·영어·전공·지역·예산) 을 토대로 Wilson 이 카카오톡으로 맞춤 안내합니다.
              일반 자동 결과보다 학생 개별 케이스에 맞춘 정밀 매칭이 정확합니다.
            </p>
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source="diagnose_complete"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-600 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-gold-500 sm:w-auto"
            >
              💬 카카오로 1:1 상담 시작
            </a>
          </div>

          <p className="mt-8 text-center text-xs text-ink-500">
            * 학비·정원·정책·비자 룰은 실시간 변동될 수 있어 1:1 카톡 상담으로 최종 확정합니다.
          </p>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
