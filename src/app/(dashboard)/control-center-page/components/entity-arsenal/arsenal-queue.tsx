"use client";
import { useEffect, useState } from "react";

// arsenal-queue.tsx - SHARED queue + history. Used by Admin body AND Receiver body.
// Same UI, same dots, same retry. Admin sees ALL activity (passed to Drive via /api/arsenal/activity).
// Receiver sees ONLY his own (filtered by email on server).

export type QueueItem = {
  id: string;
  title: string;
  type: "Movie" | "Series";
  fileName: string;
  email?: string;
  status: "idle" | "uploading" | "success" | "failed";
  progress: number;
  error?: string;
  createdAt?: number;
};

export function QueueHistory({ items, onRetry, onUpload, onRemove }: {
  items: QueueItem[];
  onRetry?: (it: QueueItem) => void;
  onUpload?: (it: QueueItem) => void;
  onRemove?: (id: string) => void;
}) {
  if (!items.length) return <div className="arsenal-empty">No uploads yet.</div>;
  return (
    <div className="ars-queue">{items.map((it) => (
      <div key={it.id} className="ars-queue-item">
        <span className={`ars-dot ${it.status === "success" ? "success" : it.status === "failed" ? "failed" : it.status === "uploading" ? "uploading" : ""}`} />
        <div className="ars-queue-info">
          <div className="ars-queue-title">{it.title}</div>
          <div className="ars-queue-meta">{it.type} • {it.fileName}{it.email ? ` • ${it.email}` : ""} • {it.status === "success" ? "Uploaded ✓" : it.status === "failed" ? `Failed • ${it.error ?? ""}` : it.status === "uploading" ? `Uploading... ${it.progress}%` : "Waiting in queue"}</div>
          {it.status === "uploading" ? <div className="ars-queue-bar"><div className="ars-queue-fill" style={{ width: `${it.progress}%` }} /></div> : null}
        </div>
        {it.status === "failed" && onRetry ? <button className="arsenal-btn-primary" onClick={() => onRetry(it)}>Retry</button> : null}
        {it.status === "idle" && onUpload ? <button className="arsenal-btn-ghost" onClick={() => onUpload(it)}>Upload</button> : null}
        {it.status !== "uploading" && onRemove ? <button className="arsenal-btn-ghost" onClick={() => onRemove(it.id)}>✕</button> : null}
      </div>
    ))}</div>
  );
}

// Admin monitor: fetch ALL activity (Drive-passed). Call this in Admin body.
export function useArsenalActivity() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/arsenal/activity");
      const j = await r.json().catch(() => ({}));
      const list = Array.isArray(j.items) ? j.items : Array.isArray(j) ? j : [];
      setItems(list.map((x: any) => ({ id: x.id, title: x.title, type: x.type ?? "Movie", fileName: x.fileName ?? x.fileKey ?? "", email: x.email, status: x.status ?? "success", progress: 100, createdAt: x.createdAt })));
    } catch { /* keep old */ }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  return { items, loading, reload: load };
}

