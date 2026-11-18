"use client";
import { useState } from "react";
import { ARSENAL_ENDPOINTS } from "../arsenal-constants";
import { RecieverOtp } from "./reciever-otp";

// src/app/(dashboard)/control-center-page/components/entity-arsenal/reciever/reciever-register.tsx
// Receiver register. Email only. No password, no JWT, no account creation.
// File name keeps your tree spelling: reciever/ (do NOT rename - imports depend on it).
// No required props - Receiver Body mounts it as <RecieverRegister onVerified={...} />.

export function RecieverRegister({ onCodeSent, onVerified }: { onCodeSent?: (email: string) => void; onVerified?: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clean)) {
      setErr("Enter a valid email"); return;
    }
    setBusy(true); setErr("");
    try {
      const res = await fetch(ARSENAL_ENDPOINTS.requestOtp, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setSentTo(clean);
      onCodeSent?.(clean);
    } catch (e: any) { setErr(e.message || "Could not send code"); }
    finally { setBusy(false); }
  };

  // Step 2: code sent -> show OTP boxes (same page, no navigation)
  if (sentTo) {
    return <RecieverOtp email={sentTo} onBack={() => setSentTo(null)} onVerified={onVerified} />;
  }

  return (
    <div className="arsenal-stack">
      <h3 style={{ margin: 0 }}>Arsenal Receiver</h3>
      <p className="arsenal-hint" style={{ margin: 0, fontSize: 13 }}>
        Enter your email. We send you a 6-digit code. No password, no account.
      </p>
      <input
        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com" autoComplete="email"
        className="arsenal-input"
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
      />
      {err && <span className="arsenal-err">{err}</span>}
      <button onClick={submit} disabled={busy} className="arsenal-btn-primary">
        {busy ? "Sending..." : "Send code"}
      </button>
    </div>
  );
}

export default RecieverRegister;

