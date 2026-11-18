"use client";
import { useEffect, useState } from "react";
import { useArsenalDrawer } from "./arsenal-drawer-store";

// arsenal-body.tsx - ALIVE. Feeds the empty panel. Drawer + Store + CSS untouched.
// Page must render: <ArsenalDrawer><ArsenalBody /></ArsenalDrawer>
// Drawer shows this on top layer only. Body reads stack top to know which screen to show.

type Item = { id: string; title: string; type?: string; status?: string; createdAt?: number; autoClearAt?: number; fileKey?: string; coverKey?: string };

export default function ArsenalBody() {
  const stack = useArsenalDrawer((s) => s.stack);
  const open = useArsenalDrawer((s) => s.open);
  const back = useArsenalDrawer((s) => s.back);
  const closeAll = useArsenalDrawer((s) => s.closeAll);
  const entry = stack[stack.length - 1];
  const id = entry?.id;
  const props = entry?.props ?? {};

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [email, setEmail] = useState(props.email ?? "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/arsenal/items");
      const j = await r.json().catch(() => ({}));
      setItems(Array.isArray(j.items) ? j.items : Array.isArray(j) ? j : []);
    } catch { setErr("Could not load Arsenal."); }
    setLoading(false);
  };
  useEffect(() => { if (id === "arsenal-list" || id === "arsenal-picker") load(); }, [id]);

  // Keep email in sync when Share opens with an email
  useEffect(() => { if (props.email) setEmail(props.email); }, [props.email]);

  const sendOtp = async () => {
    if (!email.includes("@")) { setErr("Enter a valid email."); return; }
    setSending(true); setErr("");
    try {
      const r = await fetch("/api/arsenal/otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!r.ok) throw new Error("OTP failed");
      setOtpSent(true);
    } catch { setErr("Could not send code. Try again."); }
    setSending(false);
  };
  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setErr("Enter the 6-digit code."); return; }
    setSending(true); setErr("");
    try {
      const r = await fetch("/api/arsenal/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
      if (!r.ok) throw new Error("Bad code");
      open("arsenal-list", {});
    } catch { setErr("Wrong code. Try again."); }
    setSending(false);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true); setProgress(0); setErr("");
    try {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("title", f.name.replace(/\.[^.]+$/, ""));
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/arsenal/upload");
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
      xhr.onload = () => { setUploading(false); if (xhr.status < 300) load(); else setErr("Upload failed."); };
      xhr.onerror = () => { setUploading(false); setErr("Upload failed."); };
      xhr.send(fd);
    } catch { setUploading(false); setErr("Upload failed."); }
  };

  const useInCreate = (item: Item) => {
    window.dispatchEvent(new CustomEvent("arsenal:pick-for-create", { detail: item }));
    closeAll();
  };
  const clearItem = async (itemId: string) => {
    if (!confirm("Clear this item from Arsenal?")) return;
    await fetch("/api/arsenal/clear", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId }) });
    load();
  };

  const filtered = items.filter((it) => !search || it.title.toLowerCase().includes(search.toLowerCase()));
  const daysLeft = (ts?: number) => { if (!ts) return ""; const d = Math.ceil((ts - Date.now()) / 86400000); return d <= 0 ? "Clearing soon" : `${d}d left`; };

  /* ---------- PICKER ---------- */
  if (id === "arsenal-picker") {
    return (
      <div className="arsenal-stack">
        <input className="arsenal-input" placeholder="Search Arsenal..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {loading ? <div className="arsenal-spinner" /> : filtered.length === 0 ? <div className="arsenal-empty">No items in Arsenal yet.</div> : (
          <div className="arsenal-list">{filtered.map((it) => (
            <button key={it.id} className="arsenal-row" onClick={() => useInCreate(it)}>
              <span><span className="arsenal-row-label">{it.title}</span><span className="arsenal-row-hint">{it.type ?? "Movie"} • {daysLeft(it.autoClearAt)}</span></span>
              <span className="arsenal-chevron">Use →</span>
            </button>
          ))}</div>
        )}
        <button className="arsenal-btn is-ghost" onClick={back}>Back</button>
      </div>
    );
  }

  /* ---------- REGISTER / OTP ---------- */
  if (id === "reciever-register") {
    return (
      <div className="arsenal-stack">
        <p className="arsenal-hint">Receiver registers with email. We send a 6-digit code. No account needed.</p>
        <input className="arsenal-input" placeholder="Receiver email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {!otpSent ? (
          <button className="arsenal-btn" onClick={sendOtp} disabled={sending}>{sending ? "Sending..." : "Send code"}</button>
        ) : (
          <>
            <div className="arsenal-otp-row">{otp.map((d, i) => (
              <input key={i} className="arsenal-otp-box" maxLength={1} inputMode="numeric" value={d}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 1); const n = [...otp]; n[i] = v; setOtp(n); if (v) document.getElementById(`ars-otp-${i + 1}`)?.focus(); }}
                id={`ars-otp-${i}`} />
            ))}</div>
            <button className="arsenal-btn" onClick={verifyOtp} disabled={sending}>{sending ? "Verifying..." : "Verify & open Arsenal"}</button>
            <button className="arsenal-btn is-ghost" onClick={() => setOtpSent(false)}>Change email</button>
          </>
        )}
        {err ? <p className="arsenal-err">{err}</p> : null}
      </div>
    );
  }

  /* ---------- SHARE ---------- */
  if (id === "share-arsenal") {
    return (
      <div className="arsenal-stack">
        <p className="arsenal-hint">Share Arsenal with a receiver. They register with email + code, then they can upload to your Arsenal.</p>
        <input className="arsenal-input" placeholder="Receiver email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="arsenal-btn" onClick={() => open("reciever-register", { email })}>Send invite / open register</button>
        <button className="arsenal-btn is-ghost" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/arsenal?email=${encodeURIComponent(email)}`); }}>Copy invite link</button>
        {err ? <p className="arsenal-err">{err}</p> : null}
      </div>
    );
  }

  /* ---------- LIST (default) ---------- */
  return (
    <div className="arsenal-stack">
      <div className="arsenal-actions" style={{ marginTop: 0 }}>
        <label className="arsenal-btn-dash" style={{ cursor: "pointer" }}>
          {uploading ? `Uploading... ${progress}%` : "+ Upload movie to Arsenal"}
          <input type="file" accept="video/*" hidden onChange={(e) => onFile(e.target.files?.[0])} disabled={uploading} />
        </label>
        {uploading ? <div className="arsenal-progress-track"><div className="arsenal-progress-fill" style={{ width: `${progress}%` }} /></div> : null}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="arsenal-btn-toggle" onClick={() => open("share-arsenal", {})}>Share Arsenal</button>
        <button className="arsenal-btn-toggle" onClick={() => open("reciever-register", {})}>Receiver register</button>
      </div>
      <p className="arsenal-section-label">Arsenal items • auto-clear in 90 days</p>
      {loading ? <div className="arsenal-spinner" /> : err ? <p className="arsenal-err">{err}</p> : filtered.length === 0 && !search ? <div className="arsenal-empty">Arsenal is empty.<br />Upload a movie, or share it with a receiver.</div> : (
        <div className="arsenal-list">{filtered.map((it) => (
          <div key={it.id} className="arsenal-card">
            <div className="arsenal-card-top"><b>{it.title}</b><span className={`arsenal-badge ${it.status === "published" ? "published" : "staged"}`}>{it.status ?? "staged"}</span></div>
            <span className="arsenal-meta">{it.type ?? "Movie"} • <span className="arsenal-soon">{daysLeft(it.autoClearAt)}</span></span>
            <div className="arsenal-row">
              <button className="arsenal-btn-primary" onClick={() => useInCreate(it)}>Use in Create</button>
              <button className="arsenal-btn-ghost" onClick={() => clearItem(it.id)}>Clear</button>
            </div>
          </div>
        ))}</div>
      )}
      <input className="arsenal-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
  );
}

