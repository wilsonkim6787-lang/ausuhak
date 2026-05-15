// 매뉴얼 475 검색은 Phase 2 후속 (Wilson이 매뉴얼 콘텐츠를 채워야 함).
// 현재는 placeholder + 안내.

import Link from "next/link";
import { requireStaff } from "@/lib/auth/requireStaff";

export default async function StaffManualsPage() {
  await requireStaff();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy-900">📚 매뉴얼 475</h1>
        <p className="mt-1 text-sm text-ink-500">
          학력·전공·지역·주제별 케이스 매뉴얼. Wilson이 작성·승인 후 직원이 검색·참고.
        </p>
      </header>

      <div className="rounded-2xl border border-cream-300 bg-white p-6">
        <p className="text-sm text-ink-700">
          매뉴얼 콘텐츠는 Wilson의 19년 노하우 기반으로 점진적으로 추가됩니다. 현재 0건.
          내부 FAQ 84는 이미 작동하니{" "}
          <Link href="/staff/faqs" className="underline">
            내부 FAQ
          </Link>{" "}
          페이지를 참고해주세요.
        </p>
        <p className="mt-3 text-xs text-ink-500">
          예정 카테고리: 검정고시 / 고졸 / 대학재학 / 대졸 (학력) · 간호 / IT / 비즈니스 / 공학 / 의료 (분야) · 시드니 / 멜번 / 브리즈번 ... (지역) · PR / TAFE / 학교 / 비자 / 생활 (주제)
        </p>
      </div>
    </div>
  );
}
