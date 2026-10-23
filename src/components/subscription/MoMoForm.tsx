"use client";
import { useState } from "react";
import { BillingPlan } from "@/lib/billing/plans.config";
import { initMoMoPayment, verifyMoMo } from "@/lib/billing/billing-api";

export default function MoMoForm({ plan, provider }: { plan: BillingPlan; provider: "mtn" | "airtel" }) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [txRef, setTxRef] = useState("");

  const handlePay = async () => {
    if (!phone) return alert("Enter phone");
    const deviceId = localStorage.getItem("ugc_device_id") || "";
    setStatus("pending");
    const res = await initMoMoPayment(provider, plan.id, phone, deviceId);
    if (!res.txRef) {
      setStatus("failed");
      alert(res.error || "Failed to start MoMo");
      return;
    }
    setTxRef(res.txRef);
    const interval = setInterval(async () => {
      const v = await verifyMoMo(provider, res.txRef);
      if (v.status === "success") {
        clearInterval(interval);
        setStatus("success");
        alert("MoMo Payment success!");
        window.location.reload();
      }
      if (v.status === "failed") {
        clearInterval(interval);
        setStatus("failed");
      }
    }, 3000);
    setTimeout(() => clearInterval(interval), 120000);
  };

  return (
    <div className="momo-form">
      <div className="momo-label">Pay {plan.price_ugx.toLocaleString()} UGX with {provider.toUpperCase()}</div>
      <input className="momo-input" placeholder="0701234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button className="momo-pay-btn" onClick={handlePay} disabled={status === "pending"}>
        {status === "pending" ? "Check your phone for PIN prompt..." : "Pay with " + provider}
      </button>
      {status === "pending" && <div className="momo-hint">Enter your MoMo PIN on phone. Tx: {txRef}</div>}
    </div>
  );
}

