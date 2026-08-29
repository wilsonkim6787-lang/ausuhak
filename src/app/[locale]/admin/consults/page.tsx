// 📥 상담 신청 접수함 — 공개 /consult 폼 접수 처리. admin/layout 이 가드.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fmtYmdHm } from "@/lib/utils/dates";
import {
  updateConsultStatusAction,
  saveConsultMemoAction,
  deleteConsultAction,
} from "./actions";

type ConsultRow = {
  id: string;
  name: string;
  contact: string;
  topic: string | null;
  message: string | null;
  source: string | null;
  status: string;
  admin_memo: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  new: "🆕 신규",
  contacted: "☎️ 연락완료",
  closed: "✅ 종료",
};

// 서버(UTC)에서 로컬 시간으로 그리면 9시간 어긋남 → KST 고정 헬퍼 사용
const fmtDate = fmtYmdHm;

const isPhone = (c: string) => /^[\d\s\-+()]{9,}$/.test(c.trim());

export default async function AdminConsultsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; err?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let q = supabase
    .from("consult_requests")
    .select("id, name, contact, topic, message, source, status, admin_memo, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (sp.status && ["new", "contacted", "closed"].includes(sp.status)) {
    q = q.eq("status", sp.status);
  }
  const { data, error } = await q;
  const rows = (data ?? []) as ConsultRow[];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy-900">📥 상담 신청 접수함</h1>
        <p className="mt-1 text-sm text-ink-500">
          공개 /consult 폼으로 들어온 신청. 연락 후 상태를 바꿔 관리하세요.
        </p>
      </header>

      {error && (
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          <p className="font-semibold">조회 실패</p>
          <p className="mt-2 font-mono text-xs">{error.message}</p>
          <p className="mt-3 text-xs text-ink-700">
            migration 045 (consult_requests 테이블) 미적용 가능성. Supabase SQL Editor 에서
            <code className="mx-1">supabase/migrations/045_consult_requests.sql</code>
            을 실행하세요.
          </p>
        </div>
      )}

      {sp.err && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">⚠️ {sp.err}</p>
      )}
      {sp.ok && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">✅ 처리됨</p>
      )}

      <nav className="flex flex-wrap gap-2 text-xs">
        {[
          [undefined, "전체"],
          ["new", "🆕 신규"],
          ["contacted", "☎️ 연락완료"],
          ["closed", "✅ 종료"],
        ].map(([s, label]) => {
          const active = sp.status === s || (!sp.status && s === undefined);
          return (
            <Link
              key={label as string}
              href={s ? `/admin/consults?status=${s}` : "/admin/consults"}
              className={`rounded-full px-3.5 py-1.5 font-semibold transition ${
                active
                  ? "bg-navy-900 text-cream-100"
                  : "border border-cream-300 bg-white text-navy-700 hover:border-gold-600"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {!error && rows.length === 0 && (
        <p className="rounded-2xl border-2 border-dashed border-cream-300 bg-white p-10 text-center text-sm text-ink-500">
          {sp.status ? "해당 상태의 신청이 없습니다." : "아직 접수된 상담 신청이 없습니다."}
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className={`rounded-2xl border bg-white p-4 shadow-sm ${
              r.status === "new" ? "border-gold-600/60" : "border-cream-300"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-base font-bold text-navy-900">{r.name}</span>
                {isPhone(r.contact) ? (
                  <a
                    href={`tel:${r.contact.replace(/[^\d+]/g, "")}`}
                    className="rounded-full bg-navy-900 px-2.5 py-0.5 text-[11px] font-bold text-gold-400"
                  >
                    📞 {r.contact}
                  </a>
                ) : (
                  <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-bold text-navy-700">
                    💬 {r.contact}
                  </span>
                )}
                {r.topic && (
                  <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold text-gold-600">
                    {r.topic}
                  </span>
                )}
                {r.source && r.source !== "web" && (
                  <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] text-ink-500">
                    유입: {r.source}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-semibold text-ink-500">{STATUS_LABELS[r.status] ?? r.status}</span>
                <span className="font-mono text-ink-500">{fmtDate(r.created_at)}</span>
              </div>
            </div>

            {r.message && (
              <p className="mt-2 whitespace-pre-wrap rounded-lg bg-cream-100/60 px-3 py-2 text-sm leading-relaxed text-ink-700">
                {r.message}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-cream-200 pt-3">
              {r.status !== "contacted" && (
                <form action={updateConsultStatusAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="contacted" />
                  <button className="rounded-full border border-navy-900 px-3 py-1 text-[11px] font-semibold text-navy-900 hover:bg-navy-900 hover:text-cream-100">
                    ☎️ 연락완료 처리
                  </button>
                </form>
              )}
              {r.status !== "closed" && (
                <form action={updateConsultStatusAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="closed" />
                  <button className="rounded-full border border-cream-300 px-3 py-1 text-[11px] font-semibold text-ink-700 hover:bg-cream-100">
                    ✅ 종료
                  </button>
                </form>
              )}
              {r.status !== "new" && (
                <form action={updateConsultStatusAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="new" />
                  <button className="rounded-full border border-cream-300 px-3 py-1 text-[11px] text-ink-500 hover:bg-cream-100">
                    🆕 신규로 되돌리기
                  </button>
                </form>
              )}

              <form action={saveConsultMemoAction} className="flex min-w-0 flex-1 items-center gap-1.5">
                <input type="hidden" name="id" value={r.id} />
                <input
                  name="admin_memo"
                  defaultValue={r.admin_memo ?? ""}
                  placeholder="처리 메모 (내부용)"
                  className="min-w-0 flex-1 rounded-md border border-cream-300 px-2 py-1 text-xs"
                />
                <button className="rounded-md bg-cream-200 px-2.5 py-1 text-[11px] font-semibold text-navy-700 hover:bg-cream-300">
                  저장
                </button>
              </form>

              <form action={deleteConsultAction}>
                <input type="hidden" name="id" value={r.id} />
                <button className="text-[11px] text-error hover:underline">🗑️</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
