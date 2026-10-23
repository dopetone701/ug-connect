"use client";
import { useEffect, useRef, useState } from "react";
import { BillingPlan } from "@/lib/billing/plans.config";
import { createPayPalOrder, verifyPayPalOrder } from "@/lib/billing/billing-api";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalButton({ plan }: { plan: BillingPlan }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existing) {
      renderButton();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.paypal.com/sdk/js?client-id=AcIG3Zri-l-saUXVNYbG9642YpO8fP9Q&currency=USD";
    script.onload = () => renderButton();
    document.body.appendChild(script);
  }, [plan]);

  const renderButton = () => {
    if (!window.paypal || !ref.current) return;
    ref.current.innerHTML = "";
    window.paypal
      .Buttons({
        createOrder: async () => {
          const deviceId = localStorage.getItem("ugc_device_id") || "";
          const data = await createPayPalOrder(plan.id, deviceId);
          return data.orderId;
        },
        onApprove: async (data: any) => {
          setLoading(true);
          const deviceId = localStorage.getItem("ugc_device_id") || "";
          const res = await verifyPayPalOrder(data.orderID, deviceId);
          setLoading(false);
          if (res.success) {
            alert("Subscription active!");
            window.location.reload();
          } else {
            alert("Payment failed: " + (res.error || "unknown"));
          }
        },
        onError: (err: any) => {
          console.error(err);
          alert("PayPal error");
        }
      })
      .render(ref.current);
  };

  return (
    <div>
      {loading && <div>Verifying...</div>}
      <div ref={ref} />
    </div>
  );
}

