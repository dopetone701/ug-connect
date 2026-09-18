"use client";
import { useState, useEffect, useCallback } from "react";

// 👇 REPLACE THIS WITH YOUR WORKER URL - from Workers & Pages > app-logo-manager-api > Overview
const WORKER_URL = "https://app-logo-manager-api.connectu89.workers.dev";

export default function AppLogoManager() {
  const [liveUrl, setLiveUrl] = useState("/logo.png");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("");

  // Load current live logo from D1 via Worker
  const loadLive = useCallback(async () => {
    try {
      const res = await fetch(`${WORKER_URL}`, { cache: "no-store" });
      const data = await res.json();
      if (data.url) setLiveUrl(data.url);
    } catch (e) {
      console.log("Failed to load live logo", e);
    }
  }, []);

  useEffect(() => {
    loadLive();
  }, [loadLive]);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStatus("Please upload an image file");
      return;
    }

    // Instant preview - no questions about size
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setUploading(true);
    setStatus("Uploading to Cloudflare R2...");

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(WORKER_URL, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      const data = await res.json();

      setLiveUrl(data.url);
      setStatus(`BOOM! Live everywhere. ${new Date().toLocaleTimeString()}`);

      // Force reload all images in app
      setTimeout(() => {
        setPreview(null);
      }, 1500);

    } catch (err: any) {
      setStatus("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="logo-manager-wrap">
      <h2 className="lm-title">App Logo Manager</h2>
      <p className="lm-sub">Upload once - updates Web + Android instantly. Any size, any format. No coding.</p>

      <div className="lm-grid">
        <div className="lm-card">
          <div className="lm-label">CURRENT LIVE LOGO (From R2 + D1)</div>
          <img src={liveUrl} alt="Live Logo" className="lm-img" key={liveUrl} />
          <div className="lm-url">{liveUrl}</div>
          <button className="lm-btn small" onClick={loadLive}>Refresh</button>
        </div>

        {preview && (
          <div className="lm-card">
            <div className="lm-label">NEW PREVIEW</div>
            <img src={preview} alt="Preview" className="lm-img" />
          </div>
        )}
      </div>

      <div
        className={`lm-drop ${dragOver? "drag" : ""} ${uploading? "uploading" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <input
          type="file"
          id="logo-file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
        />
        <label htmlFor="logo-file" className="lm-drop-label">
          {uploading? (
            <>⏳ Uploading...</>
          ) : (
            <>
              <span className="lm-drop-icon">📤</span>
              <span>Drop ANY image here or click to browse</span>
              <span className="lm-drop-hint">PNG, JPG, WebP - any size works, we auto-handle it</span>
            </>
          )}
        </label>
      </div>

      {status && <div className="lm-status">{status}</div>}

      <style>{`
       .logo-manager-wrap { background: #0f1115; border: 1px solid #222; border-radius: 16px; padding: 24px; color: #fff; }
       .lm-title { font-size: 20px; font-weight: 800; margin: 0; }
       .lm-sub { color: #888; font-size: 13px; margin: 6px 0 20px; }
       .lm-grid { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
       .lm-card { background: #181a20; border: 1px solid #2a2d36; border-radius: 12px; padding: 16px; min-width: 220px; }
       .lm-label { font-size: 11px; color: #777; letter-spacing: 0.5px; margin-bottom: 10px; font-weight: 600; }
       .lm-img { width: 180px; height: 180px; object-fit: contain; background: #fff; border-radius: 12px; padding: 12px; display: block; }
       .lm-url { font-size: 10px; color: #555; margin-top: 8px; word-break: break-all; max-width: 180px; }
       .lm-btn.small { margin-top: 10px; background: #222; color: #fff; border: 1px solid #333; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
       .lm-drop { border: 2px dashed #333; border-radius: 14px; padding: 30px; text-align: center; background: #12141a; transition: 0.2s; cursor: pointer; }
       .lm-drop.drag { border-color: #22c55e; background: #14201a; }
       .lm-drop.uploading { opacity: 0.6; pointer-events: none; }
       .lm-drop-label { display: flex; flex-direction: column; gap: 8px; cursor: pointer; align-items: center; }
       .lm-drop-icon { font-size: 28px; }
       .lm-drop-hint { font-size: 12px; color: #666; }
       .lm-status { margin-top: 14px; background: #1a2e1a; border: 1px solid #2a4a2a; color: #7fdb7f; padding: 10px 14px; border-radius: 10px; font-size: 13px; }
      `}</style>
    </div>
  );
}
