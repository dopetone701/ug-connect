"use client";
import "./subscription-flow.css";
import { useSubscriptionFlow } from "@/stores/use-subscription-flow";

type Props = { onClose: () => void };

export default function MethodSheet({ onClose }: Props) {
  const { planId, selectMethod } = useSubscriptionFlow();
  const { back } = useSubscriptionFlow();
  return (
    <>
      <div className="flow-overlay" onClick={onClose} />
      <div className="flow-sheet">
        <div className="flow-header">
          <button className="flow-back" onClick={back}>Back</button>
          <button className="flow-close" onClick={onClose}>X</button>
        </div>
        <div className="flow-title">Choose payment method</div>
        <div className="flow-subtitle">Plan: {planId}</div>
        <div className="method-grid">
          <button className="method-card" onClick={() => selectMethod("mtn")}><div><strong>MTN MoMo</strong></div><span>-</span></button>
          <button className="method-card" onClick={() => selectMethod("airtel")}><div><strong>Airtel Money</strong></div><span>-</span></button>
          <button className="method-card" onClick={() => selectMethod("paypal")}><div><strong>PayPal</strong></div><span>-</span></button>
          <button className="method-card" onClick={() => selectMethod("card")}><div><strong>Card</strong></div><span>-</span></button>
        </div>
      </div>
    </>
  );
}

