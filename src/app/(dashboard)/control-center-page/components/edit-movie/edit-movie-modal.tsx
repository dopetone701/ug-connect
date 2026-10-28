"use client";
import { useState, useEffect, useRef } from "react";
import "./edit-movie-modal.css";
import { API_URL, cleanKey, getR2Url, FALLBACK, safeId } from "./constants";
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

export default function EditMovieModal({ open, onClose, onUpdated }: Props) {
  const [search, setSearch] = useState("");
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [fullMovie, setFullMovie] = useState<MoviePayload & { id: string } | null>(null);
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

  useEffect(() => { if (open) { fetchMovies(); setSelected(null); setFullMovie(null); setSearch(""); } }, [open]);
  useEffect(() => {
    if (!search) setFiltered(allMovies.slice(0, 12));
    else setFiltered(allMovies.filter((m: any) => m.title?.toLowerCase().includes(search.toLowerCase())).slice(0, 24));
  }, [search, allMovies]);

  const loadMovie = async (m: any) => {
    setSelected(m);
    setLoadingFull(true);
    try {
      const full = await fetchMovieById(m.id);
      
      // Parse cast if exists
      let cast = full.cast || full["cast"] || [];
      if (typeof cast === "string") { try { cast = JSON.parse(cast); } catch { cast = []; } }
      
      // Build full payload
      const payload: any = {
        ...full,
        cast,
        year: full.year,
        preview_urls: typeof full.preview_urls === "string" ? JSON.parse(full.preview_urls) : full.preview_urls || [],
        seasons: typeof full.seasons === "string" ? JSON.parse(full.seasons) : full.seasons || [],
      };
      
      setFullMovie(payload);
      
      // Set upload previews
      upload.setCurrentCoverKey(payload.cover_url || null);
      upload.setCurrentMainKey(payload.main_url || payload.video_url || null);
      upload.setCoverPreview(getR2Url(payload.cover_url));
      upload.setMoviePreview(getR2Url(payload.main_url || payload.video_url));
      
      // Preview videos
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
      setFullMovie(m); // fallback
    } finally {
      setLoadingFull(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected || !fullMovie) return;
    if (!form.isValid()) { alert("Title and Year required"); return; }
    
    upload.setUploading(true);
    try {
      // 1. Upload cast photos
      let finalCast = [...form.cast];
      for (let i = 0; i < finalCast.length; i++) {
        const member: any = finalCast[i];
        if (member._file) {
          const key = `actors/${selected.id}-${cleanKey(member.name)}-${Date.now()}-${cleanKey(member._file.name)}`;
          const uploadedKey = await uploadToR2(member._file, key, () => {});
          finalCast[i] = { name: member.name, photo: uploadedKey };
        } else if (member.photo && member.photo.startsWith("blob:")) {
          // already object url but no file - keep old?
          finalCast[i] = { name: member.name, photo: member.photo };
        }
      }

      // 2. Upload cover/main if new files
      let coverKey = upload.currentCoverKey;
      let mainKey = upload.currentMainKey;
      
      const nc = upload.coverRef.current?.files?.[0];
      if (nc) {
        const k = coverKey || `covers/${selected.id}-${cleanKey(form.title)}-${cleanKey(nc.name)}`;
        coverKey = await uploadToR2(nc, k, (p) => upload.setCoverProg(p));
      }
      
      const nm = upload.mainRef.current?.files?.[0];
      if (nm && form.type === "Single") {
        const k = mainKey || `movies/${selected.id}-${cleanKey(form.title)}-${cleanKey(nm.name)}`;
        mainKey = await uploadToR2(nm, k, (p) => upload.setMainProg(p));
      }

      // 3. Upload preview videos
      const finalPreviewKeys = await uploadPreviewVideosForEdit(
        selected.id,
        upload.previewVideos,
        (id, pct) => upload.updatePreviewProgress(id, pct)
      );

      // 4. Upload seasons if series
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

      // 5. Build payload
      const payload: MoviePayload = {
        title: form.title,
        genre: form.genre,
        vj: form.vj,
        type: form.type,
        year: parseInt(form.year) || 0,
        actors: form.actors,
        cast: finalCast,
        description: form.description,
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
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search movies..." style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--bg))", color: "hsl(var(--text))" }} />
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
            <button onClick={() => { setSelected(null); setFullMovie(null); upload.resetUploadState(); }} style={{ marginBottom: 10, background: "#222", color: "#fff", padding: "6px 12px", borderRadius: 8, border: "none" }}>← Back to {allMovies.length}</button>
            
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
                ) : (
                  <div className="cc-up-box" style={{ marginTop: 14 }}>
                    <label>🖼️ SERIES COVER</label>
                    {upload.currentCoverKey && <button onClick={() => window.open(getR2Url(upload.currentCoverKey) + "?download=1", "_blank")} className="cc-btn ghost" style={{ fontSize: 12 }}>⬇️ Download Cover</button>}
                    <input type="file" ref={upload.coverRef} accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { upload.setCoverPreview(URL.createObjectURL(f)); upload.setCoverProg(0); } }} />
                    <div className="prog" style={{ display: upload.coverProg > 0 ? "block" : "none", marginTop: 10 }}><div className="prog-bar"><div className="prog-fill" style={{ width: upload.coverProg + "%" }}></div></div><span className="prog-text">{upload.coverProg}%</span></div>
                    {upload.coverPreview && <img src={upload.coverPreview} style={{ width: "100%", marginTop: 10, borderRadius: 8, maxHeight: 180, objectFit: "cover" }} />}
                  </div>
                )}

                {/* Series - we will fix tiles last as you said */}
                <SeriesSection type={form.type} seasons={form.seasons} setSeasons={form.setSeasons} />
              </>
            )}
          </div>
        )}

        {selected && (
          <div className="cc-modal-foot">
            <button onClick={async () => { if (confirm(`Delete ${selected.title}?`)) { await fetch(`${API_URL}/${selected.id}`, { method: "DELETE" }); setSelected(null); setFullMovie(null); fetchMovies(); } }} className="cc-btn ghost" style={{ color: "#ff4444", marginRight: "auto" }}>🗑️ Delete</button>
            <button onClick={onClose} disabled={upload.uploading} className="cc-btn ghost">Cancel</button>
            <button disabled={upload.uploading} onClick={handleUpdate} className="cc-btn primary">{upload.uploading ? "Uploading..." : `💾 Save Keep ID ${safeId(selected.id)}`}</button>
          </div>
        )}
      </div>
    </div>
  );
}
