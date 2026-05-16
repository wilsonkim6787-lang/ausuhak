// 합격증 상세 — 학생 후기·합격 과정 markdown 렌더링.
// 익명 접근 가능 (RLS: published 만 SELECT).

import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import HeaderEn from "@/components/layout/HeaderEn";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import { createClient } from "@/lib/supabase/server";

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

type Offer = {
  id: string;
  school: string;
  program: string | null;
  year: number | null;
  student_alias: string | null;
  image_path: string | null;
  note: string | null;
  story: string | null;
  status: string;
};

marked.setOptions({ gfm: true, breaks: false });

export default async function OfferDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const HeaderCmp = locale === "en" ? HeaderEn : Header;

  const supabase = await createClient();
  const [currentRes, othersRes] = await Promise.all([
    supabase
      .from("offers")
      .select("id, school, program, year, student_alias, image_path, note, story, status")
      .eq("id", id)
      .eq("status", "published")
      .single(),
    supabase
      .from("offers")
      .select("id, school, program, year, student_alias, image_path")
      .eq("status", "published")
      .neq("id", id)
      .order("display_order")
      .order("year", { ascending: false })
      .limit(8),
  ]);

  if (currentRes.error || !currentRes.data) notFound();
  const o = currentRes.data as Offer;
  const others = (othersRes.data ?? []) as Array<{
    id: string;
    school: string;
    program: string | null;
    year: number | null;
    student_alias: string | null;
    image_path: string | null;
  }>;

  const bucketUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/offers/${path}`;
  const imageUrl = o.image_path ? bucketUrl(o.image_path) : null;
  const storyHtml = o.story ? await marked.parse(o.story) : "";

  return (
    <>
      <HeaderCmp />
      <main className="flex-1 bg-cream-100">
        <section className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/#offers"
            className="text-xs font-semibold text-navy-700 hover:text-gold-600"
          >
            ← 합격증 갤러리
          </Link>

          <header className="mt-3 flex flex-wrap items-baseline gap-3">
            {o.year && (
              <span className="font-mono text-sm font-bold text-gold-600">
                {o.year} OFFER
              </span>
            )}
            <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
              {o.school}
            </h1>
            {o.student_alias && (
              <span className="rounded-full bg-navy-900 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-cream-100">
                {o.student_alias}
              </span>
            )}
          </header>
          {o.program && (
            <p className="mt-2 text-sm text-ink-700 sm:text-base">{o.program}</p>
          )}

          {/* 합격증 이미지 */}
          {imageUrl && (
            <figure className="mt-6 overflow-hidden rounded-2xl border border-cream-300 bg-white p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`${o.school} 합격증`}
                className="mx-auto max-h-[600px] w-auto"
              />
            </figure>
          )}

          {/* Wilson 한줄 메모 */}
          {o.note && (
            <div className="mt-6 rounded-xl border-l-4 border-gold-600 bg-gold-100 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
                Wilson 메모
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-900 sm:text-base">
                {o.note}
              </p>
            </div>
          )}

          {/* 후기 / 합격 과정 */}
          {storyHtml ? (
            <section className="mt-8">
              <h2 className="font-display text-lg font-bold text-navy-900 sm:text-xl">
                합격 과정·학생 후기
              </h2>
              <article
                className="offer-story mt-3 rounded-2xl border border-cream-300 bg-white p-6 shadow-sm sm:p-8"
                dangerouslySetInnerHTML={{ __html: storyHtml }}
              />
            </section>
          ) : (
            <p className="mt-6 text-xs text-ink-500">— 후기 준비 중. 비슷한 케이스 상담은 카카오로.</p>
          )}

          {/* 다른 합격증 */}
          {others.length > 0 && (
            <section className="mt-10">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-navy-900 sm:text-xl">
                  다른 합격 케이스
                </h2>
                <Link
                  href="/#offers"
                  className="text-xs font-semibold text-gold-600 hover:underline"
                >
                  전체 보기 →
                </Link>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {others.map((other) => (
                  <li key={other.id}>
                    <Link
                      href={`/offers/${other.id}`}
                      className="group block overflow-hidden rounded-xl border border-cream-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/5] bg-cream-200">
                        {other.image_path ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={bucketUrl(other.image_path)}
                            alt={other.school}
                            loading="lazy"
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-ink-500">
                            (이미지 없음)
                          </div>
                        )}
                        {other.student_alias && (
                          <div className="absolute right-1.5 top-1.5 rounded-full bg-navy-900/85 px-2 py-0.5 text-[9px] font-bold tracking-wider text-cream-100">
                            {other.student_alias}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        {other.year && (
                          <p className="text-[10px] font-bold tracking-wider text-gold-600">
                            {other.year}
                          </p>
                        )}
                        <p className="mt-0.5 truncate text-[11px] font-bold text-navy-900 sm:text-xs">
                          {other.school}
                        </p>
                        {other.program && (
                          <p className="mt-0.5 truncate text-[10px] text-ink-700">
                            {other.program}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 카카오 CTA */}
          <div className="mt-10 rounded-2xl border border-cream-300 bg-white p-6 text-center shadow-sm">
            <p className="font-display text-lg font-bold text-navy-900 sm:text-xl">
              내 케이스도 가능할까?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              학력·영어·예산이 다 다릅니다. Wilson 이 직접 검토 후 가능한 루트만 솔직히 안내합니다.
            </p>
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-kakao-source={`offer_detail_${o.id}`}
              className="mt-5 inline-flex rounded-full bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
            >
              💬 카카오로 1:1 상담
            </a>
          </div>

          <style>{`
            .offer-story { color: #1A1A1A; line-height: 1.75; }
            .offer-story h1, .offer-story h2 { font-family: var(--font-display); font-weight: 700; color: #0A1628; }
            .offer-story h1 { font-size: 1.5rem; margin: 1.25rem 0 0.5rem; }
            .offer-story h2 { font-size: 1.25rem; margin: 1.25rem 0 0.5rem; padding-top: 0.5rem; border-top: 1px solid #E8E0D0; }
            .offer-story h2:first-of-type { border-top: 0; padding-top: 0; }
            .offer-story h3 { font-size: 1.05rem; font-weight: 700; color: #0A1628; margin: 0.9rem 0 0.4rem; }
            .offer-story p { margin: 0.5rem 0; }
            .offer-story ul, .offer-story ol { margin: 0.5rem 0 0.5rem 1.25rem; }
            .offer-story li { margin: 0.25rem 0; }
            .offer-story ul { list-style: disc; }
            .offer-story ol { list-style: decimal; }
            .offer-story strong { color: #0A1628; font-weight: 700; }
            .offer-story em { color: #4A4A4A; }
            .offer-story code { background: #FBF7EE; padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.85em; font-family: var(--font-mono); }
            .offer-story blockquote { border-left: 3px solid #C9962A; padding: 0.25rem 0.75rem; margin: 0.75rem 0; color: #4A4A4A; background: #FBF7EE; }
            .offer-story hr { border: 0; border-top: 1px solid #E8E0D0; margin: 1.5rem 0; }
            .offer-story table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 0.9em; }
            .offer-story th, .offer-story td { border: 1px solid #E8E0D0; padding: 0.4rem 0.75rem; text-align: left; }
            .offer-story th { background: #F5EFD9; font-weight: 600; }
            .offer-story a { color: #C9962A; text-decoration: underline; }
          `}</style>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
