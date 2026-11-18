"use client";
import { useState, useRef } from "react";
import { ARSENAL_ENDPOINTS } from "../arsenal-constants";
import { useArsenalDrawer } from "../arsenal-drawer-store";

// src/app/(dashboard)/control-center-page/components/entity-arsenal/reciever/reciever-otp.tsx
// 6-digit OTP verify. 10-min expiry (Worker). No JWT stored.
// File name keeps your tree spelling: reciever/ (do NOT rename).
// onVerified is OPTIONAL - if drawer didn't pass it, we open Share upload ourselves.

export function RecieverOtp({ email, onVerified, onBack }: { email: string; onVerified?: (email: string) => void; onBack: () => void }) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const openShare = useArsenalDrawer((s) => s.open);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits]; next[i] = d; setDigits(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  // Paste full 6-digit code at once
  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    text.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  const verify = async () => {
    const code = digits.join("");
    if (code.length !== 6) { setErr("Enter all 6 digits"); return; }
    setBusy(true); setErr("");
    try {
      const res = await fetch(ARSENAL_ENDPOINTS.verifyOtp, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Wrong code");
      // If parent gave us a handler, use it. Otherwise go straight to Share upload.
      if (onVerified) onVerified(email);
      else openShare("share-arsenal", { email });
    } catch (e: any) { setErr(e.message || "Wrong code"); }
    finally { setBusy(false); }
  };

  const resend = async () => {
    setErr("");
    await fetch(ARSENAL_ENDPOINTS.requestOtp, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
  };

  return (
    <div className="arsenal-stack">
      <h3 style={{ margin: 0 }}>Enter code</h3>
      <p className="arsenal-hint" style={{ margin: 0, fontSize: 13 }}>Sent to <b>{email}</b> — expires in 10 minutes.</p>
      <div className="arsenal-otp-row" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} value={d}
            onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => onKey(i, e)}
            inputMode="numeric" maxLength={1} className="arsenal-otp-box"
          />
        ))}
      </div>
      {err && <span className="arsenal-err">{err}</span>}
      <button onClick={verify} disabled={busy} className="arsenal-btn-primary">
        {busy ? "Verifying..." : "Verify & upload"}
      </button>
      <div style={{ display: "flex", gap: 12, fontSize: 13 }}>
        <button onClick={onBack} className="arsenal-btn-ghost" style={{ background: "none", border: "none", padding: 0 }}>← Change email</button>
        <button onClick={resend} className="arsenal-btn-ghost" style={{ background: "none", border: "none", padding: 0, color: "hsl(var(--primary))" }}>Resend code</button>
      </div>
    </div>
  );
}

