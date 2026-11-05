import Link from "next/link";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { EXAM_NAME, type Exam } from "@/lib/medpay";
import SiteShell from "@/components/SiteShell";

export const metadata = { title: { absolute: "결제 확인 - AusUhak(호주유학)" }, robots: { index: false } };
export const dynamic = "force-dynamic";

type Order = { order_id: string; user_id: string; exam: Exam; mock_id: string; amount: number; status: string };

// Toss Payments sends the buyer here after card approval. The payment is only final once confirmed below.
async function confirm(sp: Record<string, string | undefined>) {
  const { paymentKey, orderId, amount } = sp;
  if (!paymentKey || !orderId || !amount) return { ok: false, msg: "결제 정보가 없습니다." };
  const { user } = await getSession();
  const admin = adminClient();
  if (!user || !admin) return { ok: false, msg: "로그인한 뒤 다시 확인해 주세요." };
  const { data } = await admin.from("mock_orders").select("*").eq("order_id", orderId).maybeSingle();
  const o = data as Order | null;
  if (!o || o.user_id !== user.id) return { ok: false, msg: "주문을 찾을 수 없습니다." };
  if (o.status === "paid") return { ok: true, o };
  if (Number(amount) !== o.amount) return { ok: false, msg: "결제 금액이 주문과 다릅니다. 결제는 진행되지 않았습니다." };

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from((process.env.TOSS_SECRET_KEY || "") + ":").toString("base64"),
      "Content-Type": "application/json",
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({ paymentKey, orderId, amount: o.amount }),
    cache: "no-store",
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    await admin.from("mock_orders").update({ status: "failed", fail_reason: String(j.code || res.status) }).eq("order_id", orderId);
    return { ok: false, msg: j.message || "결제 승인에 실패했습니다." };
  }
  await admin.from("mock_orders").update({ status: "paid", payment_key: paymentKey, method: j.method || null, paid_at: new Date().toISOString() }).eq("order_id", orderId);
  return { ok: true, o };
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const r = await confirm(await searchParams);
  const back = r.ok && r.o?.exam === "ucat" ? "/medical/ucat-mock" : "/medical/isat-mock";
  return (
    <SiteShell>
      <div className="ux-wrap" style={{ maxWidth: 640 }}>
        <h1 className="ux-h1">{r.ok ? "결제가 끝났습니다" : "결제를 마치지 못했습니다"}</h1>
        <p className="ux-lead">
          {r.ok && r.o
            ? `${EXAM_NAME[r.o.exam]} 실전 모의고사 ${Number(r.o.mock_id.slice(-2))}회가 열렸습니다. 같은 계정으로 로그인하면 언제든 다시 풀 수 있습니다.`
            : r.msg}
        </p>
        <Link className="ux-btn ux-btn-p" href={back}>모의고사로 돌아가기</Link>
      </div>
    </SiteShell>
  );
}
