"use server";

// 공개 상담 신청 접수 — 비로그인 방문자용이라 service role 로 INSERT.
// (RLS 에 익명 INSERT 정책을 열지 않고 서버에서만 쓰기 — 스팸·남용 통제 용이)

import { createAdminClient } from "@/lib/supabase/admin";

export type ConsultState = { ok?: boolean; error?: string };

const TOPICS = [
  "어학연수",
  "전문학교·TAFE",
  "대학·대학원",
  "조기유학",
  "워홀 후 진학",
  "의대",
  "기타",
] as const;

export async function submitConsultAction(
  _prev: ConsultState,
  formData: FormData,
): Promise<ConsultState> {
  // 허니팟 — 봇이 채우는 숨은 필드
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { ok: true }; // 봇에게는 성공한 척
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 50);
  const contact = String(formData.get("contact") ?? "").trim().slice(0, 80);
  const topicRaw = String(formData.get("topic") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim().slice(0, 1000);
  const source = String(formData.get("source") ?? "web").trim().slice(0, 30);
  const agreed = formData.get("agree") === "on";

  if (name.length < 2) return { error: "이름을 2자 이상 입력해주세요." };
  if (contact.length < 5) return { error: "연락처(전화번호 또는 카카오톡 ID)를 입력해주세요." };
  if (!agreed) return { error: "개인정보 수집·이용에 동의해주세요." };
  const topic = (TOPICS as readonly string[]).includes(topicRaw) ? topicRaw : "기타";

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("consult_requests").insert({
      name,
      contact,
      topic,
      message: message || null,
      source: source || "web",
    });
    if (error) throw new Error(error.message);
  } catch {
    return {
      error:
        "접수 시스템에 일시적인 문제가 있습니다. 카카오 채널 또는 전화(010-9848-7789)로 문의해주세요.",
    };
  }

  return { ok: true };
}
