"use client";
import { useRef, useState } from "react";
import { QueueHistory, type QueueItem } from "./arsenal-queue";

// arsenal-reciever-body.tsx - RECEIVER ONLY.
// Lives in: src/app/(dashboard)/control-center-page/components/entity-arsenal/
// Used by: movie-upload-portal/page.tsx -> arsenal-reciever-page.tsx -> THIS file
// No share, no search, no X-close. Top bar lives in arsenal-reciever-page.tsx, NOT here.
// Flow: Email gate -> OTP -> Select file + Title + Type -> Add to queue -> Upload (manual) -> History

type LocalItem = QueueItem & { file?: File };

export default function ArsenalRecieverBody() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [authed, setAuthed] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [queue, setQueue] = useState<LocalItem[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"Movie" | "Series">("Movie");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ---------- GATE ---------- */
  const sendOtp = async () => {
    if (!email.includes("@")) { setErr("Enter a valid email."); return; }
    setSending(true); setErr("");
    try {
      const r = await fetch("/api/arsenal/otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!r.ok) throw new Error();
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
      if (!r.ok) throw new Error();
      setAuthed(true);
    } catch { setErr("Wrong code. Try again."); }
    setSending(false);
  };

  /* ---------- QUEUE ---------- */
  // NO auto-upload on select. Select only stages the file.
  const onSelectFile = (f: File | undefined) => { if (f) setPendingFile(f); };

  const addToQueue = () => {
    if (!pendingFile) { setErr("Select a movie file first."); return; }
    if (!title.trim()) { setErr("Enter movie title."); return; }
    if (queue.length >= 10) { setErr("Queue is full - max 10. Upload or remove one first."); return; }
    setQueue((q) => [...q, { id: `${Date.now()}-${Math.random()}`, file: pendingFile, title: title.trim(), type, fileName: pendingFile.name, email, status: "idle", progress: 0, createdAt: Date.now() }]);
    setPendingFile(null); setTitle("");
    if (fileRef.current) fileRef.current.value = "";
    setErr("");
  };

  const uploadOne = (item: LocalItem) => new Promise<void>((resolve) => {
    if (!item.file) { resolve(); return; }
    setQueue((q) => q.map((x) => x.id === item.id ? { ...x, status: "uploading", progress: 0, error: undefined } : x));
    const fd = new FormData();
    fd.append("file", item.file);
    fd.append("title", item.title);
    fd.append("type", item.type);
    fd.append("email", email);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/arsenal/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setQueue((q) => q.map((x) => x.id === item.id ? { ...x, progress: Math.round((e.loaded / e.total) * 100) } : x));
    };
    xhr.onload = () => {
      setQueue((q) => q.map((x) => x.id === item.id ? { ...x, status: xhr.status < 300 ? "success" : "failed", progress: xhr.status < 300 ? 100 : x.progress, error: xhr.status < 300 ? undefined : "Upload failed" } : x));
      resolve();
    };
    xhr.onerror = () => {
      setQueue((q) => q.map((x) => x.id === item.id ? { ...x, status: "failed", error: "Network failed" } : x));
      resolve();
    };
    xhr.send(fd);
  });

  // Upload in a row, one by one, like YouTube - NOT parallel, NOT auto.
  const uploadAll = async () => {
    for (const item of queue) {
      if (item.status === "idle" || item.status === "failed") await uploadOne(item);
    }
  };

  const retry = (it: QueueItem) => {
    const full = queue.find((x) => x.id === it.id);
    if (full) uploadOne(full);
  };
  const remove = (id: string) => setQueue((q) => q.filter((x) => x.id !== id));

  /* ---------- GATE UI ---------- */
  if (!authed) {
    return (
      <div className="ars-gate">
        <h2>Arsenal Upload</h2>
        <p className="arsenal-hint">Enter your email. We send a 6-digit code. Then you can upload.</p>
        <input className="arsenal-input" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {!otpSent ? (
          <button className="arsenal-btn" onClick={sendOtp} disabled={sending}>{sending ? "Sending..." : "Send code"}</button>
        ) : (
          <>
            <div className="arsenal-otp-row">
              {otp.map((d, i) => (
                <input key={i} className="arsenal-otp-box" maxLength={1} inputMode="numeric" value={d}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                    const n = [...otp]; n[i] = v; setOtp(n);
                    if (v) document.getElementById(`ars-r-otp-${i + 1}`)?.focus();
                  }}
                  id={`ars-r-otp-${i}`} />
              ))}
            </div>
            <button className="arsenal-btn" onClick={verifyOtp} disabled={sending}>{sending ? "Verifying..." : "Verify & continue"}</button>
            <button className="arsenal-btn is-ghost" onClick={() => setOtpSent(false)}>Change email</button>
          </>
        )}
        {err ? <p className="arsenal-err">{err}</p> : null}
      </div>
    );
  }

  /* ---------- QUEUE UI ---------- */
  const waiting = queue.filter((x) => x.status === "idle" || x.status === "failed").length;

  return (
    <div className="ars-reciever">
      <p className="arsenal-hint">Signed in as <b style={{ color: "hsl(var(--text))" }}>{email}</b> • Queue {queue.length}/10</p>

      {/* ADD - select, title, type, THEN add. No auto-upload. */}
      <label className="arsenal-btn-dash" style={{ cursor: "pointer" }}>
        {pendingFile ? `Selected: ${pendingFile.name}` : "+ Select movie file"}
        <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => onSelectFile(e.target.files?.[0])} />
      </label>
      <input className="arsenal-input" placeholder="Movie title *" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="ars-type-row">
        <button className={`arsenal-btn-toggle ${type === "Movie" ? "active" : ""}`} onClick={() => setType("Movie")}>Movie</button>
        <button className={`arsenal-btn-toggle ${type === "Series" ? "active" : ""}`} onClick={() => setType("Series")}>Series</button>
      </div>
      <button className="arsenal-btn" onClick={addToQueue} disabled={!pendingFile}>Add to queue</button>
      {err ? <p className="arsenal-err">{err}</p> : null}
      <button className="arsenal-btn is-ghost" onClick={uploadAll} disabled={waiting === 0}>Upload all in queue ({waiting})</button>

      {/* HISTORY - monitor activity. Green = success, Red = failed + Retry. */}
      <p className="arsenal-section-label">Your uploads • History</p>
      <QueueHistory items={queue} onRetry={retry} onUpload={(it) => { const f = queue.find((x) => x.id === it.id); if (f) uploadOne(f); }} onRemove={remove} />
    </div>
  );
}

