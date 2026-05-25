// 학생 mypage 진행도 시각화 — 7단계 funnel (lead → pr).
// admin 의 lead_status 와 1:1 매핑. 학생 친화 라벨 사용 (lead/contacted 등 내부 용어 X).

type Step = {
  key: string;
  label: string;
  hint: string;
};

const STEPS: Step[] = [
  { key: "lead",      label: "첫 문의",   hint: "진단 완료 / 첫 카톡" },
  { key: "contacted", label: "상담 시작", hint: "1:1 상담 진행" },
  { key: "pro",       label: "진학 준비", hint: "학교·경로 확정" },
  { key: "contract",  label: "계약",      hint: "수속 결제·CoE" },
  { key: "visa",      label: "비자",      hint: "비자 신청·승인" },
  { key: "onsite",    label: "호주 도착", hint: "현지 정착" },
  { key: "pr",        label: "영주권",    hint: "PR 트랙" },
];

const NEXT_HINT: Record<string, string> = {
  lead:      "Wilson 카톡 상담 시작이 다음 step 입니다.",
  contacted: "학교·경로 확정 단계로 진행됩니다.",
  pro:       "계약·결제·CoE 발급 단계입니다.",
  contract:  "비자 신청·승인 단계입니다.",
  visa:      "호주 도착 후 정착이 다음입니다.",
  onsite:    "장기 진로·PR 트랙을 같이 짜갑니다.",
  pr:        "영주권 단계 — 축하드립니다!",
};

export default function LeadProgress({ leadStatus }: { leadStatus: string | null }) {
  const current = leadStatus ?? "lead";
  const currentIdx = Math.max(0, STEPS.findIndex((s) => s.key === current));
  const currentStep = STEPS[currentIdx] ?? STEPS[0];

  return (
    <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-navy-900">
          🛤️ 내 진행 단계
        </h2>
        <span className="text-xs text-ink-500">
          {currentIdx + 1} / {STEPS.length}
        </span>
      </div>

      {/* 노드 라인 */}
      <ol className="mt-5 grid grid-cols-7 gap-1.5">
        {STEPS.map((s, i) => {
          const past = i < currentIdx;
          const active = i === currentIdx;
          return (
            <li key={s.key} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition ${
                  active
                    ? "bg-gold-500 text-white ring-2 ring-gold-300 ring-offset-2 ring-offset-white"
                    : past
                      ? "bg-navy-900 text-gold-400"
                      : "bg-cream-200 text-ink-500"
                }`}
              >
                {i + 1}
              </div>
              <p
                className={`text-center text-[10px] leading-tight ${
                  active
                    ? "font-bold text-navy-900"
                    : past
                      ? "font-semibold text-navy-700"
                      : "text-ink-400"
                }`}
              >
                {s.label}
              </p>
            </li>
          );
        })}
      </ol>

      {/* progress bar (시각적 연결) */}
      <div className="relative mt-3 h-1 rounded-full bg-cream-200">
        <div
          className="absolute left-0 top-0 h-1 rounded-full bg-gold-500 transition-all"
          style={{
            width: `${((currentIdx + 0.5) / STEPS.length) * 100}%`,
          }}
        />
      </div>

      {/* 현재 단계 안내 */}
      <div className="mt-4 rounded-xl border border-gold-400/40 bg-gold-100/40 p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-gold-600">
          지금 단계
        </p>
        <p className="mt-1 text-base font-bold text-navy-900">
          {currentStep.label}
          <span className="ml-2 text-xs font-normal text-ink-500">— {currentStep.hint}</span>
        </p>
        <p className="mt-2 text-xs text-ink-700">{NEXT_HINT[current] ?? ""}</p>
      </div>
    </section>
  );
}
