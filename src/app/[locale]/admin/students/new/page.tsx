import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import NewStudentForm from "./NewStudentForm";

export default async function NewStudentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/admin/students"
          className="text-xs font-semibold text-navy-700 hover:text-gold-600"
        >
          ← 학생 목록으로
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-navy-900">
          + 신규 학생 등록
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          카톡으로 받은 학생 정보를 직접 입력. 이름만 필수, 나머지는 추후 채워도 OK.
        </p>
      </header>

      <NewStudentForm />
    </div>
  );
}
