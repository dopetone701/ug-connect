"use client";
import { useState } from "react";
import { ARSENAL_ENDPOINTS } from "../arsenal-constants";

// src/app/(dashboard)/control-center-page/components/entity-arsenal/reciever/reciever-otp.tsx
// Step 2 of Register. 6 boxes. Verify -> onVerified(email).

export function RecieverOtp({ email, onBack, onVerified }: { email: string; onBack: () => void; onVerified?: (email: string) => void }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const verify = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setErr("Enter the 6-digit code."); return; }
    setBusy(true); setErr("");
    try {
      const res = await fetch(ARSENAL_ENDPOINTS.verifyOtp, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Wrong code");
      onVerified?.(email);
    } catch (e: any) { setErr(e.message || "Wrong code. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="arsenal-stack">
      <h3 style={{ margin: 0 }}>Enter code</h3>
      <p className="arsenal-hint" style={{ margin: 0, fontSize: 13 }}>We sent a 6-digit code to <b style={{ color: "hsl(var(--text))" }}>{email}</b></p>
      <div className="arsenal-otp-row">
        {otp.map((d, i) => (
          <input key={i} className="arsenal-otp-box" maxLength={1} inputMode="numeric" value={d}
            onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 1); const n = [...otp]; n[i] = v; setOtp(n); if (v) document.getElementById(`ars-otp-${i + 1}`)?.focus(); }}
            onKeyDown={(e) => { if (e.key === "Backspace" && !d) document.getElementById(`ars-otp-${i - 1}`)?.focus(); if (e.key === "Enter") verify(); }}
            id={`ars-otp-${i}`} />
        ))}
      </div>
      {err && <span className="arsenal-err">{err}</span>}
      <button onClick={verify} disabled={busy} className="arsenal-btn-primary">{busy ? "Verifying..." : "Verify & continue"}</button>
      <button onClick={onBack} className="arsenal-btn is-ghost">Change email</button>
    </div>
  );
}

