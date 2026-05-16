// /admin/offers — Wilson 합격증 갤러리 관리.
// admin/layout 이 super_admin 가드. 5MB · JPG·PNG·PDF.

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { upsertOfferAction, deleteOfferAction } from "./actions";

type Offer = {
  id: string;
  school: string;
  program: string | null;
  year: number | null;
  student_alias: string | null;
  image_path: string | null;
  note: string | null;
  story: string | null;
  display_order: number;
  status: string;
  created_at: string;
};

const STATUSES: [string, string][] = [
  ["draft", "📝 draft"],
  ["published", "✅ published"],
  ["archived", "📦 archived"],
];

const ACCEPT = "image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf";

export default async function AdminOffersPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; err?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: offers, error } = await supabase
    .from("offers")
    .select("id, school, program, year, student_alias, image_path, note, story, display_order, status, created_at")
    .order("display_order")
    .order("year", { ascending: false });

  let editing: Offer | null = null;
  if (sp.edit) {
    const { data } = await supabase
      .from("offers")
      .select("*")
      .eq("id", sp.edit)
      .single();
    if (!data) notFound();
    editing = data as Offer;
  }

  const bucketUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/offers/${path}`;
  const isPdf = (path: string | null | undefined) =>
    !!path && path.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy-900">🏆 합격증 갤러리 관리</h1>
        <p className="mt-1 text-sm text-ink-500">
          메인 페이지 OfferShowcase 표시. published 만 학생에게 노출. 5MB / JPG·PNG·PDF.
        </p>
      </header>

      {sp.err && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">⚠️ {sp.err}</p>
      )}
      {sp.ok && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">✅ 저장됨</p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* 리스트 */}
        <section className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-navy-900">총 {offers?.length ?? 0}개</p>
            <Link
              href="/admin/offers?new=1"
              className="rounded-full bg-gold-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-gold-500"
            >
              + 신규 업로드
            </Link>
          </div>

          {error && <p className="mt-3 text-xs text-error">{error.message}</p>}
          {!error && (offers?.length ?? 0) === 0 && (
            <p className="mt-4 text-sm text-ink-500">— 아직 합격증 없음. 우상단 + 신규 클릭.</p>
          )}

          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(offers ?? []).map((o) => {
              const offer = o as Offer;
              const active = sp.edit === offer.id;
              return (
                <li key={offer.id}>
                  <Link
                    href={`/admin/offers?edit=${offer.id}`}
                    className={`block overflow-hidden rounded-xl border bg-cream-100/50 transition hover:scale-[1.02] ${
                      active ? "border-gold-600 ring-2 ring-gold-600/40" : "border-cream-300"
                    }`}
                  >
                    <div className="relative aspect-[4/5] bg-cream-200">
                      {offer.image_path && !isPdf(offer.image_path) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bucketUrl(offer.image_path)}
                          alt={offer.school}
                          className="h-full w-full object-cover"
                        />
                      ) : offer.image_path && isPdf(offer.image_path) ? (
                        <object
                          data={`${bucketUrl(offer.image_path)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`}
                          type="application/pdf"
                          className="pointer-events-none absolute inset-0 h-full w-full bg-white"
                          aria-label={`${offer.school} PDF`}
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
                      <span
                        className={`absolute right-1.5 top-1.5 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          offer.status === "published"
                            ? "bg-success text-white"
                            : offer.status === "draft"
                              ? "bg-warning text-white"
                              : "bg-cream-300 text-ink-700"
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-semibold text-navy-900 truncate">{offer.school}</p>
                      {offer.year && (
                        <p className="text-[10px] text-ink-500">{offer.year}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 편집 폼 */}
        <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
          {!editing && !sp.new ? (
            <p className="text-sm text-ink-500">← 카드 선택 또는 + 신규 업로드</p>
          ) : (
            <OfferForm editing={editing} bucketUrl={bucketUrl} />
          )}
        </section>
      </div>
    </div>
  );
}

function OfferForm({
  editing,
  bucketUrl,
}: {
  editing: Offer | null;
  bucketUrl: (path: string) => string;
}) {
  const isNew = !editing;
  return (
    <div className="flex flex-col gap-3">
      <form action={upsertOfferAction} className="flex flex-col gap-3">
        {editing && <input type="hidden" name="id" value={editing.id} />}

        {editing?.image_path && (
          <div className="rounded-lg border border-cream-300 bg-cream-100/50 p-2">
            {editing.image_path.toLowerCase().endsWith(".pdf") ? (
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  <span className="text-xs font-semibold text-navy-900">PDF</span>
                </div>
                <a
                  href={bucketUrl(editing.image_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-gold-600 hover:underline"
                >
                  새 탭 열기 →
                </a>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={bucketUrl(editing.image_path)}
                alt={editing.school}
                className="mx-auto max-h-48 rounded"
              />
            )}
            <p className="mt-1 text-center text-[10px] text-ink-500 truncate">{editing.image_path}</p>
          </div>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">
            {editing?.image_path ? "새 파일 (교체 / 비우면 유지)" : "파일 (이미지 또는 PDF)"}
          </span>
          <input
            type="file"
            name="file"
            accept={ACCEPT}
            className="rounded-md border border-cream-300 bg-white px-2 py-1 text-xs file:mr-2 file:rounded file:border-0 file:bg-navy-900 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-gold-400"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">학교 *</span>
            <input
              name="school"
              defaultValue={editing?.school ?? ""}
              required
              placeholder="University of Sydney"
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">연도</span>
            <input
              name="year"
              type="number"
              defaultValue={editing?.year != null ? String(editing.year) : ""}
              placeholder="2025"
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">전공·프로그램</span>
          <input
            name="program"
            defaultValue={editing?.program ?? ""}
            placeholder="Bachelor of Nursing"
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">학생 이니셜·별칭 (마스킹)</span>
          <input
            name="student_alias"
            defaultValue={editing?.student_alias ?? ""}
            placeholder="K.J.Y / 검정고시 / W학생"
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">Wilson 한줄 메모 (선택 / 카드 하단)</span>
          <input
            name="note"
            defaultValue={editing?.note ?? ""}
            placeholder="ATAR 99+ / IELTS 7.5"
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">학생 후기·합격 과정 (markdown / 상세 페이지)</span>
          <textarea
            name="story"
            defaultValue={editing?.story ?? ""}
            rows={10}
            placeholder={"## 학생 배경\n- 검정고시 / 19세 / IELTS 6.5\n\n## 지원 과정\n1. Wilson 1:1 상담 (2024.04)\n2. Foundation 6개월 ...\n\n## Wilson 노하우\n- ..."}
            className="rounded-md border border-cream-300 px-2 py-1 text-sm font-mono"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">정렬 (작을수록 먼저)</span>
            <input
              name="display_order"
              type="number"
              defaultValue={editing?.display_order != null ? String(editing.display_order) : "0"}
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">상태</span>
            <select
              name="status"
              defaultValue={editing?.status ?? "published"}
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            >
              {STATUSES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="sm">
            {isNew ? "+ 추가" : "저장"}
          </Button>
        </div>
      </form>

      {!isNew && editing && (
        <form action={deleteOfferAction} className="flex justify-end pt-2 border-t border-cream-200">
          <input type="hidden" name="id" value={editing.id} />
          <button
            type="submit"
            className="text-[11px] text-error hover:underline"
          >
            🗑️ 이 합격증 삭제 (이미지+row)
          </button>
        </form>
      )}
    </div>
  );
}
