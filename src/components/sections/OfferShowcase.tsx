// 합격증 갤러리 — DB 기반 (offers 테이블 + Supabase Storage).
// Wilson 이 /admin/offers 에서 업로드 + 관리. published 만 노출.
// 데이터 없을 때 placeholder 3장 (사회적 증거 빈 페이지 회피).
// PART 0-1: 카톡 URL = pf.kakao.com/_GadTX 만.

import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import OfferCarousel from "./OfferCarousel";

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
    .eq("status", "published")
    .order("display_order")
    .order("year", { ascending: false })
    .limit(12);

  const rows = (data ?? []) as OfferRow[];
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
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-semibold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
          >
            {t("ctaPrimary")} <span aria-hidden>↓</span>
          </a>
          <p className="mt-4 text-sm text-ink-500">{t("ctaNote")}</p>
        </div>
      </div>
    </section>
  );
}
