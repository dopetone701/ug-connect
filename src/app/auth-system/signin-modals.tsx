"use client";
import { useState, useRef } from "react";
import "./signin-modals.css";
import { PasswordInput } from "./input-eye";

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev";

type Props = {
  isOpen: boolean;
  mode: "signin" | "signup";
  onClose: () => void;
  onSuccess?: (user: any) => void;
  onSwitchMode: (m: "signin" | "signup") => void;
  initialEmail?: string;
};

export default function SigninModals({ isOpen, mode, onClose, onSuccess, onSwitchMode, initialEmail = "" }: Props) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const uploadAvatar = async (token: string) => {
    if (!avatarFile) return;
    const fd = new FormData();
    fd.append("file", avatarFile);
    await fetch(`${WORKER_URL}/api/user/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "signup"? "/api/auth/signup" : "/api/auth/signin";
      const body = mode === "signup"? { email, password, name } : { email, password };

      const res = await fetch(`${WORKER_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      localStorage.setItem("ug_token", data.token);
      localStorage.setItem("ug_user", JSON.stringify(data.user));

      if (avatarFile) {
        await uploadAvatar(data.token).catch(()=>{});
      }

      onSuccess?.(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    const guestUser = { id: "guest_"+Date.now(), name: "Guest", email: "guest@ug.local", isGuest: true };
    localStorage.setItem("ug_user", JSON.stringify(guestUser));
    localStorage.setItem("ug_guest", "1");
    onSuccess?.(guestUser);
    onClose();
  };

  const handleGoogle = async () => {
    setError("Google sign-in - wire your Google Client ID in live-services.config.ts");
  };

  const handleApple = async () => {
    setError("Apple sign-in coming - add Apple Service ID");
  };

  return (
    <div className="ug-modal-overlay" onClick={onClose} style={{ animation: "ugFadeIn 0.25s ease-out" }}>
      <style>{`
        @keyframes ugFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ugSlideUp {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="ug-modal-wrap" onClick={onClose} style={{ animation: "ugSlideUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
        <div className="ug-modal" onClick={(e) => e.stopPropagation()}>

          <button className="ug-modal-close" onClick={onClose}>✕</button>

          <h2 className="ug-modal-title">
            {mode === "signin"? "Welcome back" : "Create account"}
          </h2>
          {mode === "signup" ? (
            <>
              <div className="ug-bonus-badge"> INSTANT WELCOME BONUS</div>
              <p className="ug-modal-sub sales"></p>
            </>
          ) : (
            <p className="ug-modal-sub">
              Welcome back — restore you preferences.
            </p>
          )}

          <form onSubmit={handleSubmit} className="ug-modal-form">
            {mode === "signup" && (
              <>
                <div className="ug-avatar-row">
                  <div className="ug-avatar-preview" onClick={()=>fileRef.current?.click()}>
                    {avatarPreview? (
                      <img src={avatarPreview} alt="avatar" />
                    ) : (
                      <span>+</span>
                    )}
                  </div>
                  <div className="ug-avatar-meta">
                    <p onClick={()=>fileRef.current?.click()}>Add avatar (optional)</p>
                    <small>Tap to upload, or skip</small>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
                  {avatarFile && <button type="button" className="ug-avatar-clear" onClick={()=>{setAvatarFile(null); setAvatarPreview("");}}>Remove</button>}
                </div>

                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ug-input"
                  required
                />
              </>
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ug-input"
              required
            />
            <PasswordInput value={password} onChange={e=>setPassword(e.target.value)} />

            {error && <div className="ug-error">{error}</div>}

            <button type="submit" disabled={loading} className="ug-btn-primary">
              {loading? "Please wait..." : mode === "signin"? "Sign In" : "Sign Up & Continue"}
            </button>

            <div className="ug-divider"><span>or</span></div>

            <div className="ug-social-grid">
              <button type="button" className="ug-btn-social google" onClick={handleGoogle}>
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
              <button
                type="button"
                className="ug-btn-social apple"
                onClick={handleApple}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M17.05 12.66c-.02-2.24 1.83-3.32 1.91-3.37a4.1 4.1 0 0 0-3.23-1.75c-1.36-.14-2.68.81-3.37.81-.7 0-1.77-.8-2.91-.78a4.29 4.29 0 0 0-3.61 2.2c-1.55 2.69-.39 6.65 1.11 8.83.75 1.07 1.61 2.27 2.76 2.23 1.11-.05 1.53-.72 2.88-.72s1.74.72 2.91.69c1.2-.02 1.94-1.08 2.67-2.16a8.87 8.87 0 0 0 1.22-2.51 3.89 3.89 0 0 1-2.34-3.47ZM14.84 6.1a3.93 3.93 0 0 0 .9-2.85 4 4 0 0 0-2.58 1.34 3.75 3.75 0 0 0-.92 2.73 3.3 3.3 0 0 0 2.6-1.22Z"/>
                </svg>
                Apple
              </button>
            </div>

            <button type="button" className="ug-btn-guest" onClick={handleGuest}>
              Continue as Guest →
            </button>
          </form>

          <div className="ug-modal-switch">
            {mode === "signin"? (
              <p>Don't have account? <span onClick={() => onSwitchMode("signup")}>Sign up</span></p>
            ) : (
              <p>Already have account? <span onClick={() => onSwitchMode("signin")}>Sign in</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}