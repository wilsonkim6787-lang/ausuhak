import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import QuoteForm from "../QuoteForm";

type SP = { student?: string };

export default async function NewQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SP>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  // 022: schools 마스터 참조 제거 (Wilson 100% 수기 입력). students만 fetch.
  const { data } = await supabase
    .from("students")
    .select("id, name, age_range, major, preferred_region, photo_path")
    .order("updated_at", { ascending: false })
    .limit(500);

  const students = (data ?? []).map((s) => ({
    id: s.id,
    name: s.name?.trim() || "이름 미입력",
    summary: [s.age_range, s.major, s.preferred_region].filter(Boolean).join(" / "),
    preferred_region: s.preferred_region as string | null,
    photo_path: (s as { photo_path?: string | null }).photo_path ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link href="/admin/quotes" className="text-xs font-semibold text-navy-700 hover:text-gold-600">
          ← 견적서 목록으로
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-navy-900">
          + 신규 견적서 작성
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          학생 → 학교 1~3개 → AUD 항목 → KRW 항목 → 환율 → 자동 계산. PDF는 Phase 2.
        </p>
      </header>

      {students.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center text-sm text-ink-500">
          학생이 등록되어 있지 않습니다. 먼저 <Link href="/admin/students/new" className="underline">학생 등록</Link>부터 해주세요.
        </div>
      ) : (
        <QuoteForm
          mode="new"
          students={students}
          initialStudentId={sp.student}
        />
      )}
    </div>
  );
}
