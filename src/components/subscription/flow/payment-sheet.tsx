"use client";
import "./subscription-flow.css";
import { useSubscriptionFlow } from "@/stores/use-subscription-flow";

type Props = { onClose: () => void };

export default function PaymentSheet({ onClose }: Props) {
  const { planId, method, back, goProcessing } = useSubscriptionFlow();
  return (
    <>
      <div className="flow-overlay" onClick={onClose} />
      <div className="flow-sheet slide-next">
        <div className="flow-header">
          <button className="flow-back" onClick={back}>Back</button>
          <button className="flow-close" onClick={onClose}>X</button>
        </div>
        <div className="flow-title">Pay {planId}</div>
        <div className="flow-subtitle">Method: {method}</div>
        <div style={{padding:20, background:"#1a1a1a", borderRadius:12, textAlign:"center"}}>
          <div>[ EMPTY ] UI for {method}</div>
          <button onClick={goProcessing} style={{marginTop:20, width:"100%", padding:12, background:"#fff", color:"#000", borderRadius:8, fontWeight:700, border:"none"}}>Submit</button>
        </div>
      </div>
    </>
  );
}

