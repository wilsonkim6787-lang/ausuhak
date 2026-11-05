"use client";
import { useEffect } from "react";

// Gives the generated medical exam pages one function to buy a mock set:
// window.ausuhakBuy(exam, mockId) -> creates the order on the server, then opens the Toss Payments window.
declare global {
  interface Window {
    ausuhakBuy?: (exam: string, mockId: string) => Promise<void>;
    TossPayments?: (clientKey: string) => {
      payment: (o: { customerKey: string }) => { requestPayment: (o: Record<string, unknown>) => Promise<void> };
    };
  }
}

const SDK = "https://js.tosspayments.com/v2/standard";

function loadSdk(): Promise<void> {
  if (window.TossPayments) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SDK;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("sdk"));
    document.head.appendChild(s);
  });
}

export default function PayBridge() {
  useEffect(() => {
    window.ausuhakBuy = async (exam: string, mockId: string) => {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        location.href = "/medical/services";
        return;
      }
      const res = await fetch("/api/pay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam, mockId }),
      });
      if (res.status === 401) {
        location.href = "/login?next=" + encodeURIComponent(location.pathname);
        return;
      }
      if (res.status === 409) {
        location.reload();
        return;
      }
      if (!res.ok) {
        location.href = "/medical/services";
        return;
      }
      const o = await res.json();
      await loadSdk();
      const payment = window.TossPayments!(clientKey).payment({ customerKey: o.customerKey });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: o.amount },
        orderId: o.orderId,
        orderName: o.orderName,
        successUrl: location.origin + "/medical/pay/success",
        failUrl: location.origin + "/medical/pay/fail",
        customerEmail: o.customerEmail,
        customerName: o.customerName,
      });
    };
    return () => {
      delete window.ausuhakBuy;
    };
  }, []);
  return null;
}
