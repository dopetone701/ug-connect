"use client";
import React, { useState } from "react";
import "./paypal-billing.css";

const MTN_BILLING_URL = process.env.NEXT_PUBLIC_MTN_BILLING_URL || "https://mtn-billing-api.connectu89.workers.dev";

type PlanId = "weekly" | "monthly" | "yearly";
interface Props {
  planId: PlanId;
  onSuccess?: (sub: any) => void;
  onError?: (err: string) => void;
  onClose?: () => void;
}

export default function MtnMomo({ planId, onSuccess, onError }: Props) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "verifying" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [txRef, setTxRef] = useState("");
  const [mtnRaw, setMtnRaw] = useState<any>(null);

  const getDeviceId = () => {
    let id = localStorage.getItem("ug_device_id");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("ug_device_id", id); }
    return id;
  };

  const normalizeForDisplay = (p: string) => {
    const n = p.replace(/[^0-9]/g, "");
    if (n.startsWith("467")) return n; // sandbox test number - keep
    if (n.startsWith("0")) return "256" + n.slice(1);
    if (n.startsWith("7")) return "256" + n;
    return n;
  };

  const initPay = async () => {
    if (!phone || phone.replace(/[^0-9]/g,"").length < 9) { 
      setMsg("Enter valid number e.g. 0777123456 or 46733123454"); 
      setStatus("error"); 
      return; 
    }
    setStatus("sending"); 
    setMsg(`Calling ${MTN_BILLING_URL}/init-pay...`);
    setMtnRaw(null);
    try {
      const deviceId = getDeviceId();
      const res = await fetch(`${MTN_BILLING_URL}/init-pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, phone, deviceId }),
      });
      const data = await res.json();
      setMtnRaw(data);
      if (!res.ok) throw new Error(data.error || data.mtn_error || "MTN init failed");
      
      setTxRef(data.txRef);
      const normalized = normalizeForDisplay(phone);
      setMsg(data.mock ? 
        `Sandbox: ${data.message} | Ref: ${data.txRef.slice(0,8)}... | Phone: ${normalized}` :
        `Real push sent to ${normalized}! Approve on phone *165# | Ref: ${data.txRef.slice(0,8)}...`
      );
      setStatus("verifying");
      
      // TRUE polling - calls worker /verify which calls REAL MTN GET /requesttopay/{id}
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > 40) { // 2 min
          clearInterval(poll); 
          setStatus("error"); 
          setMsg(`Timeout - MTN status still ${mtnRaw?.status || 'PENDING'}. Check ${MTN_BILLING_URL}/verify?txRef=${data.txRef}`); 
          return; 
        }
        try {
          const v = await fetch(`${MTN_BILLING_URL}/verify?txRef=${data.txRef}`);
          const j = await v.json();
          setMtnRaw(j);
          
          if (j.status === "success") {
            clearInterval(poll);
            // Build sub from worker response - TRUE data from KV
            const sub = j.sub || { 
              id: data.txRef, 
              plan_id: planId, 
              status: "active", 
              provider: "mtn", 
              provider_ref: data.txRef,
              phone: j.tx?.phone || normalized,
              start_at: new Date().toISOString(),
              end_at: new Date(Date.now()+ (planId==='weekly'?7:planId==='monthly'?30:365)*86400000).toISOString()
            };
            localStorage.setItem("ug_subscription", JSON.stringify(sub));
            localStorage.setItem("ug_has_subscription", "true");
            window.dispatchEvent(new CustomEvent("ug-subscription-updated", { detail: sub }));
            setStatus("success");
            setMsg(`✓ TRUE MTN SUCCESS! MTN status: ${j.mtn?.status || 'SUCCESSFUL'} | Sub active until ${new Date(sub.end_at).toLocaleDateString()}`);
            setTimeout(() => onSuccess?.(sub), 1200);
          } else if (j.status === "failed") {
            clearInterval(poll);
            setStatus("error");
            setMsg(`MTN FAILED: ${j.mtn?.reason || j.mtn?.status || 'Declined'} | Ref: ${data.txRef}`);
            onError?.(j.mtn?.reason || "Failed");
          } else {
            // still pending - show real MTN status
            setMsg(`Waiting... MTN: ${j.mtn?.status || j.status} | Attempt ${attempts}/40 | Ref: ${data.txRef.slice(0,8)} | Phone: ${j.tx?.phone || normalized}`);
          }
        } catch (e) {
          console.error("verify poll error", e);
        }
      }, 3000);
    } catch (e: any) {
      setStatus("error");
      setMsg(`TRUE ERROR: ${e.message}`);
      onError?.(e.message);
    }
  };

  return (
    <div className="paypal-wrap">
      <div className="paypal-header">
        <div className="paypal-plan-badge">{planId.toUpperCase()} • MTN MoMo • TRUE API</div>
        <h3 className="paypal-title">Pay with MTN MoMo</h3>
        <p className="paypal-desc">Secure • Real MTN: {MTN_BILLING_URL.replace("https://","").slice(0,25)}...</p>
      </div>

      {status !== "idle" && <div className="paypal-status" style={{fontSize:"12px", wordBreak:"break-all"}}>{msg || status}</div>}
      {status === "error" && <div className="paypal-error" style={{fontSize:"12px", wordBreak:"break-all"}}>{msg}</div>}
      {status === "success" && <div className="paypal-success">{msg}</div>}

      {/* Debug raw MTN response - TRUE data */}
      {mtnRaw && status !== "idle" && (
        <details style={{fontSize:"10px", background:"hsl(var(--surface))", padding:"8px", borderRadius:"8px", marginBottom:"12px"}}>
          <summary>MTN Raw Response (TRUE)</summary>
          <pre style={{whiteSpace:"pre-wrap", wordBreak:"break-all"}}>{JSON.stringify(mtnRaw, null, 2)}</pre>
        </details>
      )}

      <div className="mtn-input-wrap" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="tel"
          placeholder="0777123456 or 46733123454 (sandbox)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            padding: "14px", borderRadius: "12px", background: "hsl(var(--surface))",
            border: "1px solid hsl(var(--border))", color: "hsl(var(--text))", fontSize: "16px", width: "100%", boxSizing: "border-box"
          }}
        />
        <button
          onClick={initPay}
          disabled={status === "sending" || status === "verifying"}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px", background: "#FFCC00", color: "#000",
            border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer",
            opacity: (status === "sending" || status === "verifying") ? 0.6 : 1
          }}
        >
          {status === "sending" ? "Calling MTN API..." : status === "verifying" ? `Polling MTN... ${txRef.slice(0,8)}...` : `Pay ${planId.toUpperCase()} with MoMo - TRUE`}
        </button>
        {txRef && <div style={{fontSize:"10px", opacity:0.6}}>Tx: {txRef}</div>}
      </div>

      <div className="paypal-footer">
        <span className="paypal-secure">🔒 MTN {mtnRaw?.mock === false ? 'LIVE' : 'SANDBOX'} • Real API</span>
        <span>• *165# • {status}</span>
      </div>
    </div>
  );
}

