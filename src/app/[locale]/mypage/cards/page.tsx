import Link from "next/link";
import { requireStudent } from "@/lib/auth/requireStudent";
import {
  BlocksBanner,
  Card1Schools,
  Card2Region,
  Card3Pathway,
  Card4Major,
  Card5Visa,
  Card6Wilson,
  Card7Next,
} from "@/components/diagnose/Cards";
import { matchDiagnose, type DiagnoseInput } from "@/lib/matching";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

// 학생 본인의 6변수로 카드 7장을 재실행해서 보여줌.
// 룰이 갱신되면 항상 최신 결과 = JSONB 캐시보다 정확.
export default async function MypageCardsPage() {
  const { student } = await requireStudent();

  const has6 =
    student.age != null &&
    student.education &&
    student.english_level &&
    student.preferred_region &&
    student.major &&
    student.budget_range;

  if (!has6) {
    return (
      <div className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h1 className="font-display text-xl font-bold text-navy-900">
          📄 카드 7장 결과
        </h1>
        <p className="mt-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-ink-700">
          아직 6변수 진단을 완료하지 않으셨습니다. 진단을 먼저 하시면 여기서 결과를 다시 보실 수 있어요.
        </p>
        <Link
          href="/diagnose"
          className="mt-4 inline-flex rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
        >
          🎯 30초 진단하러 가기
        </Link>
      </div>
    );
  }

  const input: DiagnoseInput = {
    age: student.age!,
    education: student.education as DiagnoseInput["education"],
    english_level: student.english_level as DiagnoseInput["english_level"],
    preferred_region: student.preferred_region as DiagnoseInput["preferred_region"],
    major: student.major as DiagnoseInput["major"],
    budget_range: student.budget_range as DiagnoseInput["budget_range"],
  };
  const result = matchDiagnose(input);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold tracking-wider text-gold-600">진단 결과 (최신)</p>
        <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-navy-900 sm:text-3xl">
          {input.education} · {input.major} · {input.preferred_region}
        </h1>
        <p className="mt-1 text-xs text-ink-500">
          만 {input.age}세 · 영어 {input.english_level} · 예산 {input.budget_range}
        </p>
        {result.is_medical && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-2.5 py-1 text-xs font-bold text-gold-400">
            의대 트랙 ({result.medical_pathway})
          </p>
        )}
      </div>

      {result.blocks_hard.length + result.blocks_soft.length > 0 && (
        <BlocksBanner hard={result.blocks_hard} soft={result.blocks_soft} />
      )}

      <Card1Schools data={result.cards.card1_schools} />
      <Card2Region data={result.cards.card2_region} />
      <Card3Pathway data={result.cards.card3_pathway} />
      <Card4Major data={result.cards.card4_major} />
      <Card5Visa data={result.cards.card5_visa_pr} />
      <Card6Wilson data={result.cards.card6_wilson} />
      <Card7Next data={result.cards.card7_next} kakaoUrl={KAKAO_URL} />

      <p className="text-center text-xs text-ink-500">
        * 룰·정본이 갱신되면 결과가 변할 수 있습니다. 이 페이지는 항상 최신 룰 기반.
        <br />* 학비·정원·정책은 1:1 카톡 상담에서 최종 확정.
      </p>
    </div>
  );
}
