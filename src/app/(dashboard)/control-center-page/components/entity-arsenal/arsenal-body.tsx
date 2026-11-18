"use client";
import { useEffect, useState } from "react";
import { useArsenalDrawer } from "./arsenal-drawer-store";
import { QueueHistory, useArsenalActivity } from "./arsenal-queue";
import { ARSENAL_ENDPOINTS, ARSENAL_CHUNK_SIZE, ARSENAL_MAX_CONCURRENT_PARTS, arsenalDaysLeft, arsenalKeyForSingle } from "./arsenal-constants";

// arsenal-body.tsx - ADMIN ONLY. Feeds the empty panel. Drawer + Store + CSS untouched.
// Drawer shows this on top layer only. Body reads stack top to know which screen to show.
// NO OTP here - OTP lives in reciever/ (Receiver page). NO reciever-register here - removed from Store.
// ALL fetches use ARSENAL_ENDPOINTS (Worker), NOT /api/arsenal/*.
// STAGED: file picked -> STAGED -> admin types title -> Upload. NEVER filename as title. NEVER auto-upload.

type Item = { id: string; title: string; type?: string; status?: string; createdAt?: number; autoClearAt?: number; fileKey?: string; key?: string; email?: string; fileName?: string };

export default function ArsenalBody() {
  const activity = useArsenalActivity();
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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");
  // STAGED draft - file picked, waiting for YOUR title. Not uploading yet.
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedTitle, setStagedTitle] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const r = await fetch(ARSENAL_ENDPOINTS.items);
      const j = await r.json().catch(() => ({}));
      setItems(Array.isArray(j.items) ? j.items : Array.isArray(j) ? j : []);
    } catch { setErr("Could not load Arsenal."); }
    setLoading(false);
  };
  useEffect(() => { if (id === "arsenal-list" || id === "arsenal-picker") load(); }, [id]);
  useEffect(() => { if (props.email) setEmail(props.email); }, [props.email]);

  // STAGE ONLY - pick file, do NOT upload. Title comes next.
  const onFile = (f: File | undefined) => {
    if (!f) return;
    setStagedFile(f); setStagedTitle(""); setErr("");
  };

  // UPLOAD STAGED - only after admin typed title. SAME Worker multipart as Receiver.
  const uploadStaged = async () => {
    if (!stagedFile) return;
    if (!stagedTitle.trim()) { setErr("Put a title first - movie stays staged."); return; }
    const f = stagedFile;
    const title = stagedTitle.trim(); // YOUR title, NEVER f.name
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const key = arsenalKeyForSingle("admin", uploadId, f.name);
    setUploading(true); setProgress(0); setErr("");
    try {
      if (f.size <= ARSENAL_CHUNK_SIZE) {
        const fd = new FormData();
        fd.append("file", f); fd.append("title", title); fd.append("type", "Movie"); fd.append("key", key);
        const r = await fetch(ARSENAL_ENDPOINTS.uploadSingle, { method: "POST", body: fd });
        if (!r.ok) throw new Error("Upload failed");
        setProgress(100);
      } else {
        const cr = await fetch(ARSENAL_ENDPOINTS.createMultipart, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, fileName: f.name, contentType: f.type || "video/mp4", title, type: "Movie", email: "admin" }) });
        const cj = await cr.json().catch(() => ({}));
        if (!cr.ok) throw new Error(cj.error || "Could not start multipart");
        const multipartId = cj.uploadId || cj.multipartId || cj.id;
        const totalParts = Math.ceil(f.size / ARSENAL_CHUNK_SIZE);
        let done = 0;
        const parts: Array<{ partNumber: number; etag: string }> = [];
        for (let start = 0; start < totalParts; start += ARSENAL_MAX_CONCURRENT_PARTS) {
          const batch = Array.from({ length: Math.min(ARSENAL_MAX_CONCURRENT_PARTS, totalParts - start) }, (_, k) => start + k);
          const results = await Promise.all(batch.map(async (pn0) => {
            const pn = pn0 + 1;
            const chunk = f.slice(pn0 * ARSENAL_CHUNK_SIZE, Math.min(f.size, pn * ARSENAL_CHUNK_SIZE));
            const fd = new FormData();
            fd.append("key", key); fd.append("uploadId", multipartId); fd.append("partNumber", String(pn)); fd.append("file", chunk, f.name);
            const r = await fetch(ARSENAL_ENDPOINTS.uploadPart, { method: "POST", body: fd });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.error || `Part ${pn} failed`);
            done++; setProgress(Math.round((done / totalParts) * 100));
            return { partNumber: pn, etag: j.etag || j.ETag || "" };
          }));
          parts.push(...results);
        }
        const fr = await fetch(ARSENAL_ENDPOINTS.completeMultipart, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, uploadId: multipartId, parts, title, type: "Movie", email: "admin" }) });
        if (!fr.ok) throw new Error("Could not complete upload");
      }
      setStagedFile(null); setStagedTitle(""); load(); activity.reload();
    } catch (e: any) { setErr(e.message || "Upload failed."); }
    setUploading(false);
  };

  const useInCreate = (item: Item) => {
    // CreateModal listens for this, then calls migrate (Worker) R2A -> R2
    window.dispatchEvent(new CustomEvent("arsenal:pick-for-create", { detail: item }));
    closeAll();
  };
  const clearItem = async (itemId: string) => {
    if (!confirm("Clear this item from Arsenal?")) return;
    await fetch(ARSENAL_ENDPOINTS.clear, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId }) });
    load(); activity.reload();
  };

  const filtered = items.filter((it) => !search || it.title.toLowerCase().includes(search.toLowerCase()));
  const daysLeft = (ts?: number | null) => {
    const d = arsenalDaysLeft(ts);
    if (d === null) return "";
    return d <= 0 ? "Clearing soon" : `${d}d left`;
  };

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

  /* ---------- SHARE ---------- */
  if (id === "share-arsenal") {
    // Receiver page lives at /(dashboard)/movie-upload-portal - see tree, NOT inside control-center-page.
    // NOT /arsenal, NOT a drawer screen - Register was removed from Admin drawer on purpose.
    const inviteLink = `${window.location.origin}/movie-upload-portal${email ? `?email=${encodeURIComponent(email)}` : ""}`;
    return (
      <div className="arsenal-stack">
        <p className="arsenal-hint">Share Arsenal with a receiver. They open the upload portal, register with email + code, then they can upload to your Arsenal.</p>
        <input className="arsenal-input" placeholder="Receiver email (optional, pre-fills link)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="arsenal-btn is-ghost" onClick={() => { navigator.clipboard?.writeText(inviteLink); setErr(""); }}>Copy invite link</button>
        <button className="arsenal-btn" onClick={() => window.open(inviteLink, "_blank", "noopener")}>Open Receiver Page ↗</button>
        <p className="arsenal-hint" style={{ wordBreak: "break-all" }}>{inviteLink}</p>
        {err ? <p className="arsenal-err">{err}</p> : null}
        <button className="arsenal-btn is-ghost" onClick={back}>Back</button>
      </div>
    );
  }

  /* ---------- LIST (default) ---------- */
  return (
    <div className="arsenal-stack">
      <div className="arsenal-actions" style={{ marginTop: 0 }}>
        <label className="arsenal-btn-dash" style={{ cursor: "pointer" }}>
          {stagedFile ? `Staged: ${stagedFile.name}` : "+ Select movie file to stage"}
          <input type="file" accept="video/*" hidden onChange={(e) => onFile(e.target.files?.[0])} disabled={uploading} />
        </label>
        {stagedFile ? (
          <>
            <p className="arsenal-hint">🟡 STAGED — not uploading yet. Put the title below.</p>
            <input className="arsenal-input" placeholder="Movie title * (you must type this)" value={stagedTitle} onChange={(e) => setStagedTitle(e.target.value)} autoFocus />
            <button className="arsenal-btn" onClick={uploadStaged} disabled={!stagedTitle.trim() || uploading}>Upload staged movie</button>
            <button className="arsenal-btn is-ghost" onClick={() => { setStagedFile(null); setStagedTitle(""); }}>Cancel staged file</button>
          </>
        ) : null}
        {err ? <p className="arsenal-err">{err}</p> : null}
        {uploading ? <div className="arsenal-progress-track"><div className="arsenal-progress-fill" style={{ width: `${progress}%` }} /></div> : null}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="arsenal-btn-toggle" onClick={() => open("share-arsenal", {})}>Share Arsenal</button>
        <button className="arsenal-btn-toggle" onClick={() => window.open("/movie-upload-portal", "_blank", "noopener")}>Open Receiver Page ↗</button>
      </div>
      <p className="arsenal-section-label">Arsenal items • auto-clear in 90 days</p>
      {loading ? <div className="arsenal-spinner" /> : err ? <p className="arsenal-err">{err}</p> : filtered.length === 0 && !search ? <div className="arsenal-empty">Arsenal is empty.<br />Upload a movie, or share it with a receiver.</div> : (
        <div className="arsenal-list">{filtered.map((it) => (
          <div key={it.id} className="arsenal-card">
            <div className="arsenal-card-top"><b>{it.title}</b><span className={`arsenal-badge ${it.status === "published" ? "published" : "staged"}`}>{it.status ?? "staged"}</span></div>
            <span className="arsenal-meta">{it.type ?? "Movie"} • <span className="arsenal-soon">{daysLeft(it.autoClearAt)}</span>{it.email ? ` • ${it.email}` : ""}</span>
            <div className="arsenal-row">
              <button className="arsenal-btn-primary" onClick={() => useInCreate(it)}>Use in Create</button>
              <button className="arsenal-btn-ghost" onClick={() => clearItem(it.id)}>Clear</button>
            </div>
          </div>
        ))}</div>
      )}
      <input className="arsenal-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <p className="arsenal-section-label">All activity • Drive monitor • Receivers</p>
      {activity.loading ? <div className="arsenal-spinner" /> : <QueueHistory items={activity.items.map((x) => ({ ...x, status: x.status as any }))} />}
      <button className="arsenal-btn is-ghost" onClick={() => activity.reload()}>Refresh activity</button>
    </div>
  );
}

export { ArsenalBody };

