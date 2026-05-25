// 케이스 학습 = 합격증·후기·졸업생까지 /offers 갤러리에 통합. 이 페이지는 redirect 안내.

import Link from "next/link";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function StaffCasesPage() {
  await requireStaff();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy-900">🧠 케이스 학습</h1>
        <p className="mt-1 text-sm text-ink-500">
          최신 실제 진행 케이스 + 졸업생 케이스 학습 자료.
        </p>
      </header>

      <div className="rounded-2xl border border-cream-300 bg-white p-6 text-sm text-ink-700">
        <p>
          합격증·학생 후기·졸업생 케이스는{" "}
          <Link href="/offers" className="font-semibold text-gold-600 hover:underline">
            /offers 갤러리
          </Link>
          에 통합되어 있습니다. 각 카드 상세에서 학생 배경·합격 과정·졸업/진로까지 확인하세요.
        </p>
      </div>
    </div>
  );
}
