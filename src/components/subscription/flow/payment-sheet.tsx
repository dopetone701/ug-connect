"use client";
import React from "react";
import "./subscription-flow.css";
import { useSubscriptionFlow } from "@/stores/use-subscription-flow";
import PayPalBilling from "../billing/paypal";

type Props = { onClose: () => void };

export default function PaymentSheet({ onClose }: Props) {
  const { planId, method, back, goProcessing, goSuccess } = useSubscriptionFlow() as any;

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

        {/* PAYPAL WELL INJECTED HERE - wrapped in app */}
        <div className="flow-billing-inject">
          {method === "paypal" ? (
            <PayPalBilling
              planId={planId as any}
              onSuccess={() => {
                goSuccess?.();
                onClose();
              }}
              onClose={onClose}
              onError={(e) => console.error(e)}
            />
          ) : (
            <div className="billing-placeholder">
              <div className="billing-icon">💳</div>
              <h4>{String(method || "BILLING").toUpperCase()}</h4>
              <p>Pay {planId} securely</p>
              <button onClick={goProcessing} className="billing-submit">
                Submit {planId}
              </button>
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

