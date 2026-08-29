// 합격증 갤러리 — DB 기반 (offers 테이블 + Supabase Storage).
// Wilson 이 /admin/offers 에서 업로드 + 관리. published 만 노출.
// 데이터 없을 때 placeholder 3장 (사회적 증거 빈 페이지 회피).
// PART 0-1: 카톡 URL = pf.kakao.com/_GadTX 만.

import { getTranslations } from "next-intl/server";
import { createPublicClient } from "@/lib/supabase/public";
import OfferCarousel from "./OfferCarousel";

type OfferRow = {
  id: string;
  school: string;
  program: string | null;
  year: number | null;
  student_alias: string | null;
  image_path: string | null;
  story: string | null;
};

// Fisher-Yates 셔플 — 방문마다 노출 순서 다양화.
// 모듈 스코프로 분리: 서버 컴포넌트라 요청당 랜덤은 안전하나, render 본문의 Math.random 은 purity 규칙 위반.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FALLBACK: Pick<OfferRow, "school" | "program" | "year" | "student_alias">[] = [
  { school: "The University of Sydney", program: "Bachelor of Nursing",   year: 2025, student_alias: "K.J.Y" },
  { school: "UNSW Sydney",              program: "Bachelor of Commerce",  year: 2025, student_alias: "L.S.H" },
  { school: "The University of Melbourne", program: "Bachelor of Science", year: 2024, student_alias: "P.M.J" },
];

export default async function OfferShowcase() {
  const t = await getTranslations("OfferShowcase");

  // published 만 조회 (RLS 가 익명 SELECT 허용).
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("offers")
    .select("id, school, program, year, student_alias, image_path, story")
    .eq("status", "published");

  // 전체 노출 (12장 샘플링 제거) — 순서는 방문마다 셔플, 캐러셀이 3장씩 회전.
  const rows = shuffle((data ?? []) as OfferRow[]);
  const useFallback = rows.length === 0;
  const items: Array<{
    id?: string;
    school: string;
    program: string | null;
    year: number | null;
    student_alias: string | null;
    image_url: string | null;
    is_pdf?: boolean;
    has_story?: boolean;
  }> = useFallback
    ? FALLBACK.map((f) => ({ ...f, image_url: null }))
    : rows.map((r) => ({
        id: r.id,
        school: r.school,
        program: r.program,
        year: r.year,
        student_alias: r.student_alias,
        image_url: r.image_path
          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/offers/${r.image_path}`
          : null,
        is_pdf: r.image_path ? r.image_path.toLowerCase().endsWith(".pdf") : false,
        // story 텍스트는 클라이언트로 보내지 않고 존재 여부(boolean)만 — 카드 "후기 보기" 신호용
        has_story: !!r.story,
      }));

  return (
    <section id="offers" className="bg-white">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold tracking-wide text-gold-600 sm:text-3xl">
            {t("eyebrow")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("title")}
          </p>

        </div>

        {/* PC = 3개씩 자동 회전 (5초) / 모바일 = 가로 swipe */}
        <div className="mt-12">
          <OfferCarousel items={items} placeholderLabel={t("placeholderLabel")} />
        </div>

        {/* 모바일 스와이프 힌트 (2장 이상일 때만) */}
        {items.length >= 2 && (
          <p className="mt-4 text-center text-xs text-ink-500 sm:hidden">
            {t("swipeHint")}
          </p>
        )}

        {/* 보조(네비게이션) CTA — 아웃라인. 핵심 전환(카카오·Hero 진단)의 골드 채움과 위계 분리. */}
        <div className="mt-10 text-center">
          <a
            href="#diagnose"
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl border-2 border-gold-600 bg-white px-8 py-4 text-base font-bold text-gold-600 transition hover:border-gold-500 hover:bg-cream-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-600 focus-visible:ring-offset-2 sm:text-lg"
          >
            {t("ctaPrimary")} <span aria-hidden>↓</span>
          </a>
        </div>

        {/* 함께하는 호주 대학 — 한 문장(모바일 친화) */}
        <div className="mt-12 border-t border-cream-200 pt-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            함께하는 호주 대학
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base font-semibold leading-relaxed text-navy-900 sm:text-lg">
            Go8(8개 명문 대학)을 포함한 호주 전역 대학 진학을 지원합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
