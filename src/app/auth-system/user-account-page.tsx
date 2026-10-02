"use client";

import { useState, useEffect } from "react";
import "./user-account-page.css";
import type { SheetId } from "./account-sheets";

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev";

type RealUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatar?: string;
  isGuest?: boolean;
};

type Props = {
  onEdit?: () => void;
  onSelect?: (id: SheetId) => void;
};

export default function UserAccountPage({ onEdit, onSelect }: Props) {
  const [user, setUser] = useState<RealUser | null>(null);
  const [imgErr, setImgErr] = useState(false);

  const loadUser = async () => {
    try {
      const raw = localStorage.getItem("ug_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }

      const token = localStorage.getItem("ug_token");
      if (!token) return;

      const res = await fetch(`${WORKER_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const fresh = data.user || data;
        setUser(fresh);
        localStorage.setItem("ug_user", JSON.stringify(fresh));
      }
    } catch (e) {
      console.log("loadUser failed", e);
    }
  };

  useEffect(() => {
    loadUser();
    const onAuthChanged = () => loadUser();
    window.addEventListener("ug-auth-changed", onAuthChanged);
    window.addEventListener("storage", onAuthChanged);
    return () => {
      window.removeEventListener("ug-auth-changed", onAuthChanged);
      window.removeEventListener("storage", onAuthChanged);
    };
  }, []);

  if (!user) {
    return (
      <div className="page">
        <div className="header">
          <p style={{ color: "hsl(var(--text-muted))", fontSize: "13px" }}>No account — sign in</p>
        </div>
      </div>
    );
  }

  const initial = user.name?.charAt(0)?.toUpperCase() || "U";
  const avatarSrc = user.avatarUrl || user.avatar || "";
  const showImg = avatarSrc && !imgErr;

  return (
    <div className="page">
      <button className="editBtn" onClick={onEdit}>
        Edit
      </button>

      <div className="header">
        <div className="avatarWrap flame">
          <div className="avatarInner">
            {showImg ? (
              <img src={avatarSrc} alt={user.name} className="avatar" onError={() => setImgErr(true)} />
            ) : (
              <span className="fallback">{initial}</span>
            )}
          </div>
        </div>
        <h2 className="name">{user.name} {user.isGuest && "(Guest)"}</h2>
        <p className="email">{user.email}</p>
      </div>

      <div className="cubesRow">
        <div className="cubeItem">
          <button className="cube" onClick={() => onSelect?.("create")}><span className="cubeIcon">+</span></button>
          <span className="cubeLabelOutside">Create</span>
        </div>
        <div className="cubeItem">
          <button className="cube" onClick={() => onSelect?.("favorites")}><span className="cubeIcon">♡</span></button>
          <span className="cubeLabelOutside">Favorites</span>
        </div>
        <div className="cubeItem">
          <button className="cube" onClick={() => onSelect?.("downloads")}><span className="cubeIcon">↓</span></button>
          <span className="cubeLabelOutside">Downloads</span>
        </div>
        <div className="cubeItem">
          <button className="cube" onClick={() => onSelect?.("alerts")}><span className="cubeIcon">◍</span></button>
          <span className="cubeLabelOutside">Alerts</span>
        </div>
        <div className="cubeItem">
          <button className="cube" onClick={() => onSelect?.("more")}><span className="cubeIcon">⊞</span></button>
          <span className="cubeLabelOutside">More</span>
        </div>
      </div>
    </div>
  );
}
