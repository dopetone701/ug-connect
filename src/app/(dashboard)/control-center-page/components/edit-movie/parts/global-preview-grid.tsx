"use client";
import type { PreviewVideoDraft } from "../hooks/use-edit-movie-upload";
import { getR2Url } from "../constants";

type Props = {
  previews: PreviewVideoDraft[];
  setPreviews: React.Dispatch<React.SetStateAction<PreviewVideoDraft[]>>;
  collapsedMap: Record<string, boolean>;
  setCollapsedMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

export default function GlobalPreviewGrid({ previews, setPreviews, collapsedMap, setCollapsedMap }: Props) {
  const toggle = (id: string) => setCollapsedMap(m => ({ ...m, [id]: !m[id] }));

  return (
    <div style={{ marginTop: 16, background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h4 style={{ margin: 0 }}>🎞️ Global Previews - {previews.length} (Random in Reels)</h4>
        <button
          onClick={() => setPreviews(p => [...p, { id: crypto.randomUUID(), existingKey: null, file: null, objectUrl: null, progress: 0, status: "idle" }])}
          className="cc-btn primary"
          style={{ fontSize: 12, padding: "6px 12px" }}
        >
          ➕ Add Preview
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {previews.map((pv, idx) => {
          const isCollapsed = collapsedMap[pv.id] ?? true; // minimized by default like series
          return (
            <div
              key={pv.id}
              onClick={() => isCollapsed && toggle(pv.id)}
              style={{
                width: isCollapsed ? 72 : 320,
                height: isCollapsed ? 72 : 220,
                background: isCollapsed ? "linear-gradient(135deg, #0f172a, #1e3a5f)" : "hsl(var(--bg))",
                border: "2px solid hsl(var(--primary))",
                borderRadius: 12,
                cursor: isCollapsed ? "pointer" : "default",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                transition: "all 0.2s",
              }}
            >
              {isCollapsed ? (
                <>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{idx + 1}</span>
                  {pv.progress > 0 && pv.progress < 100 && <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: `${pv.progress}%`, background: "#22c55e" }} />}
                  {pv.existingKey && <div style={{ position: "absolute", top: 2, right: 2, width: 6, height: 6, background: "#22c55e", borderRadius: 999 }} />}
                </>
              ) : (
                <div style={{ width: "100%", padding: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <small style={{ fontWeight: 700 }}>Preview #{idx + 1}</small>
                    <button onClick={() => toggle(pv.id)} style={{ background: "#222", color: "#fff", border: "none", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>Minimize</button>
                  </div>
                  {pv.existingKey && !pv.file && <video src={getR2Url(pv.existingKey) || ""} controls style={{ width: "100%", borderRadius: 8, background: "#000", maxHeight: 140 }} />}
                  {pv.file && pv.objectUrl && <video src={pv.objectUrl} controls style={{ width: "100%", borderRadius: 8, background: "#000", maxHeight: 140 }} />}
                  {!pv.existingKey && !pv.file && <div style={{ padding: 20, background: "#111", borderRadius: 8, fontSize: 12, color: "#888", textAlign: "center" }}>No file</div>}
                  {pv.progress > 0 && pv.progress < 100 && <div style={{ marginTop: 6 }}><div style={{ height: 4, background: "#333", borderRadius: 2 }}><div style={{ width: pv.progress + "%", height: "100%", background: "#22c55e" }}></div></div><small>{pv.progress}%</small></div>}
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <label style={{ flex: 1, background: "#222", color: "#fff", padding: "6px", borderRadius: 6, fontSize: 11, textAlign: "center", cursor: "pointer" }}>
                      {pv.existingKey ? "Replace" : "Add"}
                      <input type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => {
                        const f = e.target.files?.[0]; if (f) { if (pv.objectUrl) URL.revokeObjectURL(pv.objectUrl); const url = URL.createObjectURL(f);
                          setPreviews(prev => prev.map(x => x.id === pv.id ? { ...x, file: f, objectUrl: url, progress: 0, status: "idle" } : x));
                        }
                      }} />
                    </label>
                    <button onClick={() => { if (pv.objectUrl) URL.revokeObjectURL(pv.objectUrl); setPreviews(prev => prev.filter(x => x.id !== pv.id)); }} style={{ background: "#331", color: "#f88", border: "none", padding: "6px 8px", borderRadius: 6, fontSize: 11 }}>🗑️</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {previews.length === 0 && <small style={{ color: "#666" }}>No global previews yet — Add one. These shuffle random in reels feed.</small>}
    </div>
  );
}
