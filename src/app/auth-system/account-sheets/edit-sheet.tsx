"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import EditIcon from "@/modal-generator/svg-icons/edit-icon";
import GuestEditSheet from "./guest-edit-sheet";
import "./edit-sheet.css";

const WORKER_URL = (process.env.NEXT_PUBLIC_API_URL || "https://user-account-server-api.connectu89.workers.dev").trim().replace(/\/$/, "");

export default function EditSheet() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [preview, setPreview] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("ug_token");
      const raw = localStorage.getItem("ug_user");
      if (!token || !raw) {
        setIsGuest(true);
        return;
      }
      const u = JSON.parse(raw);
      if (u.isGuest || u.role === "guest" || localStorage.getItem("ug_guest") === "1") {
        if (token && !u.isGuest) {
          // stray flag, continue as real
        } else {
          setIsGuest(true);
          return;
        }
      }

      // local first - instant, no lag
      setName(u.name || "");
      setEmail(u.email || "");
      setPhone(u.phone || u.phone_e164 || "");
      setLocation(u.location || u.location_city || "");
      const localAvatar = u.avatarUrl || u.avatar_url || "";
      if (localAvatar) {
        setPreview(localAvatar);
        setAvatarUrl(localAvatar);
        setImgErr(false);
      }
      setIsGuest(false);

      // background D1 refresh - non-blocking, no lag
      if (token) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(`${WORKER_URL}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
            cache: "no-store",
          });
          clearTimeout(timeout);
          if (res.ok) {
            const data = await res.json();
            const fresh = data.user || data;
            const freshAvatar = fresh.avatar_url || fresh.avatarUrl || "";
            // only update if D1 has newer avatar
            if (freshAvatar && freshAvatar !== localAvatar) {
              setPreview(freshAvatar);
              setAvatarUrl(freshAvatar);
              setImgErr(false);
            }
            // update other fields without overwriting what user typed if file pending
            setName((prev) => (file ? prev : fresh.name || prev));
            setEmail((prev) => (file ? prev : fresh.email || prev));
            // merge and save cache
            const merged = { ...u, ...fresh, avatarUrl: freshAvatar || localAvatar, avatar_url: freshAvatar || localAvatar };
            localStorage.setItem("ug_user", JSON.stringify(merged));
          }
        } catch (err) {
          // silent - keep local cache, no lag
          console.log("D1 background fetch skipped", err);
        }
      }
    } catch {
      setIsGuest(true);
    }
  }, [file]);

  useEffect(() => {
    load();
    const onAuth = () => {
      setImgErr(false);
      load();
    };
    window.addEventListener("ug-auth-changed" as any, onAuth);
    window.addEventListener("storage" as any, onAuth);
    window.addEventListener("ug-profile-updated" as any, onAuth);
    window.addEventListener("ug-open-edit-sheet" as any, onAuth);
    return () => {
      window.removeEventListener("ug-auth-changed" as any, onAuth);
      window.removeEventListener("storage" as any, onAuth);
      window.removeEventListener("ug-profile-updated" as any, onAuth);
      window.removeEventListener("ug-open-edit-sheet" as any, onAuth);
    };
  }, [load]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert("Max 5MB image"); return; }
    if (!f.type.startsWith("image/")) { alert("Only images allowed"); return; }
    setFile(f);
    setImgErr(false); // reset error for new file
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const save = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("ug_token");
      if (!token) throw new Error("Not signed in - please sign in again");
      let finalAvatarUrl = avatarUrl;
      if (file) {
        const buffer = await file.arrayBuffer();
        const up = await fetch(`${WORKER_URL}/api/user/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": file.type || "image/jpeg", "X-Filename": file.name },
          body: buffer,
        });
        const text = await up.text();
        let upJson: any = {};
        try { upJson = JSON.parse(text); } catch { upJson = { error: text }; }
        if (!up.ok) throw new Error(upJson.error || `Avatar upload failed: ${up.status} ${text.slice(0,200)}`);
        finalAvatarUrl = upJson.fullUrl || upJson.url || finalAvatarUrl;
      }
      const res = await fetch(`${WORKER_URL}/api/user/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), phone, location_city: location, avatarUrl: finalAvatarUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save profile");
      const current = JSON.parse(localStorage.getItem("ug_user") || "{}");
      const updatedUser = { ...current, ...data.user, avatarUrl: data.user.avatar_url || data.user.avatarUrl || finalAvatarUrl, avatar_url: data.user.avatar_url || finalAvatarUrl };
      localStorage.setItem("ug_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("ug-auth-changed"));
      setFile(null);
      setAvatarUrl(updatedUser.avatar_url);
      setPreview(updatedUser.avatar_url);
      setImgErr(false);
      alert("Saved!");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Save failed");
    } finally { setSaving(false); }
  };

  if (isGuest) {
    return <GuestEditSheet />;
  }

  const initial = name?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || "U";
  const showImg = Boolean(preview) && !imgErr;

  return (
    <div className="edit-sheet-root">
      <div className="edit-header">
        <div className="edit-avatar-wrap" onClick={() => fileRef.current?.click()}>
          <div className="edit-avatar-inner">
            {showImg ? (
              <img
                src={preview}
                alt=""
                className="edit-avatar-img"
                onError={() => {
                  // never show broken img - fallback to letter
                  setImgErr(true);
                  setPreview("");
                }}
                onLoad={() => setImgErr(false)}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <span className="edit-camera">✎</span>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
        </div>
        <p className="edit-sub">Tap avatar to change</p>
      </div>

      <div className="edit-form">
        <label className="edit-label">Name<div className="edit-input-wrap"><input className="edit-input" value={name} onChange={e=>setName(e.target.value)} /><span className="edit-input-icon-right"><EditIcon size={16} /></span></div></label>
        <label className="edit-label">Email<div className="edit-input-wrap"><input className="edit-input" value={email} onChange={e=>setEmail(e.target.value)} /><span className="edit-input-icon-right"><EditIcon size={16} /></span></div></label>
        <label className="edit-label">Phone Number<div className="edit-input-wrap"><input className="edit-input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+256 700 000000" /><span className="edit-input-icon-right"><EditIcon size={16} /></span></div></label>
        <label className="edit-label">Location<div className="edit-input-wrap"><input className="edit-input" value={location} onChange={e=>setLocation(e.target.value)} placeholder="Kampala, UG" /><span className="edit-input-icon-right"><EditIcon size={16} /></span></div></label>
      </div>
      <button className="edit-save-btn" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
    </div>
  );
}

