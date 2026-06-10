// 합격증 갤러리 — DB 기반 (offers 테이블 + Supabase Storage).
// Wilson 이 /admin/offers 에서 업로드 + 관리. published 만 노출.
// 데이터 없을 때 placeholder 3장 (사회적 증거 빈 페이지 회피).
// PART 0-1: 카톡 URL = pf.kakao.com/_GadTX 만.

import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import OfferCarousel from "./OfferCarousel";
import { GO8, OTHER_UNIVERSITIES } from "@/lib/schools/universities";

type OfferRow = {
  id: string;
  school: string;
  program: string | null;
  year: number | null;
  student_alias: string | null;
  image_path: string | null;
};

const FALLBACK: Pick<OfferRow, "school" | "program" | "year" | "student_alias">[] = [
  { school: "The University of Sydney", program: "Bachelor of Nursing",   year: 2025, student_alias: "K.J.Y" },
  { school: "UNSW Sydney",              program: "Bachelor of Commerce",  year: 2025, student_alias: "L.S.H" },
  { school: "The University of Melbourne", program: "Bachelor of Science", year: 2024, student_alias: "P.M.J" },
];

export default async function OfferShowcase() {
  const t = await getTranslations("OfferShowcase");

  // published 만 조회 (RLS 가 익명 SELECT 허용).
  const supabase = await createClient();
  const { data } = await supabase
    .from("offers")
    .select("id, school, program, year, student_alias, image_path")
    .eq("status", "published");

  const all = (data ?? []) as OfferRow[];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const rows = all.slice(0, 12);
  const useFallback = rows.length === 0;
  const items: Array<{
    id?: string;
    school: string;
    program: string | null;
    year: number | null;
    student_alias: string | null;
    image_url: string | null;
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

        <div className="mt-10 text-center">
          <a
            href="#diagnose"
            className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-600 focus-visible:ring-offset-2 sm:text-lg"
          >
            {t("ctaPrimary")} <span aria-hidden>↓</span>
          </a>
        </div>

        {/* 함께하는 호주 대학 — 커버리지·권위 (배지 → 추후 로고 교체) */}
        <div className="mt-16 border-t border-cream-200 pt-12">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
              함께하는 호주 대학
            </p>
            <p className="mx-auto mt-2 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
              호주 전역 대학 진학을 지원합니다.
            </p>
          </div>
          <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2">
            {GO8.map((u) => (
              <li
                key={u}
                className="rounded-full border border-gold-600/30 bg-gold-100 px-3.5 py-1.5 text-xs font-bold text-gold-700 sm:text-sm"
              >
                {u}
              </li>
            ))}
            {OTHER_UNIVERSITIES.map((u) => (
              <li
                key={u}
                className="rounded-full border border-cream-300 bg-cream-100/60 px-3.5 py-1.5 text-xs font-semibold text-navy-800 sm:text-sm"
              >
                {u}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-center text-[11px] text-ink-500">
            Go8(8개 명문 대학) 포함 호주 전역 대학
          </p>
        </div>
      </div>
    </section>
  );
}
