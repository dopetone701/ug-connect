// create-movie/parts/global-preview-grid.tsx - CUBES 72x72 unlimited - CREATE VERSION
"use client";
import { useState } from "react";
import { getR2Url } from "../constants";

// Don't import from edit hook - define own to avoid wrong import
type PreviewDraft = {
  id: string;
  existingKey?: string | null;
  file: File | null;
  objectUrl: string | null;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
};

type Props = {
  previews: PreviewDraft[];
  setPreviews: React.Dispatch<React.SetStateAction<PreviewDraft[]>>;
};

export default function GlobalPreviewGrid({ previews, setPreviews }: Props) {
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});

  return (
    <div style={{ marginTop: 20, background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h4 style={{ margin: 0 }}>🎞️ Global Previews - {previews.length} (Random in Reels)</h4>
        <button
          onClick={() => setPreviews(p => [...p, { id: crypto.randomUUID(), existingKey: null, file: null, objectUrl: null, progress: 0, status: "idle" } as PreviewDraft])}
          className="cc-btn primary"
          style={{ fontSize: 12 }}
        >
          ➕ Add Preview
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {previews.map((pv: any, idx: number) => {
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
              }}
            >
              {isCollapsed ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{idx + 1}</span>
                    <span style={{ fontSize: 8, color: "#22d3ee", fontWeight: 700 }}>PREV</span>
                  </div>
                  {pv.existingKey && <div style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, background: "#22c55e", borderRadius: 999 }} />}
                  {pv.progress > 0 && pv.progress < 100 && <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: `${pv.progress}%`, background: "#22d3ee" }} />}
                </>
              ) : (
                <div style={{ width: "100%", padding: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <small style={{ fontWeight: 800, color: "#22d3ee" }}>#{idx + 1} Preview</small>
                    <button onClick={() => setCollapsedMap(m => ({ ...m, [pv.id]: true }))} style={{ background: "#1e293b", color: "#fff", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11 }}>Done ↘</button>
                  </div>
                  {pv.file && pv.objectUrl && <video src={pv.objectUrl} controls style={{ width: "100%", borderRadius: 8, background: "#000", maxHeight: 130 }} />}
                  {!pv.file && <div style={{ padding: 20, background: "#111", borderRadius: 8, fontSize: 12, color: "#888", textAlign: "center" }}>No file</div>}
                  {pv.progress > 0 && <div style={{ height: 4, background: "#1e293b", borderRadius: 2, marginTop: 6 }}><div style={{ width: pv.progress + "%", height: "100%", background: "#22d3ee" }}></div></div>}
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <label style={{ flex: 1, background: "#0f172a", color: "#22d3ee", padding: "6px", borderRadius: 6, fontSize: 11, textAlign: "center", cursor: "pointer", border: "1px solid #22d3ee33" }}>
                      {pv.existingKey ? "Replace" : "Add"}
                      <input type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => {
                        const f = e.target.files?.[0]; if (f) { if (pv.objectUrl) URL.revokeObjectURL(pv.objectUrl); const url = URL.createObjectURL(f);
                          setPreviews(prev => prev.map((x: any) => x.id === pv.id ? { ...x, file: f, objectUrl: url, progress: 0, status: "idle" } : x));
                        }
                      }} />
                    </label>
                    <button onClick={() => { if (pv.objectUrl) URL.revokeObjectURL(pv.objectUrl); setPreviews(prev => prev.filter((x: any) => x.id !== pv.id)); }} style={{ background: "#2a1a1a", color: "#ff6666", border: "none", padding: "6px 10px", borderRadius: 6, fontSize: 11 }}>🗑️</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {previews.length === 0 && <small style={{ color: "#666" }}>No global previews — Add unlimited. Shuffle random in reels to avoid boredom.</small>}
    </div>
  );
}
