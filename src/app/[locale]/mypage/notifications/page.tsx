// 💬 메시지 — 학생 ↔ 담당팀 1:1 소통 채널.
// 열람 시 담당팀 메시지를 읽음 처리. 급한 건은 카카오 안내 유지.

import { requireStudent } from "@/lib/auth/requireStudent";
import { createAdminClient } from "@/lib/supabase/admin";
import SendBox from "./SendBox";
import { KAKAO_URL } from "@/lib/constants";


type MessageRow = {
  id: string;
  sender_role: "student" | "staff";
  body: string;
  created_at: string;
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

export default async function MypageMessagesPage() {
  const { student } = await requireStudent();

  let messages: MessageRow[] = [];
  let loadError = false;

  if (student.id) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("student_messages")
      .select("id, sender_role, body, created_at")
      .eq("student_id", student.id)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) {
      loadError = true;
    } else {
      messages = (data ?? []) as MessageRow[];
      // 담당팀 → 학생 메시지 읽음 처리
      await admin
        .from("student_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("student_id", student.id)
        .eq("sender_role", "staff")
        .is("read_at", null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">💬 메시지</h1>
        <p className="mt-1 text-sm text-ink-500">
          담당팀에게 궁금한 점을 남기면 확인 후 여기로 답변드립니다.
        </p>
      </div>

      <div className="rounded-2xl border border-cream-300 bg-white p-4 shadow-sm sm:p-5">
        {loadError ? (
          <p className="py-8 text-center text-sm text-ink-500">
            메시지함을 준비 중입니다. 급한 문의는 아래 카카오 채널을 이용해주세요.
          </p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-500">
            아직 주고받은 메시지가 없습니다. 첫 메시지를 남겨보세요!
          </p>
        ) : (
          <ul className="flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
            {messages.map((m) => {
              const mine = m.sender_role === "student";
              return (
                <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${mine ? "text-right" : "text-left"}`}>
                    {!mine && (
                      <p className="mb-0.5 text-[10px] font-bold text-gold-600">담당팀</p>
                    )}
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        mine
                          ? "rounded-br-md bg-navy-900 text-cream-100"
                          : "rounded-bl-md bg-cream-100 text-navy-900"
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

        <div className="mt-4 border-t border-cream-200 pt-4">
          <SendBox />
        </div>
      </div>

      <a
        href={KAKAO_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-kakao-source="mypage_messages"
        className="flex items-center justify-center gap-2 rounded-2xl bg-[#FEE500] px-4 py-3.5 text-sm font-bold text-[#3C1E1E] shadow-sm transition hover:brightness-95"
      >
        <span className="text-lg">💬</span> 급한 문의는 카카오톡으로
      </a>
    </div>
  );
}
