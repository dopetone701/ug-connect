"use client";
import { useEffect } from "react";
import "./subscription-flow.css";
import { useSubscriptionFlow } from "@/stores/use-subscription-flow";

export default function ProcessingSheet() {
  const { goSuccess, planId, method } = useSubscriptionFlow();

  useEffect(() => {
    // TODO: Replace with real verification
    // For now simulate 3s processing then go to success
    // Later: if PayPal capture fails -> flow.goFailed()
    const t = setTimeout(() => {
      goSuccess();
    }, 3000);
    return () => clearTimeout(t);
  }, [goSuccess]);

  return (
    <>
      <div className="flow-overlay" />
      <div className="flow-sheet slide-next">
        <div className="processing-box">
          <div className="spinner" />
          <div className="flow-title">Processing...</div>
          <div className="flow-subtitle">Confirming {planId}  {method?.toUpperCase()}</div>
          <div style={{fontSize:12, opacity:0.5, textAlign:"center"}}>
            Please do not close. Invoice will be sent to your inbox in background after confirmation.
          </div>
        </div>
      </div>
    </>
  );
}

