// 합격증 갤러리 전체 보기 — 발행된 합격증·후기 전부를 격자로.
// 순서는 admin 의 '정렬(display_order)' 을 따른다 (의대·약대 등 우선 배치 유지).
// 익명 접근 가능 (RLS: published 만 SELECT).

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/layout/Header";
import HeaderEn from "@/components/layout/HeaderEn";
import Footer from "@/components/layout/Footer";
import StickyKakao from "@/components/layout/StickyKakao";
import { createPublicClient } from "@/lib/supabase/public";
import { KAKAO_URL } from "@/lib/constants";

// 정적 캐시 + 5분 재생성 (관리자 저장 시 revalidatePath 로 즉시 갱신)
export const revalidate = 300;

export const metadata: Metadata = {
  title: "합격증 갤러리 · 학생 후기 — ausuhak.com 호주유학",
  description:
    "ausuhak.com 이 진행한 호주 대학·칼리지·TAFE 합격증과 학생 후기 전체 보기. 의대·약대·간호·로스쿨부터 조기유학·기술이민까지 실제 케이스.",
};

type OfferRow = {
  id: string;
  school: string;
  program: string | null;
  year: number | null;
  student_alias: string | null;
  image_path: string | null;
  story: string | null;
};

export default async function OffersIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const HeaderCmp = locale === "en" ? HeaderEn : Header;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("offers")
    .select("id, school, program, year, student_alias, image_path, story")
    .eq("status", "published")
    .order("display_order")
    .order("year", { ascending: false });

  const offers = (data ?? []) as OfferRow[];
  const bucketUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/offers/${path}`;
  const isPdf = (path: string | null) => !!path && path.toLowerCase().endsWith(".pdf");

  return (
    <>
      <HeaderCmp />
      <main className="flex-1 bg-cream-100 pb-20 sm:pb-0">
        <section className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            Offers &amp; Stories
          </p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
              합격증 갤러리 · 학생 후기
            </h1>
            <p className="text-sm text-ink-500">
              총 <strong className="text-gold-600">{offers.length}</strong>건
            </p>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-700 sm:text-base">
            전부 실제 진행 케이스입니다. 개인정보만 가리고 학교·과정·날짜는 그대로 두었습니다.
            카드를 누르면 합격 과정과 학생 후기를 볼 수 있어요.
          </p>

          {offers.length === 0 ? (
            <p className="mt-10 text-sm text-ink-500">— 준비 중입니다.</p>
          ) : (
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {offers.map((o) => {
                const pdf = isPdf(o.image_path);
                return (
                  <li key={o.id}>
                    <Link
                      href={`/offers/${o.id}`}
                      className="group block h-full overflow-hidden rounded-xl border border-cream-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative aspect-[4/5] bg-cream-200">
                        {o.image_path && !pdf ? (
                          <Image
                            src={bucketUrl(o.image_path)}
                            alt={`${o.school} 합격증`}
                            fill
                            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 240px"
                            className="object-cover object-top transition group-hover:scale-[1.03]"
                          />
                        ) : o.image_path && pdf ? (
                          <object
                            data={`${bucketUrl(o.image_path)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`}
                            type="application/pdf"
                            className="pointer-events-none absolute inset-0 h-full w-full bg-white"
                            aria-label={`${o.school} PDF`}
                          >
                            <div className="flex h-full items-center justify-center">
                              <div className="text-center">
                                <span className="text-3xl">📄</span>
                                <p className="mt-1 text-[9px] font-bold text-ink-700">PDF</p>
                              </div>
                            </div>
                          </object>
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-ink-500">
                            (이미지 없음)
                          </div>
                        )}
                        {o.student_alias && (
                          <span className="absolute right-1.5 top-1.5 rounded-full bg-navy-900/85 px-2 py-0.5 text-[9px] font-bold tracking-wider text-cream-100">
                            {o.student_alias}
                          </span>
                        )}
                        {o.story && (
                          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-gold-600/90 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white">
                            후기 있음
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        {o.year && (
                          <p className="text-[10px] font-bold tracking-wider text-gold-600">{o.year}</p>
                        )}
                        <p className="mt-0.5 truncate text-[11px] font-bold text-navy-900 sm:text-xs">
                          {o.school}
                        </p>
                        {o.program && (
                          <p className="mt-0.5 truncate text-[10px] text-ink-700">{o.program}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* 카카오 CTA */}
          <div className="mt-12 rounded-2xl border border-cream-300 bg-white p-6 text-center shadow-sm">
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
              data-kakao-source="offers_index"
              className="mt-5 inline-flex rounded-full bg-gold-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
            >
              💬 카카오로 1:1 상담
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <StickyKakao />
    </>
  );
}
