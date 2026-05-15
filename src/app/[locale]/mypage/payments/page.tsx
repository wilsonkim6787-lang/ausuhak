import { createClient } from "@/lib/supabase/server";
import { requireStudent } from "@/lib/auth/requireStudent";

type PaymentRow = {
  id: string;
  payment_type: string;
  amount_krw: number | null;
  status: string | null;
  confirmed_at: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<string, string> = {
  pro_50k: "PRO 컨설팅",
  medical_300k: "의대 패키지",
  full_consulting: "풀 컨설팅",
};

const KAKAO_URL = "https://pf.kakao.com/_GadTX";

export default async function MypagePaymentsPage() {
  const { student } = await requireStudent();
  const supabase = await createClient();

  const { data } = student.id
    ? await supabase
        .from("payments")
        .select(
          "id, payment_type, amount_krw, status, confirmed_at, refund_amount, refund_reason, created_at",
        )
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
    : { data: [] as PaymentRow[] };

  const payments = (data ?? []) as PaymentRow[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">💳 결제 내역</h1>
        <p className="mt-1 text-sm text-ink-500">
          Wilson이 카톡으로 입금 확인한 결제 내역이 여기에 표시됩니다.
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-2xl border border-cream-300 bg-white p-6 text-sm">
          <p className="mb-3 text-ink-700">
            아직 결제 내역이 없습니다. PRO 컨설팅 ₩50,000 또는 의대 패키지 ₩300,000 결제는
            Wilson 카톡 상담 후 안내드린 계좌로 입금해주시면 자동으로 여기에 표시됩니다.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
            <li>· 일반 PRO 컨설팅: ₩50,000</li>
            <li>· 의대 패키지: ₩300,000 (ISAT 200문제 + MMI 40 시나리오)</li>
            <li>· 풀 컨설팅: Wilson 직접 안내</li>
          </ul>
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-kakao-source="mypage_payments_empty"
            className="mt-5 inline-flex rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gold-500"
          >
            💬 결제 안내 받기
          </a>
        </div>
      ) : (
        <ul className="space-y-3">
          {payments.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-cream-300 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display text-base font-semibold text-navy-900">
                  {TYPE_LABEL[p.payment_type] ?? p.payment_type}
                </p>
                <StatusBadge status={p.status} />
              </div>

              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                {p.amount_krw != null && (
                  <span className="font-semibold text-navy-900">
                    ₩{p.amount_krw.toLocaleString("ko-KR")}
                  </span>
                )}
                <span className="ml-auto text-xs text-ink-500">
                  {new Date(p.created_at).toLocaleDateString("ko-KR")}
                </span>
              </div>

              {p.status === "confirmed" && p.confirmed_at && (
                <p className="mt-2 text-xs text-success">
                  ✓ 입금 확인: {new Date(p.confirmed_at).toLocaleDateString("ko-KR")}
                </p>
              )}

              {p.status === "refunded" && (
                <div className="mt-2 rounded-lg border border-error/20 bg-error/5 p-3 text-xs">
                  <p className="font-semibold text-error">환불 처리됨</p>
                  {p.refund_amount != null && (
                    <p className="mt-0.5 text-ink-700">
                      환불 금액: ₩{p.refund_amount.toLocaleString("ko-KR")}
                    </p>
                  )}
                  {p.refund_reason && (
                    <p className="mt-0.5 text-ink-700">사유: {p.refund_reason}</p>
                  )}
                </div>
              )}

              {p.status === "pending" && (
                <p className="mt-2 rounded-lg bg-gold-100 px-3 py-2 text-xs text-navy-700">
                  ⏳ 입금 확인 대기 중. Wilson이 카톡에서 입금 확인 후 자동 업데이트됩니다.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending: { bg: "bg-gold-100", fg: "text-gold-600", label: "입금 대기" },
    confirmed: { bg: "bg-success/15", fg: "text-success", label: "확정" },
    refunded: { bg: "bg-error/15", fg: "text-error", label: "환불됨" },
    cancelled: { bg: "bg-cream-300", fg: "text-ink-700", label: "취소" },
  };
  const s = map[status ?? ""] ?? map.pending;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${s.bg} ${s.fg}`}>
      {s.label}
    </span>
  );
}
