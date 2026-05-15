"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  addPaymentAction,
  confirmPaymentAction,
  refundPaymentAction,
  type PaymentActionState,
} from "./actions";

export type PaymentRow = {
  id: string;
  payment_type: string;
  amount_krw: number | null;
  amount_aud: number | null;
  status: string | null;
  confirmed_at: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  note: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  pro_50k: "PRO ₩50,000",
  medical_300k: "의대 ₩300,000",
  full_consulting: "풀 컨설팅",
};

const initial: PaymentActionState = {};

export default function PaymentsPanel({
  studentId,
  studentHasUser,
  studentHasEmail,
  payments,
}: {
  studentId: string;
  studentHasUser: boolean;
  studentHasEmail: boolean;
  payments: PaymentRow[];
}) {
  const [addState, addAction, addPending] = useActionState(addPaymentAction, initial);

  return (
    <div className="flex flex-col gap-5">
      {/* + 결제 추가 */}
      <section className="rounded-2xl border border-cream-300 bg-white p-6 shadow-sm">
        <h2 className="font-display text-base font-bold text-navy-900">+ 결제 추가 (수동)</h2>
        <p className="mt-1 text-xs text-ink-500">
          학생이 입금하면 Wilson이 카톡에서 입금 확인 후 여기에 등록.
          status는 일단 <code className="rounded bg-cream-200 px-1">pending</code>으로 들어가고,
          입금 확인되면 [확정] 버튼을 누릅니다.
        </p>

        <form action={addAction} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="student_id" value={studentId} />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">결제 타입</span>
            <select
              name="payment_type"
              required
              defaultValue="pro_50k"
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
            >
              <option value="pro_50k">PRO ₩50,000</option>
              <option value="medical_300k">의대 ₩300,000</option>
              <option value="full_consulting">풀 컨설팅 (금액 직접 입력)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">
              금액 (KRW) <span className="font-normal text-ink-500">(비우면 타입 기본값)</span>
            </span>
            <input
              type="number"
              name="amount_krw"
              min={0}
              placeholder="예: 50000"
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-navy-700">메모 (선택)</span>
            <input
              type="text"
              name="note"
              placeholder="입금자명 / 분할 / 환불 안내 등"
              className="rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500"
            />
          </label>

          {addState.error && (
            <p className="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{addState.error}</p>
          )}
          {addState.ok && (
            <p className="rounded-lg bg-success/10 px-3 py-2 text-xs text-success">결제 추가됨.</p>
          )}

          <Button type="submit" disabled={addPending} className="self-start">
            {addPending ? "추가 중…" : "💾 결제 등록"}
          </Button>
        </form>
      </section>

      {/* 결제 목록 */}
      <section>
        <h2 className="mb-3 font-display text-base font-bold text-navy-900">결제 내역</h2>
        {payments.length === 0 ? (
          <p className="rounded-xl border border-cream-300 bg-cream-100/40 px-4 py-6 text-center text-sm text-ink-500">
            등록된 결제가 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {payments.map((p) => (
              <PaymentRowItem
                key={p.id}
                studentId={studentId}
                studentHasUser={studentHasUser}
                studentHasEmail={studentHasEmail}
                payment={p}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PaymentRowItem({
  studentId,
  studentHasUser,
  studentHasEmail,
  payment,
}: {
  studentId: string;
  studentHasUser: boolean;
  studentHasEmail: boolean;
  payment: PaymentRow;
}) {
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmPaymentAction,
    initial,
  );
  const [refundState, refundAction, refundPending] = useActionState(
    refundPaymentAction,
    initial,
  );
  const [showRefund, setShowRefund] = useState(false);

  const recovery = confirmState.recoveryUrl;
  const isPending = payment.status === "pending";
  const isConfirmed = payment.status === "confirmed";
  const isRefunded = payment.status === "refunded";

  return (
    <li className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-base font-semibold text-navy-900">
          {TYPE_LABEL[payment.payment_type] ?? payment.payment_type}
        </p>
        <StatusBadge status={payment.status} />
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-ink-700">
        {payment.amount_krw != null && (
          <span className="font-semibold text-navy-900">
            ₩{payment.amount_krw.toLocaleString("ko-KR")}
          </span>
        )}
        {payment.amount_aud != null && (
          <span className="text-xs text-ink-500">
            A${payment.amount_aud.toLocaleString("en-AU")} AUD
          </span>
        )}
        <span className="ml-auto text-xs text-ink-500">
          {new Date(payment.created_at).toLocaleDateString("ko-KR")}
        </span>
      </div>

      {payment.note && (
        <p className="mt-2 rounded-lg bg-cream-100 px-3 py-1.5 text-xs text-ink-700">
          📝 {payment.note}
        </p>
      )}

      {isRefunded && (
        <div className="mt-3 rounded-lg border border-error/20 bg-error/5 p-3 text-xs">
          <p className="font-semibold text-error">환불 처리됨</p>
          {payment.refund_amount != null && (
            <p className="mt-0.5 text-ink-700">
              환불 금액: ₩{payment.refund_amount.toLocaleString("ko-KR")}
            </p>
          )}
          {payment.refund_reason && (
            <p className="mt-0.5 text-ink-700">사유: {payment.refund_reason}</p>
          )}
        </div>
      )}

      {isConfirmed && payment.confirmed_at && (
        <p className="mt-2 text-xs text-success">
          ✓ 입금 확인: {new Date(payment.confirmed_at).toLocaleString("ko-KR")}
        </p>
      )}

      {/* 액션 영역 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isPending && (
          <form action={confirmAction}>
            <input type="hidden" name="payment_id" value={payment.id} />
            <input type="hidden" name="student_id" value={studentId} />
            <Button type="submit" size="sm" disabled={confirmPending}>
              {confirmPending ? "확정 중…" : "✓ 입금 확인 (확정)"}
            </Button>
          </form>
        )}

        {(isPending || isConfirmed) && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setShowRefund((v) => !v)}
          >
            {showRefund ? "환불 취소" : "환불 처리"}
          </Button>
        )}
      </div>

      {confirmState.error && (
        <p className="mt-2 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
          {confirmState.error}
        </p>
      )}

      {confirmState.ok && !studentHasUser && !recovery && studentHasEmail && (
        <p className="mt-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          자동 회원가입은 됐지만 recovery 링크 발급 실패. Supabase Dashboard → Authentication → Users 확인.
        </p>
      )}

      {recovery && (
        <div className="mt-3 rounded-lg border border-gold-600/30 bg-gold-100 p-3 text-xs">
          <p className="mb-1.5 font-semibold text-navy-900">
            🎉 자동 회원가입 완료. 학생에게 비번 설정 링크 전달:
          </p>
          <input
            type="text"
            readOnly
            value={recovery}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded border border-cream-300 bg-white px-2 py-1.5 text-[10px] text-navy-900"
          />
          <p className="mt-1.5 text-ink-700">
            카톡으로 이 URL을 학생에게 보내주세요. 학생이 클릭하면 비밀번호 설정 후 /mypage 진입.
          </p>
        </div>
      )}

      {!studentHasEmail && !studentHasUser && isPending && (
        <p className="mt-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          ⚠️ 학생 email이 비어있어 자동 회원가입 X. 기본 정보 탭에서 email 입력 후 확정 권장.
        </p>
      )}

      {/* 환불 폼 */}
      {showRefund && (isPending || isConfirmed) && (
        <form action={refundAction} className="mt-3 flex flex-col gap-2 rounded-xl bg-cream-100 p-3">
          <input type="hidden" name="payment_id" value={payment.id} />
          <input type="hidden" name="student_id" value={studentId} />
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-700">환불 금액 (KRW)</span>
            <input
              type="number"
              name="refund_amount"
              min={0}
              defaultValue={payment.amount_krw ?? ""}
              className="rounded border border-cream-300 bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-navy-700">사유</span>
            <input
              type="text"
              name="refund_reason"
              placeholder="학생 요청 / 케이스 차단 등"
              className="rounded border border-cream-300 bg-white px-2 py-1.5 text-sm"
            />
          </label>
          {refundState.error && (
            <p className="rounded-lg bg-error/10 px-2 py-1.5 text-xs text-error">
              {refundState.error}
            </p>
          )}
          <Button type="submit" size="sm" variant="danger" disabled={refundPending}>
            {refundPending ? "처리 중…" : "환불 확정"}
          </Button>
        </form>
      )}
    </li>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending: { bg: "bg-gold-100", fg: "text-gold-600", label: "pending" },
    confirmed: { bg: "bg-success/15", fg: "text-success", label: "confirmed" },
    refunded: { bg: "bg-error/15", fg: "text-error", label: "refunded" },
    cancelled: { bg: "bg-cream-300", fg: "text-ink-700", label: "cancelled" },
  };
  const s = map[status ?? ""] ?? map.pending;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.bg} ${s.fg}`}>
      {s.label}
    </span>
  );
}
