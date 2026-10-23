"use client";
import "./subscription-flow.css";
import { useSubscriptionFlow } from "@/stores/use-subscription-flow";

type Props = { onClose: () => void };

export default function FailedSheet({ onClose }: Props) {
  const { planId, method, selectMethod } = useSubscriptionFlow();
  const retry = () => {
    if (method) selectMethod(method);
  };
  return (
    <>
      <div className="flow-overlay" onClick={onClose} />
      <div className="flow-sheet slide-next">
        <div className="flow-header">
          <button className="flow-close" onClick={onClose}>X</button>
        </div>
        <div className="processing-box">
          <div style={{fontSize:40}}>X</div>
          <div className="flow-title">Payment Failed</div>
          <div className="flow-subtitle">Plan: {planId} Method: {method}</div>
          <div style={{display:"flex", gap:10, width:"100%", marginTop:16}}>
            <button onClick={onClose} style={{flex:1, padding:12, background:"#222", color:"#fff", borderRadius:8, border:"1px solid #333"}}>Cancel</button>
            <button onClick={retry} style={{flex:1, padding:12, background:"#fff", color:"#000", borderRadius:8, fontWeight:700, border:"none"}}>Retry</button>
          </div>
        </div>
      </div>
    </>
  );
}

