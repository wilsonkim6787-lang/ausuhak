// 카드 7장 (PART F-3)
// 1=학교 / 2=지역 / 3=경로 / 4=전공 / 5=비자&PR / 6=Wilson 추천 / 7=다음 액션

import type { Cards as CardsT, AppliedBlock } from "@/lib/matching";

function CardShell({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-gold-400">
          {num}
        </span>
        <h2 className="font-display text-lg font-semibold text-navy-900 sm:text-xl">
          {title}
        </h2>
      </div>
      <div className="text-sm leading-relaxed text-ink-700 sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export function BlocksBanner({ hard, soft }: { hard: AppliedBlock[]; soft: AppliedBlock[] }) {
  if (hard.length === 0 && soft.length === 0) return null;
  return (
    <div className="space-y-3">
      {hard.map((b) => (
        <div key={b.rule_id} className="rounded-xl border border-error/30 bg-error/5 p-4">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-wider text-error">
            <span>🚫 차단 (HARD)</span>
            <span className="rounded bg-error/10 px-1.5 py-0.5">{b.rule_id}</span>
          </div>
          <p className="font-semibold text-navy-900">{b.title}</p>
          <p className="mt-1 text-sm text-ink-700">{b.message}</p>
          {b.alternative && (
            <p className="mt-2 text-sm text-navy-700">
              <strong>대안:</strong> {b.alternative}
            </p>
          )}
        </div>
      ))}
      {soft.map((b) => (
        <div key={b.rule_id} className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <div className="mb-1 flex items-center gap-2 text-xs font-bold tracking-wider text-warning">
            <span>⚠️ 주의 (SOFT)</span>
            <span className="rounded bg-warning/10 px-1.5 py-0.5">{b.rule_id}</span>
          </div>
          <p className="font-semibold text-navy-900">{b.title}</p>
          <p className="mt-1 text-sm text-ink-700">{b.message}</p>
          {b.alternative && (
            <p className="mt-2 text-sm text-navy-700">
              <strong>대안:</strong> {b.alternative}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function SchoolRow({ s }: { s: import("@/lib/matching").SchoolPick }) {
  return (
    <li className="rounded-xl border border-cream-200 bg-cream-100/40 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-navy-900">{s.name}</h3>
        <div className="flex items-center gap-1.5 text-xs text-ink-500">
          {s.qs && <span className="rounded bg-navy-900/5 px-1.5 py-0.5 text-navy-700">QS {s.qs}</span>}
          {s.city && <span>· {s.city}</span>}
          {s.state && <span>({s.state})</span>}
        </div>
      </div>
      <p className="mt-1 text-xs text-gold-600">{s.reason}</p>
      {s.programs.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-ink-700">
          {s.programs.map((p, idx) => (
            <li key={idx} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-medium text-navy-900">· {p.name}</span>
              {p.ielts != null && <span>IELTS {String(p.ielts)}</span>}
              {p.tuition != null && <span>· {String(p.tuition)}</span>}
              {p.pr_cat && <span className="rounded bg-success/10 px-1 text-success">PR: {p.pr_cat}</span>}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function PathHeader({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="inline-flex size-6 items-center justify-center rounded-md bg-gold-100 text-xs font-bold text-gold-600">
        {label}
      </span>
      <h3 className="font-display text-base font-semibold text-navy-900">{sub}</h3>
    </div>
  );
}

export function Card1Schools({ data }: { data: CardsT["card1_schools"] }) {
  const dual = data.show_dual_path === true;
  const directEmpty = data.items.length === 0;
  const pathwayEmpty = !data.pathway_items || data.pathway_items.length === 0;

  return (
    <CardShell num={1} title={data.title}>
      {directEmpty && pathwayEmpty ? (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
          <p className="mb-1.5 text-xs font-bold tracking-wider text-warning">
            ⚠️ 이 지역 학교 적음
          </p>
          <p className="text-ink-700">
            {data.empty_message ?? "선호 지역에서 해당 전공 코스를 운영하는 정본 학교가 적습니다. 1:1 카톡 상담에서 다른 지역 옵션을 함께 검토해드립니다."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* 경로 A: 학사 직접 입학 */}
          <div>
            {dual && <PathHeader label="A" sub="학사 직접 입학 (내신 상위 + 영어 충족)" />}
            {directEmpty ? (
              <p className="rounded-lg border border-cream-200 bg-cream-100/40 px-3 py-2 text-xs text-ink-500">
                이 지역 + 전공 조합에 학사 직접 진학 가능한 정본 학교가 적습니다.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.items.map((s) => <SchoolRow key={s.id} s={s} />)}
              </ul>
            )}
          </div>

          {/* 경로 B: Pathway 경유 (Foundation/Diploma) — 고졸/검정고시만 */}
          {dual && (
            <div className="border-t border-cream-300 pt-5">
              <PathHeader label="B" sub="Pathway 경유 (Foundation/Diploma → 학사)" />
              {pathwayEmpty ? (
                <p className="rounded-lg border border-cream-200 bg-cream-100/40 px-3 py-2 text-xs text-ink-500">
                  이 지역에 Foundation/Diploma 정본 학교가 적습니다.
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.pathway_items!.map((s) => <SchoolRow key={s.id} s={s} />)}
                </ul>
              )}
            </div>
          )}

          {/* 두 경로 비교 메시지 */}
          {dual && data.pathway_note && (
            <p className="rounded-lg bg-navy-900/5 px-3 py-2.5 text-xs text-navy-700">
              💡 {data.pathway_note}
            </p>
          )}

          {/* 마무리 — 정확한 경로는 카톡 상담 */}
          {data.consultation_note && (
            <p className="rounded-lg bg-gold-100 px-3 py-2.5 text-xs font-medium text-gold-600">
              🎯 {data.consultation_note}
            </p>
          )}
        </div>
      )}
    </CardShell>
  );
}

export function Card2Region({ data }: { data: CardsT["card2_region"] }) {
  return (
    <CardShell num={2} title={`${data.title}: ${data.region}`}>
      <div className="whitespace-pre-line">{data.description}</div>
    </CardShell>
  );
}

export function Card3Pathway({ data }: { data: CardsT["card3_pathway"] }) {
  const p = data.plan;
  return (
    <CardShell num={3} title={data.title}>
      <p className="mb-3 font-semibold text-navy-900">{p.pathway}</p>
      <ol className="mb-3 space-y-1.5">
        {p.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-100 text-[11px] font-bold text-gold-600">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-ink-500">
        예상 소요: {p.duration_years_min === p.duration_years_max
          ? `${p.duration_years_min}년`
          : `${p.duration_years_min}~${p.duration_years_max}년`}
      </p>
    </CardShell>
  );
}

export function Card4Major({ data }: { data: CardsT["card4_major"] }) {
  return (
    <CardShell num={4} title={`${data.title}: ${data.major}`}>
      <div className="whitespace-pre-line">{data.description}</div>
      {data.pr_info && (
        <p className="mt-3 rounded-lg bg-success/5 px-3 py-2 text-xs text-success">
          <strong>PR 경로:</strong> {data.pr_info}
        </p>
      )}
    </CardShell>
  );
}

export function Card5Visa({ data }: { data: CardsT["card5_visa_pr"] }) {
  return (
    <CardShell num={5} title={data.title}>
      <p className="mb-2 font-semibold text-navy-900">{data.visa}</p>
      <p className="mb-2 text-xs font-bold tracking-wider text-gold-600">졸업 후 경로</p>
      <ul className="space-y-1">
        {data.pr_paths.map((path, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-gold-600">→</span>
            <span>{path}</span>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

export function Card6Wilson({ data }: { data: CardsT["card6_wilson"] }) {
  return (
    <section className="rounded-2xl border border-navy-800/20 bg-navy-900 p-5 text-cream-100 shadow-md sm:p-6">
      <div className="mb-3 flex items-center gap-3">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-gold-600 text-sm font-bold text-navy-900">
          6
        </span>
        <h2 className="font-display text-lg font-semibold sm:text-xl">{data.title}</h2>
      </div>
      <blockquote className="mb-3 border-l-2 border-gold-400 pl-3 text-sm italic text-cream-200">
        &ldquo;{data.quote}&rdquo;
      </blockquote>
      <p className="whitespace-pre-line text-sm leading-relaxed text-cream-100/90">
        {data.recommendation}
      </p>
      <p className="mt-3 text-xs text-gold-400">— Wilson Kim · 호주 유학 19년 · QEAC E240</p>
    </section>
  );
}

export function Card7Next({ data, kakaoUrl }: { data: CardsT["card7_next"]; kakaoUrl: string }) {
  return (
    <CardShell num={7} title={data.title}>
      <div className="space-y-2.5">
        {data.actions.map((a, i) => {
          const isKakao = a.kind === "kakao";
          const href = isKakao ? kakaoUrl : "#";
          return (
            <a
              key={i}
              href={href}
              target={isKakao ? "_blank" : undefined}
              rel={isKakao ? "noopener noreferrer" : undefined}
              className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                isKakao
                  ? "border-gold-600 bg-gold-600 text-white hover:bg-gold-500"
                  : "border-cream-300 bg-white text-navy-900 hover:border-navy-800/40"
              }`}
            >
              <span>{a.label}</span>
              <span>→</span>
            </a>
          );
        })}
      </div>
    </CardShell>
  );
}
