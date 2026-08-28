// 학생 상세 — 메시지 탭. 학생 마이페이지(💬 메시지)와 실시간 연동.
// 열람 시 학생 발신 메시지를 읽음 처리.

import { createClient } from "@/lib/supabase/server";
import { sendAdminMessageAction } from "./actions";

type MessageRow = {
  id: string;
  sender_role: "student" | "staff";
  sender_id: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

export default async function StudentMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  // 최신 300개를 가져온 뒤(오래된 순 limit 이면 스레드가 길 때 최신 메시지가 잘려
  // 안 보였음) 화면 표시용으로 다시 오래된→최신 순으로 뒤집는다.
  const { data, error } = await supabase
    .from("student_messages")
    .select("id, sender_role, sender_id, body, read_at, created_at")
    .eq("student_id", id)
    .order("created_at", { ascending: false })
    .limit(300);
  const messages = ((data ?? []) as MessageRow[]).slice().reverse();

  // 학생 발신 미읽음 → 읽음 처리
  if (!error && messages.some((m) => m.sender_role === "student" && !m.read_at)) {
    await supabase
      .from("student_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("student_id", id)
      .eq("sender_role", "student")
      .is("read_at", null);
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          <p className="font-semibold">메시지함 조회 실패</p>
          <p className="mt-1 font-mono text-xs">{error.message}</p>
          <p className="mt-2 text-xs text-ink-700">
            migration 046 (student_messages) 미적용 가능성 — Supabase SQL Editor 에서
            <code className="mx-1">046_cleanup_and_messages.sql</code> 실행.
          </p>
        </div>
      )}
      {sp.err && (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">⚠️ {sp.err}</p>
      )}

      <section className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-navy-900">💬 학생과의 메시지</h2>
          <p className="text-[11px] text-ink-500">
            보낸 메시지는 학생 마이페이지 &gt; 메시지에 표시됩니다
          </p>
        </div>

        {!error && messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-500">
            아직 메시지가 없습니다. 첫 안내 메시지를 보내보세요.
          </p>
        ) : (
          <ul className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1">
            {messages.map((m) => {
              const mine = m.sender_role === "staff";
              return (
                <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${mine ? "text-right" : "text-left"}`}>
                    <p className="mb-0.5 text-[10px] font-bold text-ink-500">
                      {mine ? "담당팀" : "학생"}
                      {mine && (
                        <span className="ml-1 font-normal">
                          {m.read_at ? "· 읽음" : "· 안읽음"}
                        </span>
                      )}
                    </p>
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        mine
                          ? "rounded-br-md bg-navy-900 text-cream-100"
                          : "rounded-bl-md bg-gold-100/70 text-navy-900"
                      }`}
                    >
                      {m.body}
                    </div>
                    <p className="mt-1 text-[10px] text-ink-500">{fmtTime(m.created_at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form
          action={sendAdminMessageAction}
          className="mt-4 flex items-end gap-2 border-t border-cream-200 pt-4"
        >
          <input type="hidden" name="student_id" value={id} />
          <textarea
            name="body"
            rows={2}
            required
            maxLength={2000}
            placeholder="학생에게 보낼 안내·답변을 입력하세요."
            className="min-h-[52px] flex-1 resize-y rounded-xl border border-cream-300 bg-cream-100 px-3.5 py-2.5 text-sm outline-none focus:border-gold-500"
          />
          <button
            type="submit"
            className="h-[52px] shrink-0 rounded-xl bg-gold-600 px-5 text-sm font-bold text-white transition hover:bg-gold-500"
          >
            보내기
          </button>
        </form>
      </section>
    </div>
  );
}
