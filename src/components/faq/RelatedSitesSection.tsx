import sitesData from "@/data/monitoring-sites.json";

interface Site {
  sheet: string;
  section: string;
  category: string;
  name: string;
  url: string;
  description: string;
  display_order: number;
}

const data = sitesData as { sites: Site[] };

// FAQ 카테고리 index → monitoring_sites sheet 이름 매핑.
// 빈 배열 = 매칭 사이트 없음 (섹션 안 그림).
const CATEGORY_TO_SHEETS: Record<number, string[]> = {
  0: ["1.호주 한인사이트", "11.실용팁"], // 처음 시작할 때
  1: ["6.생활정보", "7.연봉정보"], // 학비와 생활비
  2: ["2.호주 대학교", "3.대학부속 컬리지", "4.사립 컬리지"], // 학교 고르기
  3: ["2.호주 대학교"], // 간호·의대·약대
  4: ["8.구직사이트", "11.실용팁"], // 요리·트레이드
  5: ["8.구직사이트", "7.연봉정보", "9.이력서·면접"], // IT·경영·교육
  6: ["10.PR·취업비자"], // 비자와 영주권
  7: ["6.생활정보", "5.호주 관광청"], // 호주에서의 일상
  8: ["1.호주 한인사이트", "6.생활정보"], // 가족·특별한 상황
  9: [], // 상담 받기 — 카톡 push 전용
};

const SHEET_LABEL: Record<string, string> = {
  "1.호주 한인사이트": "한인 사이트",
  "2.호주 대학교": "호주 대학교",
  "3.대학부속 컬리지": "대학부속 컬리지",
  "4.사립 컬리지": "사립 컬리지",
  "5.호주 관광청": "관광청",
  "6.생활정보": "생활 정보",
  "7.연봉정보": "연봉 정보",
  "8.구직사이트": "구직",
  "9.이력서·면접": "이력서·면접",
  "10.PR·취업비자": "PR · 취업비자",
  "11.실용팁": "실용팁",
};

const MAX_PER_SHEET = 8;

export default function RelatedSitesSection({
  categoryIdx,
}: {
  categoryIdx: number;
}) {
  const sheets = CATEGORY_TO_SHEETS[categoryIdx] ?? [];
  if (sheets.length === 0) return null;

  const grouped = sheets
    .map((sheet) => {
      const items = data.sites
        .filter((s) => s.sheet === sheet && s.url)
        .slice(0, MAX_PER_SHEET);
      return { sheet, label: SHEET_LABEL[sheet] ?? sheet, items };
    })
    .filter((g) => g.items.length > 0);

  if (grouped.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-baseline gap-2 border-b-2 border-gold-600 pb-2">
        <span aria-hidden className="text-xl">📚</span>
        <h2 className="font-display text-xl font-bold text-navy-900 sm:text-2xl">
          Wilson 큐레이션 참고 사이트
        </h2>
        <span className="text-xs text-ink-500">
          공식·신뢰 출처 모음
        </span>
      </div>

      <div className="space-y-6">
        {grouped.map((g) => (
          <div key={g.sheet}>
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-gold-600">
              {g.label}
              <span className="opacity-70">{g.items.length}</span>
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {g.items.map((s, i) => (
                <li key={`${s.sheet}-${i}`}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col gap-1 rounded-xl border border-cream-300 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-gold-600/50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-navy-900 group-hover:text-gold-600">
                        {s.name}
                      </span>
                      <span
                        aria-hidden
                        className="shrink-0 text-xs text-gold-600 transition group-hover:translate-x-0.5"
                      >
                        ↗
                      </span>
                    </div>
                    {s.description && (
                      <p className="line-clamp-2 text-xs text-ink-500">
                        {s.description}
                      </p>
                    )}
                    {s.category && s.category !== s.section && (
                      <span className="mt-auto inline-block w-fit rounded-full bg-cream-200 px-2 py-0.5 text-[10px] text-navy-700">
                        {s.category}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center text-[11px] text-ink-500">
        Wilson 19년 컨설팅 활용 참고 사이트 모음 · 외부 링크는 새 탭으로 열림
      </p>
    </section>
  );
}
