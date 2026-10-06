"use client";
import { useState, useRef, useEffect } from "react";
import "./signin-modals.css";
import { PasswordInput } from "./input-eye";
import { saveGuestSession } from "./guest-user-account";
import ForgotPassword from "./forgot-password";
import { useRouter } from "next/navigation";

const cleanUrl = (v: string | undefined, fallback: string) => {
  let s = (v || fallback).trim();
  s = s.replace(/^value:\s*/i, '').replace(/^Value encrypted/i, '').replace(/^["']|["']$/g, '').trim();
  if (s.startsWith('value:')) s = s.slice(6).trim();
  return s;
};

const WORKER_URL = cleanUrl(process.env.NEXT_PUBLIC_API_URL, "https://user-account-server-api.connectu89.workers.dev");
const GOOGLE_WORKER_URL = cleanUrl(process.env.NEXT_PUBLIC_GOOGLE_WORKER_URL, "https://google-signin-api.connectu89.workers.dev");
const GOOGLE_CLIENT_ID = cleanUrl(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, "246957161701-9grkrunibu4iidvqomha8vpdtmnhe994s.apps.googleusercontent.com");

declare global { interface Window { google?: any } }

type Props = {
  isOpen: boolean;
  mode: "signin" | "signup";
  onClose: () => void;
  onSuccess?: (user: any) => void;
  onSwitchMode: (m: "signin" | "signup") => void;
  initialEmail?: string;
};

export default function SigninModals({ isOpen, mode, onClose, onSuccess, onSwitchMode, initialEmail = "" }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [forcedOpen, setForcedOpen] = useState(false);

  useEffect(() => {
  const h = (e: any) => {
    const force = e?.detail?.force === true;
    const hasToken = localStorage.getItem("ug_token");
    if (hasToken &&!force) return; // only block real authed user
    setForcedOpen(true);
    onSwitchMode("signin");
  };
  window.addEventListener("ug-open-signin" as any, h);
  return () => window.removeEventListener("ug-open-signin" as any, h);
}, [onSwitchMode]);


  useEffect(() => {
    if (document.getElementById("google-gsi")) return;
    const s = document.createElement("script");
    s.id = "google-gsi";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, []);

  const show = isOpen || forcedOpen;
  const closeAll = () => {
    // FIX: always clear NOX force flag
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ug_nox_force_auth");
    }
    setForcedOpen(false);
    setGLoading(false);
    setError("");
    onClose();
  };

  if (!show && !showForgot) return null;

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Avatar max 5MB");
      return;
    }
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const uploadAvatar = async (token: string) => {
    if (!avatarFile) return null;
    try {
      const buffer = await avatarFile.arrayBuffer();
      const res = await fetch(`${WORKER_URL}/api/user/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": avatarFile.type || "image/jpeg",
          "X-Filename": avatarFile.name
        },
        body: buffer,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return null;
      return data;
    } catch (e) {
      console.error("Avatar upload error", e);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/signin";
      const body = mode === "signup" ? { email, password, name } : { email, password };
      const res = await fetch(`${WORKER_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      localStorage.setItem("ug_token", data.token);
      localStorage.setItem("ug_user", JSON.stringify(data.user));
      localStorage.removeItem("ug_guest_session");
      sessionStorage.removeItem("ug_nox_force_auth");
      window.dispatchEvent(new CustomEvent("ug-auth-changed"));
      if (avatarFile) await uploadAvatar(data.token).catch(() => {});
      onSuccess?.(data.user);
closeAll();
// OPEN EDIT SHEET IMMEDIATELY AFTER SIGNIN
setTimeout(() => {
  window.dispatchEvent(new CustomEvent("ug-open-edit-sheet" as any));
  window.dispatchEvent(new CustomEvent("ug-open-account-sheet" as any, { detail: { sheet: "edit" } }));
}, 350);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // FIX: GUEST NOW OPENS APP NORMALLY
  const handleGuest = async () => {
    try {
      // clear any forced auth lock
      sessionStorage.removeItem("ug_nox_force_auth");
      localStorage.removeItem("ug_token");
      localStorage.removeItem("ug_user");
      
      const guestUser = saveGuestSession(); // this should set ug_guest_session
      
      // ensure event for AppShell + NOX spy
      window.dispatchEvent(new CustomEvent("ug-auth-changed"));
      window.dispatchEvent(new CustomEvent("ug-guest-continue" as any));
      
      onSuccess?.(guestUser);
      closeAll();

      // if user is on landing /, take them to app
      if (window.location.pathname === "/") {
        router.replace("/movies");
      }
    } catch (err: any) {
      console.error("Guest error", err);
      // fallback still open app
      closeAll();
      if (window.location.pathname === "/") {
        router.replace("/movies");
      }
    }
  };

  const handleGoogle = async () => {
    setError("");
    if (!GOOGLE_CLIENT_ID) return setError("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
    if (!window.google) return setError("Google SDK loading, wait 1s and retry");
    setGLoading(true);
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (res: any) => {
        try {
          const r = await fetch(`${GOOGLE_WORKER_URL}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: res.credential }),
          });
          const data = await r.json();
          if (!r.ok) throw new Error(data.error || "Google auth failed");
          localStorage.setItem("ug_token", data.token);
          localStorage.setItem("ug_user", JSON.stringify(data.user));
          localStorage.removeItem("ug_guest");
          localStorage.removeItem("ug_guest_user");
          window.dispatchEvent(new Event("ug-auth-changed"));
          localStorage.removeItem("ug_guest_session");
          sessionStorage.removeItem("ug_nox_force_auth");
          window.dispatchEvent(new CustomEvent("ug-auth-changed"));
          onSuccess?.(data.user);
closeAll();
setTimeout(() => {
  window.dispatchEvent(new CustomEvent("ug-open-edit-sheet" as any));
  window.dispatchEvent(new CustomEvent("ug-open-account-sheet" as any, { detail: { sheet: "edit" } }));
}, 350);

        } catch (e: any) {
          setError(e.message);
        } finally {
          setGLoading(false);
        }
      },
    });
    window.google.accounts.id.prompt((n: any) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        const el = document.getElementById("google-hidden-btn");
        if (el) {
          el.innerHTML = "";
          window.google.accounts.id.renderButton(el, { theme: "outline", size: "large", width: 300 });
          setTimeout(() => {
            (document.querySelector("#google-hidden-btn div[role=button]") as HTMLElement)?.click();
          }, 200);
        }
      }
      if (n.isDismissedMoment()) setGLoading(false);
    });
  };

  return (
    <>
      {show && (
        <div className="ug-modal-overlay" onClick={closeAll} style={{ animation: "ugFadeIn 0.25s ease-out" }}>
          <style>{`
            @keyframes ugFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes ugSlideUp { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
          <div className="ug-modal-wrap" onClick={closeAll} style={{ animation: "ugSlideUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
            <div className="ug-modal" onClick={(e) => e.stopPropagation()}>
              <div id="google-hidden-btn" style={{ position: "absolute", left: -9999, top: 0, opacity: 0, pointerEvents: "none" }}></div>
              <button className="ug-modal-close" onClick={closeAll}>✕</button>
              <h2 className="ug-modal-title">{mode === "signin" ? "Sign In to continue" : "Create account"}</h2>
              {mode === "signup" ? (
                <>
                  <div className="ug-bonus-badge"> INSTANT WELCOME BONUS</div>
                  <p className="ug-modal-sub sales"></p>
                </>
              ) : (
                <p className="ug-modal-sub"></p>
              )}
              <form onSubmit={handleSubmit} className="ug-modal-form">
                {mode === "signup" && (
                  <>
                    <div className="ug-avatar-row">
                      <div className="ug-avatar-preview" onClick={() => fileRef.current?.click()}>
                        {avatarPreview ? <img src={avatarPreview} alt="avatar" /> : <span>+</span>}
                      </div>
                      <div className="ug-avatar-meta">
                        <p onClick={() => fileRef.current?.click()}>Add avatar (optional)</p>
                        <small>Tap to upload, or skip</small>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
                      {avatarFile && <button type="button" className="ug-avatar-clear" onClick={() => { setAvatarFile(null); setAvatarPreview(""); }}>Remove</button>}
                    </div>
                    <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="ug-input" required />
                  </>
                )}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="ug-input" required />
                <PasswordInput value={password} onChange={e => setPassword(e.target.value)} />
                {mode === "signin" && (
                  <div style={{ textAlign: "right", marginTop: "8px" }}>
                    <span onClick={() => setShowForgot(true)} style={{ fontSize: "13px", textDecoration: "underline", cursor: "pointer", color: "#8ab4f8" }}>
                      Forgot password?
                    </span>
                  </div>
                )}
                {error && <div className="ug-error">{error}</div>}
                <button type="submit" disabled={loading} className="ug-btn-primary">
                  {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up & Continue"}
                </button>
                <p style={{ fontSize: "11px", textAlign: "center", marginTop: "12px", lineHeight: "1.4", opacity: 0.75 }}>
                  By continuing you agree to UG-Connect's <a href="/terms" style={{ textDecoration: "underline" }}>Terms</a>, <a href="/privacy" style={{ textDecoration: "underline" }}>Privacy Policy</a> and <a href="/cookies" style={{ textDecoration: "underline" }}>Cookie Policy</a>
                </p>
                <div className="ug-divider"><span>or</span></div>
                <button type="button" className="ug-btn-social google" onClick={handleGoogle} disabled={gLoading} style={{ width: "100%" }}>
                  <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  {gLoading ? "..." : "Continue with Google"}
                </button>
                <button type="button" className="ug-btn-guest" onClick={handleGuest}>Continue as Guest →</button>
              </form>
              <div className="ug-modal-switch">
                {mode === "signin" ? (
                  <p>Don't have account? <span onClick={() => onSwitchMode("signup")}>Sign up</span></p>
                ) : (
                  <p>Already have account? <span onClick={() => onSwitchMode("signin")}>Sign in</span></p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ForgotPassword
        isOpen={showForgot}
        onClose={() => setShowForgot(false)}
        initialEmail={email}
        onSuccess={() => {
          setShowForgot(false);
        }}
      />
    </>
  );
}
