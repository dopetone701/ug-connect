"use client";
import { useState, useEffect, useRef } from "react";
import "./forgot-password.css";

const cleanUrl = (v: string | undefined, fallback: string) => {
  let s = (v || fallback).trim();
  s = s.replace(/^value:\s*/i, "").replace(/^["']|["']$/g, "").trim();
  if (s.startsWith("value:")) s = s.slice(6).trim();
  return s;
};

const PASSWORD_WORKER_URL = cleanUrl(
  process.env.NEXT_PUBLIC_PASSWORD_RECOVERY_URL,
  "https://password-recovery-api.connectu89.workers.dev"
);

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess?: () => void;
};

type Step = "email" | "otp" | "newPassword" | "success";

export default function ForgotPassword({ isOpen, onClose, initialEmail = "", onSuccess }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [codeDigits, setCodeDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("email");
        setCodeDigits(["", "", "", "", "", ""]);
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccessMsg("");
        setResendTimer(0);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // WebOTP Auto-read - FIXED no red underline
  useEffect(() => {
    if (step !== "otp" || !isOpen) return;
    const w = window as any;
    if (!("OTPCredential" in w)) return;

    const ac = new AbortController();
    const nav = navigator as any;
    nav.credentials
      ?.get({
        otp: { transport: ["sms"] },
        signal: ac.signal,
      })
      .then((cred: any) => {
        if (cred && cred.code) {
          const raw = String(cred.code).replace(/\D/g, "").slice(0, 6);
          if (raw.length === 6) {
            setCodeDigits(raw.split(""));
            setTimeout(() => handleVerifyCode(raw), 300);
          }
        }
      })
      .catch(() => {});

    return () => ac.abort();
  }, [step, isOpen]);

  const closeAll = () => {
    setError("");
    setSuccessMsg("");
    onClose();
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`${PASSWORD_WORKER_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code");

      setSuccessMsg("Code sent! Check your email");
      setStep("otp");
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      if (data.otp) console.log("DEV OTP:", data.otp);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...codeDigits];
    next[index] = v;
    setCodeDigits(next);
    setOtpError(false);

    if (v && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      setTimeout(() => handleVerifyCode(next.join("")), 200);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCodeDigits(pasted.split(""));
      setTimeout(() => handleVerifyCode(pasted), 200);
    }
  };

  const handleVerifyCode = async (codeOverride?: string) => {
    const code = codeOverride || codeDigits.join("");
    if (code.length !== 6) {
      setError("Enter 6-digit code");
      setOtpError(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${PASSWORD_WORKER_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code");
      setStep("newPassword");
      setSuccessMsg("");
    } catch (err: any) {
      setError(err.message);
      setOtpError(true);
      setTimeout(() => setOtpError(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${PASSWORD_WORKER_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: codeDigits.join(""), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset");
      setStep("success");
      setTimeout(() => {
        closeAll();
        onSuccess?.();
        window.dispatchEvent(new CustomEvent("ug-open-signin"));
      }, 1800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ug-fp-overlay" onClick={closeAll}>
      <div className="ug-fp-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ug-fp-close" onClick={closeAll}>
          ✕
        </button>

        <div className="ug-fp-step-indicator">
          <div className={`ug-fp-dot ${step === "email" ? "active" : "done"}`}></div>
          <div
            className={`ug-fp-dot ${step === "otp" ? "active" : step === "newPassword" || step === "success" ? "done" : ""}`}
          ></div>
          <div className={`ug-fp-dot ${step === "newPassword" ? "active" : step === "success" ? "done" : ""}`}></div>
        </div>

        {step === "email" && (
          <div className="ug-fp-form slide">
            <div className="ug-fp-icon">📧</div>
            <h2 className="ug-fp-title">Forgot Password?</h2>
            <p className="ug-fp-sub">Enter your email and we'll send a 6-digit code to reset your password</p>
            <form onSubmit={handleSendCode} className="ug-fp-form">
              <input
                type="email"
                className="ug-fp-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <div className="ug-fp-error">{error}</div>}
              {successMsg && <div className="ug-fp-success">{successMsg}</div>}
              <button type="submit" className={`ug-fp-btn ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? "Sending code..." : "Send Code"}
              </button>
              <div className="ug-fp-link-row">
                <button type="button" className="ug-fp-link" onClick={closeAll}>
                  ← Back to Sign In
                </button>
                <span className="ug-fp-resend-timer">Secure • 10 min expiry</span>
              </div>
            </form>
          </div>
        )}

        {step === "otp" && (
          <div className="ug-fp-form slide">
            <div className="ug-fp-icon">🔐</div>
            <h2 className="ug-fp-title">Enter Code</h2>
            <p className="ug-fp-sub">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>

            <div className="ug-fp-otp-grid" onPaste={handleOtpPaste}>
              {codeDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  className={`ug-fp-otp-box ${digit ? "filled" : ""} ${otpError ? "error" : ""}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  maxLength={1}
                />
              ))}
            </div>

            {error && <div className="ug-fp-error">{error}</div>}
            {successMsg && <div className="ug-fp-success">{successMsg}</div>}

            <button
              className={`ug-fp-btn ${loading ? "loading" : ""}`}
              onClick={() => handleVerifyCode()}
              disabled={loading || codeDigits.join("").length !== 6}
              type="button"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <div className="ug-fp-link-row">
              <button className="ug-fp-link" onClick={() => setStep("email")} type="button">
                Change Email
              </button>
              <button
                className="ug-fp-link primary"
                onClick={handleSendCode as any}
                disabled={resendTimer > 0 || loading}
                type="button"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
              </button>
            </div>
          </div>
        )}

        {step === "newPassword" && (
          <div className="ug-fp-form slide">
            <div className="ug-fp-icon">🔑</div>
            <h2 className="ug-fp-title">Set New Password</h2>
            <p className="ug-fp-sub">Create a strong password you'll remember</p>

            <form onSubmit={handleResetPassword} className="ug-fp-form">
              <div className="ug-fp-pass-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  className="ug-fp-input"
                  placeholder="New password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button type="button" className="ug-fp-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="ug-fp-pass-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  className="ug-fp-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ paddingRight: "40px" }}
                />
              </div>

              {error && <div className="ug-fp-error">{error}</div>}

              <button type="submit" className={`ug-fp-btn ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        )}

        {step === "success" && (
          <div className="ug-fp-form slide">
            <div className="ug-fp-success-icon">✓</div>
            <h2 className="ug-fp-title">Password Changed!</h2>
            <p className="ug-fp-sub">
              Your password has been reset successfully.
              <br />
              Redirecting to sign in...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

