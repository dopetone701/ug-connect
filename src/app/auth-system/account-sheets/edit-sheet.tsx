"use client";
import { useState, useEffect, useRef } from "react";
import "./edit-sheet.css";

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev";

type RealUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  avatar?: string;
};

export default function EditSheet() {
  const [user, setUser] = useState<RealUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("ug_user");
    if (raw) {
      const u = JSON.parse(raw);
      setUser(u);
      setName(u.name || "");
      setEmail(u.email || "");
      setPhone(u.phone || "");
      setLocation(u.location || "");
      setAvatar(u.avatarUrl || u.avatar || "");
      setPreview(u.avatarUrl || u.avatar || "");
    }
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const save = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("ug_token");
      const body = { name, email, phone, location, avatarUrl: preview };
      const res = await fetch(`${WORKER_URL}/api/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        const fresh = data.user || data;
        localStorage.setItem("ug_user", JSON.stringify({...user,...fresh,...body }));
        window.dispatchEvent(new Event("ug-auth-changed"));
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  const initial = name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="edit-sheet-root">
      <div className="edit-header">
        <div className="edit-avatar-wrap" onClick={() => fileRef.current?.click()}>
          <div className="edit-avatar-inner">
            {preview? <img src={preview} alt="" className="edit-avatar-img" /> : <span className="edit-fallback">{initial}</span>}
          </div>
          <span className="edit-camera">✎</span>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        </div>
        <p className="edit-sub">Tap avatar to change</p>
      </div>

      <div className="edit-form">
        <label className="edit-label">Name
          <input className="edit-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
        </label>

        <label className="edit-label">Email
          <input className="edit-input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@domain.com" />
        </label>

        <label className="edit-label">Phone Number
          <input className="edit-input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+256 700 000000" />
        </label>

        <label className="edit-label">Location
          <input className="edit-input" value={location} onChange={e=>setLocation(e.target.value)} placeholder="Kampala, UG" />
        </label>
      </div>

      <button className="edit-save-btn" onClick={save} disabled={saving}>
        {saving? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
