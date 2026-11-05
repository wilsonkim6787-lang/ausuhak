import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { getSession } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { EXAM_NAME, MOCKS, SET_PRICE, ownedSets, payEnabled, type Exam } from "@/lib/medpay";

// Creates a pending order for one mock set. The amount is fixed here, never taken from the browser.
export async function POST(req: NextRequest) {
  if (!payEnabled()) return NextResponse.json({ error: "disabled" }, { status: 503 });
  const { user, profile } = await getSession();
  if (!user) return NextResponse.json({ error: "login" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const exam = String(body.exam) as Exam;
  const mockId = String(body.mockId);
  if (!MOCKS[exam] || !MOCKS[exam][mockId]) return NextResponse.json({ error: "bad_set" }, { status: 400 });
  if (profile?.role === "admin") return NextResponse.json({ error: "admin_has_all" }, { status: 400 });
  const owned = await ownedSets(user.id);
  if (owned[exam][mockId]) return NextResponse.json({ error: "owned" }, { status: 409 });

  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "disabled" }, { status: 503 });
  const orderId = "AU" + Date.now().toString(36) + randomBytes(6).toString("hex");
  const orderName = `${EXAM_NAME[exam]} 실전 모의고사 ${Number(mockId.slice(-2))}회`;
  const { error } = await admin.from("mock_orders").insert({
    order_id: orderId, user_id: user.id, exam, mock_id: mockId, amount: SET_PRICE, status: "pending",
  });
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({
    orderId, orderName, amount: SET_PRICE, customerKey: user.id,
    customerEmail: user.email || undefined, customerName: profile?.name || undefined,
  });
}
