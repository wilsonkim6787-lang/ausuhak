// 케이스 학습 = 졸업생·실제 진행 케이스 학습. Phase 2 후속.

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
          케이스 학습 모듈은 Wilson이 졸업생 DB·실제 진행 케이스를 분석한 후 단계적으로 공개됩니다.
        </p>
        <p className="mt-3 text-xs text-ink-500">
          연관 데이터: 졸업생 DB (Phase 2) · 매뉴얼 (위) · activity_logs (Phase 3).
        </p>
      </div>
    </div>
  );
}
