"use client";
import "./subscription-flow.css";
import { useSubscriptionFlow } from "@/stores/use-subscription-flow";

export default function SuccessSheet() {
  const { planId, closeAll } = useSubscriptionFlow();
  return (
    <>
      <div className="flow-overlay" onClick={closeAll} />
      <div className="flow-sheet slide-next">
        <div className="processing-box">
          <div style={{fontSize:40}}></div>
          <div className="flow-title">Subscribed!</div>
          <div className="flow-subtitle">{planId} active  Back to movie</div>
          <button onClick={closeAll} style={{marginTop:10, padding:10, width:"100%", background:"#fff", color:"#000", borderRadius:8, fontWeight:700, border:"none"}}>Continue Watching</button>
        </div>
      </div>
    </>
  );
}

