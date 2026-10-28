// edit-movie/parts/single-movie-uploads.tsx - edit version with preview videos

"use client";
import UploadBox from "./upload-box";
import { getR2Url } from "../constants";
import type { PreviewVideoDraft } from "../hooks/use-edit-movie-upload";

type Props = {
  coverPreview: string;
  moviePreview: string;
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
  getR2Url: (k?: string | null) => string;
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
  return (
    <>
      <div className="cc-upload-grid">
        <UploadBox
          label="🎬 MAIN VIDEO"
          hasExisting={!!currentMainKey}
          existingKey={currentMainKey}
          onDownload={() => window.open(getR2Url(currentMainKey) + "?download=1", "_blank")}
          onFileChange={onMainFile}
          progress={mainProg}
          preview={moviePreview}
          isVideo
          inputRef={mainRef}
        />
        <UploadBox
          label="🖼️ COVER"
          hasExisting={!!currentCoverKey}
          existingKey={currentCoverKey}
          onDownload={() => window.open(getR2Url(currentCoverKey) + "?download=1", "_blank")}
          onFileChange={onCoverFile}
          progress={coverProg}
          preview={coverPreview}
          inputRef={coverRef}
        />
      </div>

      {/* UNLIMITED PREVIEW VIDEOS - SAME AS EDIT-MODAL YOU HAD */}
      <div style={{ marginTop: 20, background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 10, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h4 style={{ margin: 0 }}>🎞️ Preview Videos - {previewVideos.length}</h4>
          <button
            onClick={() =>
              setPreviewVideos([
                ...previewVideos,
                { id: crypto.randomUUID(), existingKey: null, file: null, objectUrl: null, progress: 0, status: "idle" },
              ])
            }
            className="cc-btn ghost"
            style={{ fontSize: 12 }}
          >
            ➕ Add Preview
          </button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {previewVideos.map((pv) => (
            <div key={pv.id} style={{ background: "hsl(var(--bg))", border: "1px solid hsl(var(--border))", borderRadius: 8, padding: 8 }}>
              {pv.existingKey && !pv.file && (
                <video src={getR2Url(pv.existingKey)} controls style={{ width: "100%", maxHeight: 120, borderRadius: 6, background: "#000" }} />
              )}
              {pv.file && pv.objectUrl && (
                <video src={pv.objectUrl} controls style={{ width: "100%", maxHeight: 120, borderRadius: 6, background: "#000" }} />
              )}
              {!pv.existingKey && !pv.file && (
                <div style={{ padding: 10, background: "#222", borderRadius: 6, fontSize: 12, color: "#888" }}>No preview yet</div>
              )}

              {pv.progress > 0 && pv.progress < 100 && (
                <div className="prog" style={{ display: "block", marginTop: 6 }}>
                  <div className="prog-bar"><div className="prog-fill" style={{ width: pv.progress + "%" }}></div></div>
                  <span className="prog-text">{pv.progress}%</span>
                </div>
              )}

              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {pv.existingKey && (
                  <button onClick={() => window.open(getR2Url(pv.existingKey) + "?download=1", "_blank")} className="cc-btn ghost" style={{ fontSize: 10, flex: 1 }}>
                    ⬇️ Download
                  </button>
                )}
                <label className="cc-btn ghost" style={{ fontSize: 10, flex: 1, cursor: "pointer", textAlign: "center", background: "#222", borderRadius: 6, padding: "6px" }}>
                  {pv.existingKey ? "🔄 Replace" : "📁 Add File"}
                  <input
                    type="file"
                    accept="video/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (pv.objectUrl) URL.revokeObjectURL(pv.objectUrl);
                        const objectUrl = URL.createObjectURL(f);
                        setPreviewVideos((prev) => prev.map((x) => (x.id === pv.id ? { ...x, file: f, objectUrl, progress: 0, status: "idle" } : x)));
                      }
                    }}
                  />
                </label>
                <button
                  onClick={() => {
                    if (pv.objectUrl) URL.revokeObjectURL(pv.objectUrl);
                    if (confirm("Delete this preview?")) setPreviewVideos((prev) => prev.filter((x) => x.id !== pv.id));
                  }}
                  className="cc-btn ghost"
                  style={{ fontSize: 10, color: "#ff6666" }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
        {previewVideos.length === 0 && <small style={{ color: "#666" }}>No previews - click + Add Preview</small>}
      </div>
    </>
  );
}
