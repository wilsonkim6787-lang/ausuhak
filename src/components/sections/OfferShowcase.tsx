// 합격증 갤러리 — DB 기반 (offers 테이블 + Supabase Storage).
// Wilson 이 /admin/offers 에서 업로드 + 관리. published 만 노출.
// 데이터 없을 때 placeholder 3장 (사회적 증거 빈 페이지 회피).
// PART 0-1: 카톡 URL = pf.kakao.com/_GadTX 만.

import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

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
      }));

  return (
    <section id="offers" className="bg-white">
      <div className="container mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            {t("eyebrow")}
          </span>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-navy-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-700 sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-gold-600/30 bg-gold-600/10 px-4 py-2 text-xs font-bold tracking-wider text-gold-600 sm:text-[13px]">
            <span className="size-1.5 animate-pulse rounded-full bg-gold-600" />
            {t("statusBadge")}
          </div>
        </div>

        {/* 모바일: 가로 스와이프 carousel (scroll-snap) / PC: 3개 그리드 */}
        <div className="mt-12 -mx-4 overflow-x-auto pb-2 sm:mx-0 sm:overflow-visible sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex snap-x snap-mandatory gap-5 px-4 sm:grid sm:grid-cols-3 sm:px-0">
            {items.slice(0, 6).map((o, i) => (
              <li
                key={o.id ?? i}
                className="w-[80vw] max-w-[340px] shrink-0 list-none snap-center sm:w-auto sm:max-w-none"
              >
                <div className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-[4/5] border-b border-cream-300">
                    {o.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={o.image_url}
                        alt={`${o.school} 합격증`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center"
                        style={{
                          background:
                            "repeating-linear-gradient(135deg, #FBF7EE 0, #FBF7EE 10px, #F5EFD9 10px, #F5EFD9 20px)",
                        }}
                      >
                        <div className="text-center">
                          <div className="font-display text-5xl text-gold-600 opacity-50">
                            {"\u{1F4DC}"}
                          </div>
                          <p className="mt-3 text-[11px] font-bold tracking-[0.2em] text-ink-500">
                            {t("placeholderLabel")}
                          </p>
                          <p className="mt-1 text-[10px] text-ink-500">
                            {o.year ?? "—"} OFFER
                          </p>
                        </div>
                      </div>
                    )}
                    {o.student_alias && (
                      <div className="absolute right-3 top-3 rounded-full bg-navy-900/85 px-3 py-1 text-[10px] font-bold tracking-wider text-cream-100">
                        {o.student_alias}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {o.year && (
                      <p className="text-xs font-bold tracking-wider text-gold-600">
                        {o.year}
                      </p>
                    )}
                    <p className="mt-1.5 text-sm font-bold leading-snug text-navy-900 sm:text-base">
                      {o.school}
                    </p>
                    {o.program && (
                      <p className="mt-1 text-xs leading-relaxed text-ink-700 sm:text-sm">
                        {o.program}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 모바일 스와이프 힌트 (2장 이상일 때만) */}
        {items.length >= 2 && (
          <p className="mt-4 text-center text-xs text-ink-500 sm:hidden">
            {t("swipeHint")}
          </p>
        )}

        <div className="mx-auto mt-12 max-w-3xl rounded-2xl border-l-4 border-gold-600 bg-gold-100 p-6 sm:p-7">
          <p className="text-sm leading-relaxed text-ink-900 sm:text-base">
            {t("statusNote")}
          </p>
        </div>

        <div className="mt-10 text-center">
          <a
            href="https://pf.kakao.com/_GadTX"
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="offers"
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-600 px-8 py-4 text-base font-semibold text-white shadow-md transition hover:bg-gold-500 hover:shadow-lg sm:text-lg"
          >
            {t("ctaPrimary")} <span aria-hidden>→</span>
          </a>
          <p className="mt-4 text-sm text-ink-500">{t("ctaNote")}</p>
        </div>
      </div>
    </section>
  );
}
