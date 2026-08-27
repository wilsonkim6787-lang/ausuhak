// 직원용 학생 메시지 스레드 — staff/students/[id] 하단 섹션.
// 열람 시 학생 발신 미읽음을 읽음 처리 (호출측 서버 페이지에서 수행).

import { sendStaffMessageAction } from "@/app/[locale]/staff/students/[id]/messagesActions";

export type StaffMessageRow = {
  id: string;
  sender_role: "student" | "staff";
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

export default function StudentMessagesSection({
  studentId,
  messages,
  loadError,
}: {
  studentId: string;
  messages: StaffMessageRow[];
  loadError?: string | null;
}) {
  return (
    <section
      id="messages"
      className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-navy-900">💬 학생과의 메시지</h2>
        <p className="text-[11px] text-ink-500">학생 마이페이지와 실시간 연동</p>
      </div>

      {loadError ? (
        <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
          메시지함 조회 실패: {loadError}
        </p>
      ) : messages.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-500">
          아직 메시지가 없습니다. 첫 안내를 보내보세요.
        </p>
      ) : (
        <ul className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto pr-1">
          {messages.map((m) => {
            const mine = m.sender_role === "staff";
            return (
              <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${mine ? "text-right" : "text-left"}`}>
                  <p className="mb-0.5 text-[10px] font-bold text-ink-500">
                    {mine ? "담당팀" : "학생"}
                    {mine && <span className="ml-1 font-normal">{m.read_at ? "· 읽음" : "· 안읽음"}</span>}
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
        action={sendStaffMessageAction}
        className="mt-4 flex items-end gap-2 border-t border-cream-200 pt-4"
      >
        <input type="hidden" name="student_id" value={studentId} />
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
  );
}
