"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCreateMovieForm } from "./hooks/use-create-movie-form";
import { useCreateMovieUpload } from "./hooks/use-create-movie-upload";
import { generateShortId, MAX_ACTORS, type MovieCategoryId } from "./constants";
import {
  createSafeTitle,
  uploadCover,
  uploadMainMovie,
  uploadPreviews,
  uploadEpisodeFile,
  uploadEpisodePreview,
  uploadHeadshot,
} from "./lib/upload-movie";
import { saveMovie } from "./lib/save-movie";
import MovieDetailsFields from "./parts/movie-details-fields";
import SingleMovieUploads from "./parts/single-movie-uploads";
import SeriesSection from "./parts/series-section";
import type { CastMember, MoviePayload } from "./types";
import "./create-movie-modal.css";

type Props = { open: boolean; onClose: () => void; onCreated?: () => void };

export default function CreateMovieModal({ open, onClose, onCreated }: Props) {
  const form = useCreateMovieForm();
  const {
    uploading,
    setUploading,
    coverProg,
    setCoverProg,
    mainProg,
    setMainProg,
    seasons,
    setSeasons,
    updateEpStatus,
    resetUploadState,
    resetAll,
  } = useCreateMovieUpload();

  // Local category state - no extra file needed, source is constants.ts
  const [category, setCategory] = useState<MovieCategoryId | "">("");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    if (uploading) return;
    resetAll();
    form.resetForm();
    setCategory("");
    onClose();
  };

  const handleUpload = async () => {
    const main = form.mainRef.current?.files?.[0];
    const cover = form.coverRef.current?.files?.[0];
    const namedActors = form.actors.filter((a) => a.name.trim());
    const yearNum = parseInt(form.year);

    if (!form.title.trim() || !cover || !form.year.trim() || namedActors.length === 0)
      return alert("Title, Year, at least 1 Actor and Cover are required");
    if (!category) return alert("Category / Origin is required - for Explore More sync");
    if (!Number.isFinite(yearNum)) return alert("Year must be a number");
    if (form.actors.some((a) => a.file && !a.name.trim()))
      return alert("Every headshot needs an actor name");
    if (!form.isSeries && !main) return alert("Main movie required for Single");
    if (form.isSeries && seasons.length === 0) return alert("Add at least 1 season");
    if (form.isSeries && seasons.some((s: any) => s.episodes.some((e: any) => !e.file)))
      return alert("All episodes must have a file");

    try {
      setUploading(true);
      const uid = generateShortId();
      const safeTitle = createSafeTitle(form.title);

      const coverKey = await uploadCover({ file: cover, uid, safeTitle, onProgress: setCoverProg });

      const cast: CastMember[] = [];
      for (const a of namedActors.slice(0, MAX_ACTORS)) {
        const photo = a.file ? await uploadHeadshot({ file: a.file, uid }) : null;
        cast.push({ name: a.name.trim(), photo });
      }

      const globalPreviewKeys = await uploadPreviews({
        files: form.previewFiles,
        uid,
        type: form.type
      });

      const payload: MoviePayload = {
        title: form.title.trim(),
        genre: form.genre.trim(),
        vj: form.vj.trim(),
        type: form.type,
        year: yearNum,
        actors: cast.map((c) => c.name).join(", "),
        cast,
        description: form.desc.trim(),
        cover_url: coverKey,
        preview_urls: globalPreviewKeys,
        // SYNC FIELD - from constants.ts -> Drive -> ExploreMore
        category: category,
        origin: category,
        country: category,
      } as MoviePayload & { origin?: string; country?: string };

      if (!form.isSeries) {
        payload.main_url = await uploadMainMovie({ file: main!, uid, safeTitle, onProgress: setMainProg });
      } else {
        if (main) {
          payload.main_url = await uploadMainMovie({ file: main, uid, safeTitle, onProgress: setMainProg, prefix: "series-previews" });
        }
        const uploadedSeasons: NonNullable<MoviePayload["seasons"]> = [];
        for (const season of seasons as any[]) {
          const uploadedEps: NonNullable<MoviePayload["seasons"]>[number]["episodes"] = [];
          for (const ep of season.episodes) {
            if (!ep.file) throw new Error(`${season.name} - ${ep.title} missing file`);
            updateEpStatus(season.id, ep.id, { status: "uploading", progress: 0 });
            try {
              const epUploaded = await uploadEpisodeFile({
                file: ep.file,
                uid,
                safeTitle,
                seasonName: season.name,
                onProgress: (pct) => updateEpStatus(season.id, ep.id, { progress: pct, status: "uploading" }),
              });
              let previewUploaded: string | null = null;
              if (ep.previewFile) {
                previewUploaded = await uploadEpisodePreview({ file: ep.previewFile, uid, safeTitle });
              }
              updateEpStatus(season.id, ep.id, { progress: 100, status: "done" });
              uploadedEps.push({ title: ep.title, main_url: epUploaded, preview_url: previewUploaded });
            } catch (err: any) {
              updateEpStatus(season.id, ep.id, { status: "error", error: err.message });
              throw err;
            }
          }
          uploadedSeasons.push({ name: season.name, episodes: uploadedEps });
        }
        payload.seasons = uploadedSeasons;
      }

      await saveMovie(payload);

      alert(`✅ Uploaded - ${globalPreviewKeys.length} global previews + Category: ${category}`);
      resetAll();
      form.resetForm();
      setCategory("");
      onClose();
      onCreated?.();
    } catch (e: any) {
      alert("❌ " + (e?.message || e));
    } finally {
      resetUploadState();
    }
  };

  const modal = (
    <div className="cc-modal-bg">
      <div className="cc-modal">
        <div className="cc-modal-head">
          <h3>🎬 Create Movie - {form.type} - {form.previewFiles.length} global previews</h3>
          <button onClick={handleClose} className="cc-close">✕</button>
        </div>

        <div className="cc-modal-body">
          <MovieDetailsFields
            title={form.title} setTitle={form.setTitle}
            year={form.year} setYear={form.setYear}
            genre={form.genre} setGenre={form.setGenre}
            vj={form.vj} setVj={form.setVj}
            category={category} setCategory={setCategory}
            actors={form.actors} setActors={form.setActors}
            type={form.type} setType={form.setType}
            desc={form.desc} setDesc={form.setDesc}
            onTypeChange={(t) => { if (t === "Single") setSeasons([]); }}
            disabled={uploading}
          />

          <SingleMovieUploads
            seriesMode={false}
            mainRef={form.mainRef}
            coverRef={form.coverRef}
            movieUrl={form.movieUrl}
            coverUrl={form.coverUrl}
            mainProg={mainProg}
            coverProg={coverProg}
            previewFiles={form.previewFiles}
            onMainChange={form.onMainChange}
            onCoverChange={form.onCoverChange}
            onPreviewsChange={form.onPreviewsChange}
          />

          <SeriesSection type={form.type} seasons={seasons} setSeasons={setSeasons} />

          <div id="createStatus" className="cc-status">
            {uploading ? "⏳ Uploading to R2... (covers/ + movies/ + previews/ + series/)" : `🚀 Ready - ${form.previewFiles.length} global previews | Category: ${category || "not selected"}`}
          </div>
        </div>

        <div className="cc-modal-foot">
          <button onClick={handleClose} disabled={uploading} className="cc-btn ghost">Cancel</button>
          <button disabled={uploading} onClick={handleUpload} className="cc-btn primary">
            {uploading ? "Uploading..." : "🚀 Upload Movie"}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modal, document.body) : modal;
}

