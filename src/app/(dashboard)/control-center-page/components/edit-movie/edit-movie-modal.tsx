"use client";
import { useState, useEffect } from "react";
import "./edit-movie-modal.css";
import { API_URL, cleanKey, getR2Url, FALLBACK, safeId, WORKER_URL } from "./constants";
import { useEditMovieForm } from "./hooks/use-edit-movie-form";
import { useEditMovieUpload } from "./hooks/use-edit-movie-upload";
import { uploadToR2 } from "./lib/upload-to-r2";
import { updateMovie, fetchMovieById } from "./lib/update-movie";
import { uploadSeasonsForEdit, uploadPreviewVideosForEdit } from "./lib/upload-movie";
import MovieDetailsFields from "./parts/movie-details-fields";
import SingleMovieUploads from "./parts/single-movie-uploads";
import SeriesSection from "./parts/series-section";
import type { MoviePayload } from "./types";

type Props = { open: boolean; onClose: () => void; onUpdated?: () => void };

async function deleteR2File(oldUrlOrKey: string | null | undefined): Promise<void> {
  if (!oldUrlOrKey) return;
  let key = oldUrlOrKey;
  if (key.includes("/r2/")) key = key.split("/r2/")[1].split("?")[0];
  if (key.startsWith("http")) {
    try {
      key = decodeURIComponent(new URL(key).pathname.replace("/r2/", "").replace(/^\/+/, ""));
    } catch {}
  }
  if (!key || key.includes("blob:") || key === "/movie.jpg" || key.length < 3) return;
  try {
    await fetch(`${WORKER_URL}/r2-delete/${encodeURIComponent(key)}`, { method: "DELETE" });
    console.log("🗑️ R2 Deleted:", key);
  } catch {}
}

function extractKey(urlOrKey: string | null | undefined): string | null {
  if (!urlOrKey) return null;
  if (typeof urlOrKey !== "string") return null;
  let s = urlOrKey;
  if (s.includes("/r2/")) return s.split("/r2/")[1].split("?")[0];
  if (s.startsWith("http")) {
    try {
      return decodeURIComponent(new URL(s).pathname.replace("/r2/", "").replace(/^\/+/, ""));
    } catch {
      return s;
    }
  }
  return s;
}

export default function EditMovieModal({ open, onClose, onUpdated }: Props) {
  const [search, setSearch] = useState("");
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [fullMovie, setFullMovie] = useState<(MoviePayload & { id: string }) | null>(null);
  const [loadingFull, setLoadingFull] = useState(false);

  const form = useEditMovieForm(fullMovie || undefined);
  const upload = useEditMovieUpload();

  const fetchMovies = async () => {
    const res = await fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-store" });
    const d = await res.json();
    const list = Array.isArray(d) ? d : d.movies || d.data || [];
    setAllMovies(list);
    setFiltered(list.slice(0, 12));
  };

  useEffect(() => {
    if (open) {
      fetchMovies();
      setSelected(null);
      setFullMovie(null);
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (!search) setFiltered(allMovies.slice(0, 12));
    else setFiltered(allMovies.filter((m: any) => m.title?.toLowerCase().includes(search.toLowerCase())).slice(0, 24));
  }, [search, allMovies]);

  const loadMovie = async (m: any) => {
    setSelected(m);
    setLoadingFull(true);
    try {
      const full = await fetchMovieById(m.id);
      
      let cast = full.cast || full["cast"] || [];
      if (typeof cast === "string") { try { cast = JSON.parse(cast); } catch { cast = []; } }
      
      const payload: any = {
        ...full,
        cast,
        year: full.year,
        preview_urls: typeof full.preview_urls === "string" ? JSON.parse(full.preview_urls) : full.preview_urls || [],
        seasons: typeof full.seasons === "string" ? JSON.parse(full.seasons) : full.seasons || [],
      };
      
      setFullMovie(payload);
      
      upload.setCurrentCoverKey(extractKey(payload.cover_url));
      upload.setCurrentMainKey(extractKey(payload.main_url) || extractKey(payload.video_url));
      upload.setCoverPreview(getR2Url(payload.cover_url));
      upload.setMoviePreview(getR2Url(payload.main_url || payload.video_url));
      
      const previews = payload.preview_urls || [];
      upload.setPreviewVideos(previews.map((k: string) => ({
        id: crypto.randomUUID(),
        existingKey: k,
        file: null,
        objectUrl: null,
        progress: 0,
        status: "done" as const,
      })));

    } catch (e) {
      console.error(e);
      setFullMovie(m);
    } finally {
      setLoadingFull(false);
    }
  };

  const handleDeleteCover = async () => {
    if (!confirm("Delete cover? This will delete from R2.")) return;
    const oldKey = upload.currentCoverKey;
    if (oldKey) await deleteR2File(oldKey);
    upload.setCoverPreview(null);
    upload.setCurrentCoverKey(null);
    if (upload.coverRef.current) upload.coverRef.current.value = "";
  };

  const handleDeleteMain = async () => {
    if (!confirm("Delete main movie? This will delete from R2.")) return;
    const oldKey = upload.currentMainKey;
    if (oldKey) await deleteR2File(oldKey);
    upload.setMoviePreview(null);
    upload.setCurrentMainKey(null);
    if (upload.mainRef.current) upload.mainRef.current.value = "";
  };

  const handleDeletePreview = async (id: string, existingKey: string | null) => {
    if (existingKey && !confirm("Delete this preview?")) return;
    if (existingKey) await deleteR2File(existingKey);
    upload.setPreviewVideos(prev => prev.filter(p => p.id !== id));
  };

  const handleClearAllText = () => {
    if (!confirm("Clear ALL text fields? Title, description, genre, VJ, actors?")) return;
    form.setTitle("");
    form.setGenre("");
    form.setVj("");
    form.setActors("");
    form.setDescription("");
    form.setYear("");
  };

  const handleUpdate = async () => {
    if (!selected || !fullMovie) return;
    if (!form.isValid() && form.title.trim() === "") { alert("Title required"); return; }
    
    upload.setUploading(true);
    try {
      let finalCast = [...form.cast];
      for (let i = 0; i < finalCast.length; i++) {
        const member: any = finalCast[i];
        const oldPhotoKey = fullMovie.cast?.[i]?.photo || null;

        if (member._file) {
          const key = `actors/${selected.id}-${cleanKey(member.name)}-${Date.now()}-${cleanKey(member._file.name)}`;
          const uploadedKey = await uploadToR2(member._file, key, () => {});
          if (oldPhotoKey && oldPhotoKey !== uploadedKey) await deleteR2File(oldPhotoKey);
          finalCast[i] = { name: member.name, photo: uploadedKey };
        }
      }

      let coverKey = upload.currentCoverKey;
      let mainKey = upload.currentMainKey;
      
      const nc = upload.coverRef.current?.files?.[0];
      if (nc) {
        const oldKey = coverKey;
        const k = `covers/${selected.id}-${cleanKey(form.title)}-${cleanKey(nc.name)}`;
        coverKey = await uploadToR2(nc, k, (p) => upload.setCoverProg(p));
        if (oldKey && oldKey !== coverKey) await deleteR2File(oldKey);
      }
      
      const nm = upload.mainRef.current?.files?.[0];
      if (nm && form.type === "Single") {
        const oldKey = mainKey;
        const k = `movies/${selected.id}-${cleanKey(form.title)}-${cleanKey(nm.name)}`;
        mainKey = await uploadToR2(nm, k, (p) => upload.setMainProg(p));
        if (oldKey && oldKey !== mainKey) await deleteR2File(oldKey);
      }

      const finalPreviewKeys = await uploadPreviewVideosForEdit(
        selected.id,
        upload.previewVideos,
        (id, pct) => upload.updatePreviewProgress(id, pct)
      );

      let finalSeasons = form.seasons;
      if (form.type !== "Single") {
        finalSeasons = await uploadSeasonsForEdit(
          selected.id,
          form.seasons,
          (seasonId, epId, pct, status) => {
            upload.updateEpisodeStatus(seasonId, epId, { progress: pct, status }, form.setSeasons);
          }
        );
      }

      const payload: MoviePayload = {
        title: form.title.trim(),
        genre: form.genre.trim(),
        vj: form.vj.trim(),
        type: form.type,
        year: parseInt(form.year) || 0,
        actors: form.actors.trim(),
        cast: finalCast,
        description: form.description.trim(),
        cover_url: coverKey || "",
        main_url: mainKey || undefined,
        preview_urls: finalPreviewKeys,
        seasons: finalSeasons,
      };

      await updateMovie(selected.id, payload);
      alert(`✅ Updated - Same ID ${safeId(selected.id)}`);
      onClose();
      onUpdated?.();
      fetchMovies();
    } catch (e: any) {
      alert("❌ " + e.message);
    } finally {
      upload.setUploading(false);
      upload.setCoverProg(0);
      upload.setMainProg(0);
    }
  };

  if (!open) return null;
  const isSeries = form.type === "Full" || form.type === "Mini";

  return (
    <div className="cc-modal-bg" onClick={onClose}>
      <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cc-modal-head">
          <h3>✏️ Edit Movie {selected ? `- ${safeId(selected.id)} - ${selected.title}` : `- ${allMovies.length} movies`}</h3>
          <button onClick={onClose} className="cc-close">✕</button>
        </div>

        {!selected ? (
          <div className="cc-modal-body">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search movies..." style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--bg))", color: "hsl(var(--text))", fontSize: 16 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12, maxHeight: 500, overflowY: "auto" }}>
              {filtered.map((m) => (
                <div key={m.id} onClick={() => loadMovie(m)} style={{ display: "flex", gap: 10, padding: 10, background: "hsl(var(--surface))", borderRadius: 10, cursor: "pointer", border: "1px solid hsl(var(--border))" }}>
                  <img src={getR2Url(m.cover_url)} onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }} style={{ width: 64, height: 84, objectFit: "cover", borderRadius: 6 }} />
                  <div><div style={{ fontWeight: 700, fontSize: 13 }}>{m.title}</div><small style={{ color: "#888" }}>{m.type} • {m.year} • {m.genre} • {m.vj}</small></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cc-modal-body">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <button onClick={() => { setSelected(null); setFullMovie(null); upload.resetUploadState(); }} style={{ background: "#222", color: "#fff", padding: "6px 12px", borderRadius: 8, border: "none" }}>← Back to {allMovies.length}</button>
              <button onClick={handleClearAllText} style={{ background: "#3a1a1a", color: "#ff8888", padding: "6px 12px", borderRadius: 8, border: "1px solid #ff444422" }}>🗑️ Clear All Text</button>
            </div>
            
            {loadingFull ? <div style={{ padding: 20, textAlign: "center" }}>Loading full movie data...</div> : (
              <>
                <MovieDetailsFields
                  title={form.title} setTitle={form.setTitle}
                  genre={form.genre} setGenre={form.setGenre}
                  vj={form.vj} setVj={form.setVj}
                  type={form.type} setType={form.setType}
                  year={form.year} setYear={form.setYear}
                  actors={form.actors} setActors={form.setActors}
                  cast={form.cast} setCast={form.setCast}
                  description={form.description} setDescription={form.setDescription}
                />

                {!isSeries ? (
                  <>
                    <SingleMovieUploads
                      coverPreview={upload.coverPreview}
                      moviePreview={upload.moviePreview}
                      currentCoverKey={upload.currentCoverKey}
                      currentMainKey={upload.currentMainKey}
                      coverProg={upload.coverProg}
                      mainProg={upload.mainProg}
                      previewVideos={upload.previewVideos}
                      setPreviewVideos={upload.setPreviewVideos}
                      coverRef={upload.coverRef}
                      mainRef={upload.mainRef}
                      onCoverFile={(f) => { upload.setCoverPreview(URL.createObjectURL(f)); upload.setCoverProg(0); }}
                      onMainFile={(f) => { upload.setMoviePreview(URL.createObjectURL(f)); upload.setMainProg(0); }}
                      getR2Url={getR2Url}
                    />
                    {/* DELETE BUTTONS ADDED HERE - OUTSIDE component to avoid prop errors */}
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {upload.coverPreview && <button onClick={handleDeleteCover} className="cc-btn ghost" style={{ color: "#ff4444", fontSize: 12 }}>🗑️ Delete Cover (R2)</button>}
                      {upload.moviePreview && <button onClick={handleDeleteMain} className="cc-btn ghost" style={{ color: "#ff4444", fontSize: 12 }}>🗑️ Delete Main Movie (R2)</button>}
                      {upload.previewVideos.map(pv => pv.existingKey ? <button key={pv.id} onClick={() => handleDeletePreview(pv.id, pv.existingKey)} className="cc-btn ghost" style={{ color: "#ffaa44", fontSize: 12 }}>🗑️ Delete Preview {pv.existingKey.slice(0, 15)}</button> : null)}
                    </div>
                  </>
                ) : (
                  <div className="cc-up-box" style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label>🖼️ SERIES COVER</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        {upload.currentCoverKey && <button onClick={() => window.open(getR2Url(upload.currentCoverKey) + "?download=1", "_blank")} className="cc-btn ghost" style={{ fontSize: 12 }}>⬇️ Download</button>}
                        {upload.coverPreview && <button onClick={handleDeleteCover} className="cc-btn ghost" style={{ fontSize: 12, color: "#ff4444" }}>🗑️ Delete Cover</button>}
                      </div>
                    </div>
                    <input type="file" ref={upload.coverRef} accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { upload.setCoverPreview(URL.createObjectURL(f)); upload.setCoverProg(0); } }} />
                    <div className="prog" style={{ display: upload.coverProg > 0 ? "block" : "none", marginTop: 10 }}><div className="prog-bar"><div className="prog-fill" style={{ width: upload.coverProg + "%" }}></div></div><span className="prog-text">{upload.coverProg}%</span></div>
                    {upload.coverPreview && <img src={upload.coverPreview} style={{ width: "100%", marginTop: 10, borderRadius: 8, maxHeight: 180, objectFit: "cover" }} />}
                  </div>
                )}

                <SeriesSection type={form.type} seasons={form.seasons} setSeasons={form.setSeasons} />
              </>
            )}
          </div>
        )}

        {selected && (
          <div className="cc-modal-foot">
            <button onClick={async () => { if (confirm(`Delete ${selected.title}?`)) { await fetch(`${API_URL}/${selected.id}`, { method: "DELETE" }); setSelected(null); setFullMovie(null); fetchMovies(); } }} className="cc-btn ghost" style={{ color: "#ff4444", marginRight: "auto" }}>🗑️ Delete Movie</button>
            <button onClick={onClose} disabled={upload.uploading} className="cc-btn ghost">Cancel</button>
            <button disabled={upload.uploading} onClick={handleUpdate} className="cc-btn primary">{upload.uploading ? "Uploading..." : `💾 Save Keep ID ${safeId(selected.id)}`}</button>
          </div>
        )}
      </div>
    </div>
  );
}