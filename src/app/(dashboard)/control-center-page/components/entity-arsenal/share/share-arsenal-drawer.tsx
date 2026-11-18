"use client";
import { useState, useRef } from "react";
import { RecieverRegister } from "../reciever/reciever-register";
import { uploadToArsenal } from "../arsenal-upload";
import { saveArsenalItem } from "../save-arsenal-item";
import { arsenalKeyForSingle, arsenalKeyForEpisode } from "../arsenal-constants";
import type { ArsenalType } from "../arsenal-types";

// src/app/(dashboard)/control-center-page/components/entity-arsenal/share/share-arsenal-drawer.tsx
// Receiver-only upload body. NO own overlay, NO own header, NO own OTP flow.
// ArsenalDrawer already gives it: overlay + sheet + header + safe-area + Back/X.
// Flow: ArsenalDrawer -> RecieverRegister (email+OTP inside) -> openShare("share-arsenal", { email }) -> THIS file.
// Receiver NEVER sees live movies, NEVER gets live CDN links, NEVER touches /movies.

export function ShareArsenalDrawer({ payload, onClose }: { payload?: { email?: string } | null; onClose?: () => void }) {
  // Email comes from OTP step via drawer store payload. If someone opens Share directly with no email, show Register.
  const verifiedEmail = payload?.email ?? null;
  const [type, setType] = useState<ArsenalType>("Single");
  const [titleHint, setTitleHint] = useState("");
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [epFiles, setEpFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);
  const singleRef = useRef<HTMLInputElement>(null);
  const epsRef = useRef<HTMLInputElement>(null);

  if (!verifiedEmail) {
    return <RecieverRegister />;
  }

  const submit = async () => {
    if (!titleHint.trim()) { setErr("Add a title hint so admin knows what this is"); return; }
    if (type === "Single" && !singleFile) { setErr("Pick the movie file"); return; }
    if (type === "Series" && !epFiles.length) { setErr("Pick at least 1 episode file"); return; }
    setBusy(true); setErr(""); setProgress(0); setDoneId(null);
    const uploadId = crypto.randomUUID();
    const uploaderId = verifiedEmail.replace(/[^a-zA-Z0-9]/g, "_");
    try {
      if (type === "Single" && singleFile) {
        const key = arsenalKeyForSingle(uploaderId, uploadId, singleFile.name);
        setStatus(`Uploading ${singleFile.name}...`);
        await uploadToArsenal(singleFile, key, (p) => setProgress(p.percent));
        setStatus("Saving...");
        const saved = await saveArsenalItem({
          uploaderEmail: verifiedEmail, titleHint: titleHint.trim(), type: "Single",
          arsenalKey: key, fileSize: singleFile.size, mime: singleFile.type,
        });
        setDoneId(saved.id);
      } else {
        const episodes: Array<{ episodeNumber: number; title: string; arsenalKey: string; fileSize: number | null; mime: string }> = [];
        for (let i = 0; i < epFiles.length; i++) {
          const f = epFiles[i];
          const key = arsenalKeyForEpisode(uploaderId, uploadId, 1, i + 1, f.name);
          setStatus(`Uploading episode ${i + 1}/${epFiles.length}: ${f.name}...`);
          await uploadToArsenal(f, key, (p) => setProgress(Math.round(((i + p.percent / 100) / epFiles.length) * 100)));
          episodes.push({ episodeNumber: i + 1, title: f.name.replace(/\.[^.]+$/, ""), arsenalKey: key, fileSize: f.size, mime: f.type });
        }
        setStatus("Saving...");
        const saved = await saveArsenalItem({
          uploaderEmail: verifiedEmail, titleHint: titleHint.trim(), type: "Series", episodes,
          fileSize: epFiles.reduce((s, f) => s + f.size, 0),
        });
        setDoneId(saved.id);
      }
      setStatus("Done - admin will review it.");
    } catch (e: any) { setErr(e.message || "Upload failed"); }
    finally { setBusy(false); }
  };

  if (doneId) {
    return (
      <div className="arsenal-center">
        <span style={{ fontSize: 40 }}>✓</span>
        <h3 style={{ margin: 0 }}>Sent!</h3>
        <p className="arsenal-hint" style={{ margin: 0, fontSize: 13 }}>Admin will review it. Nothing is live yet.</p>
        <button onClick={() => onClose?.()} className="arsenal-btn-primary">Done</button>
      </div>
    );
  }

  return (
    <div className="arsenal-stack">
      <p className="arsenal-hint" style={{ margin: 0, fontSize: 13 }}>Staging only. Admin reviews before anything goes live.</p>
      <span style={{ fontSize: 13, color: "hsl(var(--text) / 0.7)" }}>Verified: <b>{verifiedEmail}</b></span>
      <div style={{ display: "flex", gap: 8 }}>
        {(["Single", "Series"] as ArsenalType[]).map((t) => (
          <button key={t} onClick={() => setType(t)} disabled={busy} className={`arsenal-btn-toggle ${type === t ? "active" : ""}`}>
            {t === "Single" ? "Single Movie" : "Series"}
          </button>
        ))}
      </div>
      <input value={titleHint} onChange={(e) => setTitleHint(e.target.value)} placeholder="Title hint - e.g. My Action Film" className="arsenal-input" />
      {type === "Single" ? (
        <>
          <input ref={singleRef} type="file" accept="video/*" hidden onChange={(e) => setSingleFile(e.target.files?.[0] || null)} />
          <button onClick={() => singleRef.current?.click()} disabled={busy} className="arsenal-btn-dash">
            {singleFile ? `✓ ${singleFile.name}` : "Pick movie file"}
          </button>
        </>
      ) : (
        <>
          <input ref={epsRef} type="file" accept="video/*" multiple hidden onChange={(e) => setEpFiles(Array.from(e.target.files || []))} />
          <button onClick={() => epsRef.current?.click()} disabled={busy} className="arsenal-btn-dash">
            {epFiles.length ? `✓ ${epFiles.length} episode(s) - ${epFiles.map(f => f.name).join(", ").slice(0, 80)}` : "Pick episode files (in order)"}
          </button>
          <span className="arsenal-hint">Files are ordered Ep 1, Ep 2... in the order you pick them. Season 1 only.</span>
        </>
      )}
      {busy && (
        <div className="arsenal-stack" style={{ gap: 6 }}>
          <div className="arsenal-progress-track"><div className="arsenal-progress-fill" style={{ width: `${progress}%` }} /></div>
          <span className="arsenal-progress-label">{progress}% - {status}</span>
        </div>
      )}
      {!busy && status && <span style={{ fontSize: 13 }}>{status}</span>}
      {err && <span className="arsenal-err">{err}</span>}
      <button onClick={submit} disabled={busy} className="arsenal-btn-primary">
        {busy ? "Uploading..." : "Send to Arsenal"}
      </button>
    </div>
  );
}

