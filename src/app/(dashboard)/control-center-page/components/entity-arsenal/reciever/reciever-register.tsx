// src/app/(dashboard)/control-center-page/components/entity-arsenal/reciever/reciever-register.tsx
// FROM SCRATCH - Receiver register. Email only. No password, no JWT, no account creation.
// File name keeps your tree spelling: reciever/ (do NOT rename - imports depend on it).
"use client";
import { useState } from "react";
import { ARSENAL_ENDPOINTS } from "../arsenal-constants";

export function RecieverRegister({ onCodeSent }: { onCodeSent: (email: string) => void }) {
  const [email, setEmail] = useState("");
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
      onCodeSent(clean);
    } catch (e: any) { setErr(e.message || "Could not send code"); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ margin: 0 }}>Arsenal Receiver</h3>
      <p style={{ margin: 0, opacity: 0.7, fontSize: 13 }}>
        Enter your email. We send you a 6-digit code. No password, no account.
      </p>
      <input
        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com" autoComplete="email"
        style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--surface))", color: "hsl(var(--text))" }}
      />
      {err && <span style={{ color: "#ff6b6b", fontSize: 13 }}>{err}</span>}
      <button onClick={submit} disabled={busy}
        style={{ padding: "12px", borderRadius: 12, border: "none", background: "hsl(var(--primary))", color: "hsl(var(--primary-text))", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Sending..." : "Send code"}
      </button>
    </div>
  );
}

