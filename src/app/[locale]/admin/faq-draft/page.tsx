import { setRequestLocale } from "next-intl/server";
import { renderAnswer } from "@/components/faq/answerRenderer";
import schoolsDraft from "@/data/wilson-faqs-draft-schools.json";
import majorsScenariosDraft from "@/data/wilson-faqs-draft-majors-scenarios.json";

interface DraftItem {
  q: string;
  a: string;
}

interface DraftCategory {
  icon: string;
  name: string;
  items: DraftItem[];
}

interface DraftFile {
  _meta?: Record<string, string>;
  categories: DraftCategory[];
}

export default async function FaqDraftPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allCategories: DraftCategory[] = [
    ...(schoolsDraft as DraftFile).categories,
    ...(majorsScenariosDraft as DraftFile).categories,
  ];

  let globalIdx = 0;
  const totalCount = allCategories.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold text-navy-900">
          🆕 FAQ Draft 검토
        </h1>
        <p className="text-sm text-ink-700">
          Wilson 검수 전용. 라이브 노출 X. 총 <strong>{totalCount}개</strong> 항목.
        </p>
        <div className="rounded-xl border border-cream-300 bg-cream-100/60 px-4 py-3 text-xs text-ink-700">
          <p className="mb-1.5 font-semibold text-navy-900">검토 방법</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>모든 항목 Q + A 풀어서 보임 — 실제 /faq 렌더링 그대로</li>
            <li>각 항목 좌상단 번호 (#1 ~ #{totalCount}) 로 메시지 가능</li>
            <li>예: <span className="rounded bg-white px-1.5 py-0.5 font-mono">&ldquo;#32 답변 이렇게 고쳐&rdquo;</span> · <span className="rounded bg-white px-1.5 py-0.5 font-mono">&ldquo;#47 빼&rdquo;</span></li>
            <li>검토 끝나면 <span className="rounded bg-white px-1.5 py-0.5 font-mono">&ldquo;머지해&rdquo;</span> — 살아남은 항목 wilson-faqs.json 으로 이전 + draft 파일 삭제</li>
          </ul>
        </div>
      </header>

      {allCategories.map((cat, ci) => (
        <section key={ci} className="space-y-4">
          <div className="flex items-baseline gap-3 border-b-2 border-gold-600 pb-2">
            <span className="text-2xl">{cat.icon}</span>
            <h2 className="font-display text-xl font-bold text-navy-900">
              {cat.name}
            </h2>
            <span className="text-xs text-ink-500">
              {cat.items.length}개
            </span>
          </div>
          <ul className="space-y-4">
            {cat.items.map((it) => {
              globalIdx += 1;
              const num = globalIdx;
              return (
                <li
                  key={num}
                  className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-12 shrink-0 items-center justify-center rounded-full bg-gold-100 font-mono text-xs font-bold text-gold-600">
                      #{num}
                    </span>
                    <h3 className="flex-1 text-base font-semibold text-navy-900 sm:text-lg">
                      {it.q}
                    </h3>
                  </div>
                  <div className="rounded-xl bg-cream-100/40 px-4 py-4 sm:px-5 sm:py-5">
                    {renderAnswer(it.a)}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
