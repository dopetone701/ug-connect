// src/app/(dashboard)/control-center-page/components/create-movie/parts/single-movie-uploads.tsx
"use client";
import React, { useState } from "react";
import UploadBox from "./upload-box";

interface PreviewItem {
  id: string;
  file: File;
  objectUrl: string;
  progress?: number;
}

interface SingleMovieUploadsProps {
  seriesMode: boolean;
  mainRef: React.RefObject<HTMLInputElement | null>;
  coverRef: React.RefObject<HTMLInputElement | null>;
  movieUrl: string | null;
  coverUrl: string | null;
  mainProg: number;
  coverProg: number;
  previewFiles: File[];
  onMainChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPreviewsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // optional new props if you already migrated to drafts
  previewDrafts?: any[];
  setPreviewDrafts?: any;
}

export default function SingleMovieUploads({
  seriesMode,
  mainRef,
  coverRef,
  movieUrl,
  coverUrl,
  mainProg,
  coverProg,
  previewFiles,
  onMainChange,
  onCoverChange,
  onPreviewsChange,
  previewDrafts,
  setPreviewDrafts,
}: SingleMovieUploadsProps) {
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  // Convert File[] to cube items for display
  const items = previewDrafts || previewFiles.map((f, i) => ({
    id: `preview-${i}`,
    file: f,
    objectUrl: URL.createObjectURL(f),
  }));

  const removePreview = (idx: number) => {
    if (previewDrafts && setPreviewDrafts) {
      const item = previewDrafts[idx];
      if (item?.objectUrl) URL.revokeObjectURL(item.objectUrl);
      setPreviewDrafts((prev: any[]) => prev.filter((_, i) => i !== idx));
    } else {
      // For File[] mode, trigger parent to remove - we simulate by rebuilding input
      // Simplest: create new DataTransfer without that file
      const dt = new DataTransfer();
      previewFiles.forEach((f, i) => { if (i !== idx) dt.items.add(f); });
      // create synthetic event
      const input = document.createElement("input");
      input.files = dt.files;
      onPreviewsChange({ target: input } as any);
    }
  };

  return (
    <>
      <div className="cc-upload-grid">
        <UploadBox
          label="🎬 MAIN MOVIE *"
          accept="video/*"
          inputRef={mainRef}
          onChange={onMainChange}
          progress={mainProg}
          style={seriesMode ? { display: "none" } : undefined}
        >
          {movieUrl && <video src={movieUrl} controls style={{ width: "100%", marginTop: 10, borderRadius: 8, maxHeight: 180 }} />}
        </UploadBox>

        <UploadBox
          label={seriesMode ? "🖼️ SERIES COVER ART *" : "🖼️ COVER ART *"}
          accept="image/*"
          inputRef={coverRef}
          onChange={onCoverChange}
          progress={coverProg}
          style={seriesMode ? { gridColumn: "1/-1" } : undefined}
        >
          {coverUrl && <img src={coverUrl} alt="cover" style={{ width: "100%", marginTop: 10, borderRadius: 8, maxHeight: 180, objectFit: "cover" }} />}
        </UploadBox>

        {/* OLD HIDDEN PREVIEWS BOX - keep hidden but file input still works for backward compat */}
        <div style={{ display: "none" }}>
          <input type="file" accept="video/*" multiple onChange={onPreviewsChange} />
        </div>
      </div>

      {/* NEW CUBES 72x72 UNLIMITED GLOBAL PREVIEWS - VISIBLE FOR ALL TYPES */}
      <div style={{ marginTop: 16, background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ margin: 0 }}>🎞️ Global Previews - {items.length} (Random in Reels feed)</h4>
          <label className="cc-btn primary" style={{ fontSize: 12, cursor: "pointer" }}>
            ➕ Add Preview
            <input type="file" accept="video/*" multiple style={{ display: "none" }} onChange={onPreviewsChange} />
          </label>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {items.map((pv: any, idx: number) => {
            const id = pv.id || `preview-${idx}`;
            const isCollapsed = collapsedMap[id] ?? true;
            const url = pv.objectUrl || (pv.file ? URL.createObjectURL(pv.file) : null);
            return (
              <div
                key={id}
                onClick={() => isCollapsed && setCollapsedMap(m => ({ ...m, [id]: false }))}
                style={{
                  width: isCollapsed ? 72 : 300,
                  height: isCollapsed ? 72 : 220,
                  background: isCollapsed ? "linear-gradient(135deg, #0f172a, #1e293b)" : "hsl(var(--bg))",
                  border: isCollapsed ? "2px solid #22d3ee" : "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  cursor: isCollapsed ? "pointer" : "default",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {isCollapsed ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{idx + 1}</span>
                    <span style={{ fontSize: 8, color: "#22d3ee", fontWeight: 700 }}>PREV</span>
                  </div>
                ) : (
                  <div style={{ width: "100%", padding: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <small style={{ fontWeight: 800, color: "#22d3ee" }}>#{idx + 1}</small>
                      <button onClick={() => setCollapsedMap(m => ({ ...m, [id]: true }))} style={{ background: "#1e293b", color: "#fff", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11 }}>Done ↘</button>
                    </div>
                    {url && <video src={url} controls style={{ width: "100%", borderRadius: 8, background: "#000", maxHeight: 130 }} />}
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button onClick={() => removePreview(idx)} style={{ flex: 1, background: "#2a1a1a", color: "#ff6666", border: "none", padding: "6px", borderRadius: 6, fontSize: 11 }}>🗑️ Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {items.length === 0 && <small style={{ color: "#666" }}>No global previews — Add unlimited. These shuffle random in reels so users don't get bored. For series, episode individual previews also shuffle in global reels.</small>}
      </div>
    </>
  );
}
