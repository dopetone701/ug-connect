"use client";
import { useState, useEffect, useRef } from "react";
import "./edit-sheet.css";

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev";

export default function EditSheet() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [preview, setPreview] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(""); // keep real URL separate
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("ug_user");
    if (raw) {
      const u = JSON.parse(raw);
      setName(u.name || "");
      setEmail(u.email || "");
      setPhone(u.phone || "");
      setLocation(u.location || u.location_city || "");
      setPreview(u.avatarUrl || u.avatar_url || "");
      setAvatarUrl(u.avatarUrl || u.avatar_url || "");
    }
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const save = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("ug_token");
      if (!token) throw new Error("no token");
      let finalAvatarUrl = avatarUrl;

      // 1. Upload to R2 first if new file - worker will DELETE old ones
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch(`${WORKER_URL}/api/user/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const upJson = await up.json();
        if (!up.ok) throw new Error(upJson.error);
        finalAvatarUrl = upJson.fullUrl; // use fullUrl from worker directly
      }

      // 2. Save profile to D1
      const res = await fetch(`${WORKER_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email, phone, location_city: location, avatarUrl: finalAvatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("ug_user", JSON.stringify({...JSON.parse(localStorage.getItem("ug_user")||"{}"),...data.user, avatarUrl: data.user.avatar_url }));
      window.dispatchEvent(new Event("ug-auth-changed"));
      alert("Saved!");
      setFile(null);
      setAvatarUrl(data.user.avatar_url);
    } catch (e:any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-sheet-root">
      <div className="edit-header">
        <div className="edit-avatar-wrap" onClick={() => fileRef.current?.click()}>
          <div className="edit-avatar-inner">
            {preview? <img src={preview} alt="" className="edit-avatar-img" /> : <span>{name[0]?.toUpperCase()||"U"}</span>}
          </div>
          <span className="edit-camera">✎</span>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        </div>
        <p className="edit-sub">Tap avatar to change</p>
      </div>
      <div className="edit-form">
        <label className="edit-label">Name<input className="edit-input" value={name} onChange={e=>setName(e.target.value)} /></label>
        <label className="edit-label">Email<input className="edit-input" value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label className="edit-label">Phone Number<input className="edit-input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+256 700 000000" /></label>
        <label className="edit-label">Location<input className="edit-input" value={location} onChange={e=>setLocation(e.target.value)} placeholder="Kampala, UG" /></label>
      </div>
      <button className="edit-save-btn" onClick={save} disabled={saving}>{saving? "Saving..." : "Save Changes"}</button>
    </div>
  );
}
