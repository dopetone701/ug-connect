"use client";
import { useEffect, useState } from "react";
import "./gate.css";
import SigninModals from "../../../../app/auth-system/signin-modals";
import LogoutModal from "../../../../app/auth-system/logout-modal";

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev";

type User = { id: string; email: string; name: string };

export default function GetStartedInputGate() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signup");
  const [prefillEmail, setPrefillEmail] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      try {
        const saved = localStorage.getItem("ug_user");
        setUser(saved ? (JSON.parse(saved) as User) : null);
      } catch { setUser(null); }
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("ug_auth_changed" as any, syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("ug_auth_changed" as any, syncUser);
    };
  }, []);

  const handleLogout = () => setLogoutOpen(true);
  const confirmLogout = () => {
    localStorage.removeItem("ug_token");
    localStorage.removeItem("ug_user");
    localStorage.removeItem("ug_guest");
    setUser(null);
    setLogoutOpen(false);
    window.dispatchEvent(new Event("ug_auth_changed"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (user) return;
    
    const cleanEmail = email.trim().toLowerCase();
    setChecking(true);
    try {
      let exists = false;
      try {
        const res = await fetch(`${WORKER_URL}/api/auth/check-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail }),
        }).catch(() => null as any);
        if (res && res.ok) {
          const data = await res.json().catch(() => ({}));
          exists = !!data.exists;
        }
      } catch {}
      setPrefillEmail(cleanEmail);
      setModalMode(exists ? "signin" : "signup");
      setModalOpen(true);
    } finally {
      setChecking(false);
    }
  };

  if (user) {
    return (
      <div className="gte-root">
        <div className="cta-stack">
          <button className="cta-btn cta-btn-connected">
            ✓ Connected — {user.name} • {user.email}
          </button>
          <button className="cta-logout" onClick={handleLogout}>Logout</button>
        </div>
        <p className="gte-foot">You are all set. Explore services.</p>
        <LogoutModal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={confirmLogout} user={user} />
      </div>
    );
  }

  return (
    <div className="gte-root">
      <form className="gte-form" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="gte-input"
        />
        <button type="submit" className="gte-btn" disabled={checking}>
          {checking ? "Checking..." : "Get Started"}
        </button>
      </form>
      <p className="gte-foot">No commitment. Leave anytime.</p>

      <SigninModals
        isOpen={modalOpen}
        mode={modalMode}
        initialEmail={prefillEmail}
        onClose={() => setModalOpen(false)}
        onSwitchMode={(m) => setModalMode(m)}
        onSuccess={(u: any) => {
          const newUser = u?.user || u;
          setUser(newUser);
          if (newUser) localStorage.setItem("ug_user", JSON.stringify(newUser));
          if (u?.token) localStorage.setItem("ug_token", u.token);
          window.dispatchEvent(new Event("ug_auth_changed"));
          setModalOpen(false);
          setEmail("");
        }}
      />
      <LogoutModal isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} onConfirm={confirmLogout} user={user} />
    </div>
  );
}