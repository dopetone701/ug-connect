"use client";
import React from "react";
import "./subscription-flow.css";
import { useSubscriptionFlow } from "@/stores/use-subscription-flow";
import PayPalBilling from "../billing/paypal";
import MtnMomo from "../billing/mtn-momo";

type Props = { onClose: () => void };

export default function PaymentSheet({ onClose }: Props) {
  const { planId, method, back, goSuccess } = useSubscriptionFlow() as any;

  return (
    <>
      <div className="flow-overlay" onClick={onClose} />
      <div className="flow-sheet slide-next">
        <div className="flow-header">
          <button className="flow-back" onClick={back}>Back</button>
          <button className="flow-close" onClick={onClose}>X</button>
        </div>

        <div className="flow-title-wrap">
          <div className="flow-title-badge">{String(planId || "").toUpperCase()} PLAN</div>
          <div className="flow-title">Pay {planId}</div>
          <div className="flow-subtitle">Method: <b>{method}</b> • Secure payment</div>
        </div>

        <div className="flow-billing-inject">
          {method === "paypal" ? (
            <PayPalBilling planId={planId as any} onSuccess={(sub) => goSuccess?.(sub)} onClose={onClose} onError={(e) => console.error(e)} />
          ) : method === "mtn" || method === "mtn-momo" || method === "momo" ? (
            <MtnMomo planId={planId as any} onSuccess={(sub) => goSuccess?.(sub)} onError={(e) => console.error(e)} />
          ) : (
            <div className="billing-placeholder">
              <div className="billing-icon">💳</div>
              <h4>{String(method || "BILLING").toUpperCase()}</h4>
              <p>Pay {planId} securely</p>
              <button onClick={onClose} className="billing-submit">Close</button>
            </div>
          )}
        </div>

        <div className="flow-trust">
          <span>🔒 Encrypted</span><span>•</span><span>Instant</span><span>•</span><span>Cancel anytime</span>
        </div>
      </div>
    </>
  );
}

