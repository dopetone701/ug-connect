// edit-movie/parts/single-movie-uploads.tsx - CUBES 72x72 like series tiles
"use client";
import { useState } from "react";
import UploadBox from "./upload-box";
import { getR2Url } from "../constants";
import type { PreviewVideoDraft } from "../hooks/use-edit-movie-upload";

type Props = {
  coverPreview: string | null;
  moviePreview: string | null;
  currentCoverKey: string | null;
  currentMainKey: string | null;
  coverProg: number;
  mainProg: number;
  previewVideos: PreviewVideoDraft[];
  setPreviewVideos: React.Dispatch<React.SetStateAction<PreviewVideoDraft[]>>;
  coverRef: React.RefObject<HTMLInputElement | null>;
  mainRef: React.RefObject<HTMLInputElement | null>;
  onCoverFile: (file: File) => void;
  onMainFile: (file: File) => void;
  getR2Url: (k?: string | null) => string | null;
};

export default function SingleMovieUploads({
  coverPreview,
  moviePreview,
  currentCoverKey,
  currentMainKey,
  coverProg,
  mainProg,
  previewVideos,
  setPreviewVideos,
  coverRef,
  mainRef,
  onCoverFile,
  onMainFile,
}: Props) {
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setCollapsedMap(m => ({ ...m, [id]: !(m[id] ?? true) ? true : false }));
    // first time undefined => collapsed, so toggle to open
    setCollapsedMap(prev => {
      const isCurrentlyCollapsed = prev[id] ?? true;
      return { ...prev, [id]: !isCurrentlyCollapsed };
    });
  };

  return (
    <>
      <div className="cc-upload-grid">
        <UploadBox
          label="🎬 MAIN VIDEO"
          hasExisting={!!currentMainKey}
          existingKey={currentMainKey}
          onDownload={() => currentMainKey && window.open((getR2Url(currentMainKey) || "") + "?download=1", "_blank")}
          onFileChange={onMainFile}
          progress={mainProg}
          preview={moviePreview || ""}
          isVideo
          inputRef={mainRef}
        />
        <UploadBox
          label="🖼️ COVER"
          hasExisting={!!currentCoverKey}
          existingKey={currentCoverKey}
          onDownload={() => currentCoverKey && window.open((getR2Url(currentCoverKey) || "") + "?download=1", "_blank")}
          onFileChange={onCoverFile}
          progress={coverProg}
          preview={coverPreview || ""}
          inputRef={coverRef}
        />
      </div>

      {/* GLOBAL PREVIEWS - CUBES 72x72 - MINIMIZED BY DEFAULT - SAME LOGIC AS SERIES */}
      <div style={{ marginTop: 20, background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ margin: 0 }}>🎞️ Global Previews - {previewVideos.length} (Random in Reels)</h4>
          <button
            onClick={() => setPreviewVideos(p => [...p, { id: crypto.randomUUID(), existingKey: null, file: null, objectUrl: null, progress: 0, status: "idle" }])}
            className="cc-btn primary"
            style={{ fontSize: 12 }}
          >
            ➕ Add Preview
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {previewVideos.map((pv, idx) => {
            const isCollapsed = collapsedMap[pv.id] ?? true;
            return (
              <div
                key={pv.id}
                onClick={() => isCollapsed && setCollapsedMap(m => ({ ...m, [pv.id]: false }))}
                style={{
                  width: isCollapsed ? 72 : 320,
                  height: isCollapsed ? 72 : 240,
                  background: isCollapsed ? "linear-gradient(135deg, #0f172a, #1e293b)" : "hsl(var(--bg))",
                  border: isCollapsed ? "2px solid #22d3ee" : "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  cursor: isCollapsed ? "pointer" : "default",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                  boxShadow: isCollapsed ? "0 0 0 2px #22d3ee22" : "none",
                }}
              >
                {isCollapsed ? (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{idx + 1}</span>
                      <span style={{ fontSize: 8, color: "#22d3ee", fontWeight: 700, marginTop: 2 }}>PREV</span>
                    </div>
                    {pv.existingKey && <div style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, background: "#22c55e", borderRadius: 999, boxShadow: "0 0 6px #22c55e" }} />}
                    {pv.progress > 0 && pv.progress < 100 && <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: `${pv.progress}%`, background: "#22d3ee" }} />}
                    {!pv.existingKey && !pv.file && <div style={{ position: "absolute", bottom: 2, left: 0, right: 0, textAlign: "center", fontSize: 7, color: "#ff6666" }}>EMPTY</div>}
                  </>
                ) : (
                  <div style={{ width: "100%", padding: 8, display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <small style={{ fontWeight: 800, color: "#22d3ee" }}>#{idx + 1} Preview</small>
                      <button onClick={() => setCollapsedMap(m => ({ ...m, [pv.id]: true }))} style={{ background: "#1e293b", color: "#fff", border: "1px solid #334155", borderRadius: 6, padding: "3px 8px", fontSize: 11 }}>Done ↘</button>
                    </div>

                    {pv.existingKey && !pv.file && <video src={getR2Url(pv.existingKey) || ""} controls style={{ width: "100%", borderRadius: 8, background: "#000", maxHeight: 130 }} />}
                    {pv.file && pv.objectUrl && <video src={pv.objectUrl} controls style={{ width: "100%", borderRadius: 8, background: "#000", maxHeight: 130 }} />}
                    {!pv.existingKey && !pv.file && <div style={{ padding: 20, background: "#111", borderRadius: 8, fontSize: 12, color: "#888", textAlign: "center", border: "1px dashed #333" }}>No file - Add</div>}

                    {pv.progress > 0 && <div style={{ marginTop: 6 }}><div style={{ height: 4, background: "#1e293b", borderRadius: 2 }}><div style={{ width: pv.progress + "%", height: "100%", background: "#22d3ee", borderRadius: 2 }}></div></div><small style={{ color: "#888" }}>{pv.progress}% {pv.status}</small></div>}

                    <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 8 }}>
                      <label style={{ flex: 1, background: "#0f172a", color: "#22d3ee", padding: "6px", borderRadius: 6, fontSize: 11, textAlign: "center", cursor: "pointer", border: "1px solid #22d3ee33" }}>
                        {pv.existingKey ? "🔄 Replace" : "📁 Add"}
                        <input type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => {
                          const f = e.target.files?.[0]; if (f) { if (pv.objectUrl) URL.revokeObjectURL(pv.objectUrl); const url = URL.createObjectURL(f);
                            setPreviewVideos(prev => prev.map(x => x.id === pv.id ? { ...x, file: f, objectUrl: url, progress: 0, status: "idle" as const } : x));
                          }
                        }} />
                      </label>
                      <button onClick={() => { if (pv.objectUrl) URL.revokeObjectURL(pv.objectUrl); setPreviewVideos(prev => prev.filter(x => x.id !== pv.id)); }} style={{ background: "#2a1a1a", color: "#ff6666", border: "1px solid #ff444433", padding: "6px 10px", borderRadius: 6, fontSize: 11 }}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {previewVideos.length === 0 && <div style={{ marginTop: 8, padding: 12, background: "#111", borderRadius: 8, textAlign: "center" }}><small style={{ color: "#666" }}>No global previews — Click ➕ Add Preview. These shuffle random in reels feed to avoid boredom.</small></div>}
        <small style={{ color: "#666", fontSize: 10, marginTop: 8, display: "block" }}>💡 Cubes numbered, click to play, Done to minimize. All belong to movie globally. Episode individual previews are in tiles below + also shuffle in global reels.</small>
      </div>
    </>
  );
}
