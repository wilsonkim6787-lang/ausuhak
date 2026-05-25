// 📢 카톡 광고 — 캠페인 + UTM source_tag → students.source 매칭 전환 카운트.

import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { upsertCampaignAction, deleteCampaignAction } from "./actions";

type Campaign = {
  id: string;
  name: string;
  source_tag: string;
  start_date: string | null;
  end_date: string | null;
  budget_krw: number;
  spent_krw: number;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type StudentBySource = { source: string | null; current_stage: number };

export default async function AdminAdsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edit?: string; new?: string; err?: string; ok?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  const [campRes, studentsRes] = await Promise.all([
    supabase
      .from("ad_campaigns")
      .select("id, name, source_tag, start_date, end_date, budget_krw, spent_krw, note, status, created_at, updated_at")
      .order("status")
      .order("start_date", { ascending: false }),
    supabase
      .from("students")
      .select("source, current_stage")
      .limit(5000),
  ]);

  if (campRes.error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl font-bold text-navy-900">📢 카톡 광고</h1>
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          <p className="font-semibold">조회 실패</p>
          <p className="mt-2 font-mono text-xs">{campRes.error.message}</p>
          <p className="mt-3 text-xs text-ink-700">
            migration 033 (ad_campaigns 테이블) 미적용 가능성.
          </p>
        </div>
      </div>
    );
  }

  const campaigns = (campRes.data ?? []) as Campaign[];
  const students = (studentsRes.data ?? []) as StudentBySource[];

  // source_tag 별 학생·전환 카운트
  const studentsBySource = new Map<string, { total: number; paid: number }>();
  for (const s of students) {
    if (!s.source) continue;
    const cur = studentsBySource.get(s.source) ?? { total: 0, paid: 0 };
    cur.total += 1;
    if (s.current_stage >= 2) cur.paid += 1; // Stage 2+ = 결제 완료
    studentsBySource.set(s.source, cur);
  }

  let editing: Campaign | null = null;
  if (sp.edit) {
    const found = campaigns.find((c) => c.id === sp.edit);
    if (!found) notFound();
    editing = found;
  }

  // 총합 통계 (active 캠페인만)
  const active = campaigns.filter((c) => c.status === "active");
  const totalBudget = active.reduce((a, c) => a + c.budget_krw, 0);
  const totalSpent = active.reduce((a, c) => a + c.spent_krw, 0);
  const totalConversions = active.reduce(
    (a, c) => a + (studentsBySource.get(c.source_tag)?.paid ?? 0),
    0,
  );
  const cac = totalConversions > 0 ? Math.round(totalSpent / totalConversions) : null;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          마케팅 · 카톡 광고
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">
          📢 카톡 광고 캠페인
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          캠페인 {campaigns.length}개 · 진행 중 {active.length}개. source_tag 가 학생 가입 시 source 와 매칭 → 전환 자동 카운트.
        </p>
      </header>

      {sp.err && <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">⚠️ {sp.err}</p>}
      {sp.ok && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">✅ 저장됨</p>}

      {/* 통계 — 진행 중 캠페인 합산 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="진행 중 예산" value={`₩${totalBudget.toLocaleString("ko-KR")}`} />
        <Stat label="실제 집행" value={`₩${totalSpent.toLocaleString("ko-KR")}`} />
        <Stat
          label="전환 (Stage 2+)"
          value={totalConversions.toString()}
          highlight={totalConversions > 0}
        />
        <Stat
          label="고객 획득 비용 (CAC)"
          value={cac != null ? `₩${cac.toLocaleString("ko-KR")}` : "—"}
          sub="실집행 ÷ 전환"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* 리스트 */}
        <section className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-navy-900">총 {campaigns.length}개</p>
            <Link
              href="/admin/ads?new=1"
              className="rounded-full bg-gold-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-gold-500"
            >
              + 신규 캠페인
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">— 캠페인 없음. 우상단 + 신규.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {campaigns.map((c) => {
                const active = sp.edit === c.id;
                const stats = studentsBySource.get(c.source_tag) ?? { total: 0, paid: 0 };
                const ccac = c.spent_krw > 0 && stats.paid > 0
                  ? Math.round(c.spent_krw / stats.paid)
                  : null;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/admin/ads?edit=${c.id}`}
                      className={`block rounded-xl border p-3 transition hover:shadow-md ${
                        active ? "border-gold-500 ring-2 ring-gold-500/30" : "border-cream-300 bg-cream-100/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-display text-sm font-bold text-navy-900">
                          {c.name}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="mt-0.5 font-mono text-[10px] text-ink-500">
                        source: {c.source_tag}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-navy-700">
                        <span>유입 {stats.total}명</span>
                        <span>전환 <strong>{stats.paid}</strong>명</span>
                        <span>집행 ₩{c.spent_krw.toLocaleString("ko-KR")}</span>
                        {ccac != null && (
                          <span>CAC ₩{ccac.toLocaleString("ko-KR")}</span>
                        )}
                      </div>
                      {(c.start_date || c.end_date) && (
                        <p className="mt-1 text-[10px] text-ink-500">
                          {c.start_date ?? "—"} ~ {c.end_date ?? "—"}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 편집 폼 */}
        <section className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
          {!editing && !sp.new ? (
            <p className="text-sm text-ink-500">← 캠페인 선택 또는 + 신규</p>
          ) : (
            <CampaignForm key={editing?.id ?? "new"} editing={editing} />
          )}
        </section>
      </div>

      {/* source 사용 가이드 */}
      <section className="rounded-2xl border border-cream-300 bg-cream-100/40 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
          source_tag 활용
        </p>
        <p className="mt-2 text-sm text-ink-700">
          학생 가입 시 students.source 컬럼에 같은 값을 넣으면 자동 전환 카운트됩니다.
          현재 사용 중인 source 값들:
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Array.from(studentsBySource.keys())
            .sort()
            .map((src) => {
              const matched = campaigns.find((c) => c.source_tag === src);
              return (
                <span
                  key={src}
                  className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${
                    matched
                      ? "bg-success/15 text-success"
                      : "bg-cream-200 text-ink-700"
                  }`}
                  title={matched ? `매칭: ${matched.name}` : "캠페인 미연결"}
                >
                  {src} ({studentsBySource.get(src)?.total ?? 0})
                </span>
              );
            })}
          {studentsBySource.size === 0 && (
            <span className="text-xs text-ink-500">— 아직 source 가 박힌 학생 없음</span>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label, value, sub, highlight,
}: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${
      highlight ? "border-gold-600/30 bg-gold-100/40" : "border-cream-300 bg-white"
    }`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-navy-900">{value}</p>
      {sub && <p className="text-[10px] text-ink-500">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    active: { bg: "bg-success/15", fg: "text-success", label: "🟢 active" },
    paused: { bg: "bg-warning/20", fg: "text-warning", label: "⏸ paused" },
    ended:  { bg: "bg-cream-300", fg: "text-ink-700", label: "🏁 ended" },
  };
  const s = map[status] ?? map.active;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.bg} ${s.fg}`}>
      {s.label}
    </span>
  );
}

function CampaignForm({ editing }: { editing: Campaign | null }) {
  const isNew = !editing;
  return (
    <div className="flex flex-col gap-3">
      <form action={upsertCampaignAction} className="flex flex-col gap-3">
        {editing && <input type="hidden" name="id" value={editing.id} />}

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">캠페인명 *</span>
          <input
            name="name"
            required
            defaultValue={editing?.name ?? ""}
            placeholder="예: 2026 봄 카톡 광고 (의대 트랙)"
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">
            source_tag * (소문자·숫자·_-)
          </span>
          <input
            name="source_tag"
            required
            defaultValue={editing?.source_tag ?? ""}
            placeholder="예: kakao_ad_spring2026"
            pattern="[a-z0-9_-]+"
            className="rounded-md border border-cream-300 px-2 py-1 font-mono text-xs"
          />
          <span className="text-[10px] text-ink-500">
            학생 가입 시 students.source 와 매칭됨
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">시작일</span>
            <input
              type="date"
              name="start_date"
              defaultValue={editing?.start_date ?? ""}
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">종료일</span>
            <input
              type="date"
              name="end_date"
              defaultValue={editing?.end_date ?? ""}
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">예산 (KRW)</span>
            <input
              type="number"
              name="budget_krw"
              defaultValue={editing?.budget_krw != null ? String(editing.budget_krw) : "0"}
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-900">실제 집행 (KRW)</span>
            <input
              type="number"
              name="spent_krw"
              defaultValue={editing?.spent_krw != null ? String(editing.spent_krw) : "0"}
              className="rounded-md border border-cream-300 px-2 py-1 text-sm"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">메모 (선택)</span>
          <textarea
            name="note"
            rows={2}
            defaultValue={editing?.note ?? ""}
            placeholder="대상 학생 / 채널 / 크리에이티브 등"
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-navy-900">상태</span>
          <select
            name="status"
            defaultValue={editing?.status ?? "active"}
            className="rounded-md border border-cream-300 px-2 py-1 text-sm"
          >
            <option value="active">🟢 active</option>
            <option value="paused">⏸ paused</option>
            <option value="ended">🏁 ended</option>
          </select>
        </label>

        <div className="flex justify-end">
          <Button type="submit" size="sm">
            {isNew ? "+ 추가" : "저장"}
          </Button>
        </div>
      </form>

      {!isNew && editing && (
        <form action={deleteCampaignAction} className="flex justify-end border-t border-cream-200 pt-2">
          <input type="hidden" name="id" value={editing.id} />
          <button type="submit" className="text-[11px] text-error hover:underline">
            🗑️ 이 캠페인 삭제
          </button>
        </form>
      )}
    </div>
  );
}
