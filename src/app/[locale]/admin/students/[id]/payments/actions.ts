"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/getUser";
import { logActivity } from "@/lib/audit/log";

export type PaymentActionState = {
  ok?: boolean;
  error?: string;
  // 결제 confirm 시 새 auth user를 만든 경우 — 학생에게 카톡으로 전달할 비번 재설정 URL
  recoveryUrl?: string;
};

const VALID_TYPES = ["pro_50k", "medical_300k", "full_consulting"] as const;
const DEFAULT_AMOUNTS: Record<(typeof VALID_TYPES)[number], number> = {
  pro_50k: 50_000,
  medical_300k: 300_000,
  full_consulting: 0, // Wilson이 별도 입력
};

function nullify(raw: FormDataEntryValue | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

// 결제 추가 (status='pending' / Wilson 추후 confirm)
export async function addPaymentAction(
  _prev: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한이 없습니다." };

  const studentId = String(formData.get("student_id") ?? "");
  const paymentType = String(formData.get("payment_type") ?? "");
  if (!studentId) return { error: "student_id 누락." };
  if (!VALID_TYPES.includes(paymentType as typeof VALID_TYPES[number])) {
    return { error: "결제 타입이 올바르지 않습니다." };
  }

  const amountRaw = nullify(formData.get("amount_krw"));
  const fallback = DEFAULT_AMOUNTS[paymentType as keyof typeof DEFAULT_AMOUNTS];
  const amountKrw = amountRaw ? parseInt(amountRaw, 10) : fallback || null;
  if (amountKrw != null && (isNaN(amountKrw) || amountKrw < 0)) {
    return { error: "금액이 올바르지 않습니다." };
  }
  const note = nullify(formData.get("note"));

  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({
    student_id: studentId,
    payment_type: paymentType,
    amount_krw: amountKrw,
    status: "pending",
    note,
  });
  if (error) return { error: `추가 실패: ${error.message}` };

  await logActivity({
    action_type: "create_payment",
    target_table: "payments",
    target_id: studentId,
    details: { payment_type: paymentType, amount_krw: amountKrw },
  });

  revalidatePath(`/admin/students/${studentId}/payments`);
  revalidatePath("/admin/payments");
  return { ok: true };
}

// 결제 확정 = status pending → confirmed.
// 1) confirmed_by / confirmed_at 기록
// 2) 학생 current_stage를 최소 2로 끌어올림 (결제 완료)
// 3) 학생 user_id가 NULL이고 email이 있으면 → admin API로 auth user 생성 + 링크
//    + recovery 링크 발급해서 Wilson이 카톡으로 학생에게 전달.
export async function confirmPaymentAction(
  _prev: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한이 없습니다." };

  const paymentId = String(formData.get("payment_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!paymentId || !studentId) return { error: "필수 ID 누락." };

  const supabase = await createClient();

  // 학생 상태 조회 (email / user_id / current_stage)
  const { data: student, error: stErr } = await supabase
    .from("students")
    .select("id, name, email, user_id, current_stage")
    .eq("id", studentId)
    .single();
  if (stErr || !student) return { error: `학생 조회 실패: ${stErr?.message}` };

  // 1) payments confirmed
  const { error: upErr } = await supabase
    .from("payments")
    .update({
      status: "confirmed",
      confirmed_by: user.id,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", paymentId);
  if (upErr) return { error: `확정 실패: ${upErr.message}` };

  // 2) 학생 stage ≥ 2
  if ((student.current_stage ?? 1) < 2) {
    await supabase
      .from("students")
      .update({
        current_stage: 2,
        lead_status: "pro",
        updated_at: new Date().toISOString(),
      })
      .eq("id", studentId);
  }

  // 3) 자동 회원가입 (user_id 미설정 + email 있음)
  let recoveryUrl: string | undefined;
  if (!student.user_id && student.email) {
    const admin = createAdminClient();

    // 중복 이메일 체크: 이미 auth.users에 있으면 그 id로 링크만 (case-insensitive)
    const { data: existingByEmail } = await admin
      .from("users")
      .select("id")
      .ilike("email", student.email)
      .maybeSingle();

    let authId: string | null = existingByEmail?.id ?? null;

    if (!authId) {
      const random = "ausuhak_" + crypto.randomUUID().slice(0, 16);
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email: student.email,
        password: random,
        email_confirm: true,
        user_metadata: { name: student.name ?? undefined },
      });
      if (cErr || !created.user) {
        return {
          ok: true,
          error: `결제는 확정되었으나 자동 회원가입 실패: ${cErr?.message}. 학생에게 직접 /signup 안내해주세요.`,
        };
      }
      authId = created.user.id;
    }

    // students.user_id 링크
    await admin
      .from("students")
      .update({ user_id: authId, updated_at: new Date().toISOString() })
      .eq("id", studentId);

    // 비밀번호 재설정 링크 발급 (학생이 본인 비번 설정)
    const { data: linkData } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: student.email,
    });
    recoveryUrl = linkData?.properties?.action_link ?? undefined;
  }

  await logActivity({
    action_type: "confirm_payment",
    target_table: "payments",
    target_id: paymentId,
    details: {
      student_id: studentId,
      auto_signup: !!recoveryUrl,
    },
  });

  revalidatePath(`/admin/students/${studentId}/payments`);
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/payments");
  return { ok: true, recoveryUrl };
}

// 환불
export async function refundPaymentAction(
  _prev: PaymentActionState,
  formData: FormData,
): Promise<PaymentActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return { error: "권한이 없습니다." };

  const paymentId = String(formData.get("payment_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!paymentId || !studentId) return { error: "필수 ID 누락." };

  const refundRaw = nullify(formData.get("refund_amount"));
  const refundAmount = refundRaw ? parseInt(refundRaw, 10) : null;
  const reason = nullify(formData.get("refund_reason"));

  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({
      status: "refunded",
      refund_amount: refundAmount,
      refund_reason: reason,
    })
    .eq("id", paymentId);
  if (error) return { error: `환불 처리 실패: ${error.message}` };

  await logActivity({
    action_type: "refund_payment",
    target_table: "payments",
    target_id: paymentId,
    details: {
      student_id: studentId,
      refund_amount: refundAmount,
      reason,
    },
  });

  revalidatePath(`/admin/students/${studentId}/payments`);
  revalidatePath("/admin/payments");
  return { ok: true };
}
