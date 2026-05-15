// Tab 7: 결제 (Phase 2 / Step 2.3)
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PaymentsPanel, { type PaymentRow } from "./PaymentsPanel";

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const [studentRes, paymentsRes] = await Promise.all([
    supabase
      .from("students")
      .select("id, user_id, email")
      .eq("id", id)
      .single(),
    supabase
      .from("payments")
      .select(
        "id, payment_type, amount_krw, amount_aud, status, confirmed_at, refund_amount, refund_reason, note, created_at",
      )
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (studentRes.error || !studentRes.data) notFound();

  return (
    <PaymentsPanel
      studentId={id}
      studentHasUser={!!studentRes.data.user_id}
      studentHasEmail={!!studentRes.data.email}
      payments={(paymentsRes.data ?? []) as PaymentRow[]}
    />
  );
}
