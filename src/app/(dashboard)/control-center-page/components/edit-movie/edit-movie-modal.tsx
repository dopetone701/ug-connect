"use client";

import { useState, useEffect } from "react";
import "./edit-movie-modal.css";

import {
  API_URL,
  cleanKey,
  getR2Url,
  FALLBACK,
  safeId,
  WORKER_URL,
} from "./constants";

import { useEditMovieForm } from "./hooks/use-edit-movie-form";
import { useEditMovieUpload } from "./hooks/use-edit-movie-upload";

import { uploadToR2 } from "./lib/upload-to-r2";
import { updateMovie, fetchMovieById } from "./lib/update-movie";

import {
  uploadSeasonsForEdit,
  uploadPreviewVideosForEdit,
} from "./lib/upload-movie";

import MovieDetailsFields from "./parts/movie-details-fields";
import SingleMovieUploads from "./parts/single-movie-uploads";
import SeriesSection from "./parts/series-section";

import type { MoviePayload } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
};

async function deleteR2File(
  oldUrlOrKey: string | null | undefined
): Promise<void> {
  if (!oldUrlOrKey) return;

  let key = oldUrlOrKey;

  if (key.includes("/r2/")) {
    key = key.split("/r2/")[1].split("?")[0];
  }

  if (key.startsWith("http")) {
    try {
      key = decodeURIComponent(
        new URL(key).pathname.replace("/r2/", "").replace(/^\/+/, "")
      );
    } catch {}
  }

  if (
    !key ||
    key.includes("blob:") ||
    key === "/movie.jpg" ||
    key.length < 3
  ) {
    return;
  }

  try {
    await fetch(
      `${WORKER_URL}/r2-delete/${encodeURIComponent(key)}`,
      { method: "DELETE" }
    );
  } catch {}
}

function extractKey(
  urlOrKey: string | null | undefined
): string | null {
  if (!urlOrKey || typeof urlOrKey !== "string") return null;

  const value = urlOrKey.trim();

  if (!value) return null;

  if (value.includes("/r2/")) {
    return value.split("/r2/")[1].split("?")[0] || null;
  }

  if (value.startsWith("http")) {
    try {
      return decodeURIComponent(
        new URL(value).pathname.replace("/r2/", "").replace(/^\/+/, "")
      );
    } catch {
      return value;
    }
  }

  return value;
}

export default function EditMovieModal({
  open,
  onClose,
  onUpdated,
}: Props) {
  const [search, setSearch] = useState("");
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [fullMovie, setFullMovie] = useState<
    (MoviePayload & { id: string }) | null
  >(null);

  const [loadingFull, setLoadingFull] = useState(false);

  const form = useEditMovieForm(fullMovie || undefined);
  const upload = useEditMovieUpload();

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status}`);
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : data.movies || data.data || [];

      setAllMovies(list);
      setFiltered(list.slice(0, 12));
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      alert("Could not load movies. Please try again.");
    }
  };

  useEffect(() => {
    if (!open) return;

    void fetchMovies();

    setSelected(null);
    setFullMovie(null);
    setSearch("");
  }, [open]);

  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setFiltered(allMovies.slice(0, 12));
      return;
    }

    setFiltered(
      allMovies
        .filter((movie: any) =>
          movie.title?.toLowerCase().includes(query)
        )
        .slice(0, 24)
    );
  }, [search, allMovies]);

  const loadMovie = async (movie: any) => {
    setSelected(movie);
    setLoadingFull(true);

    try {
      const full: any = await fetchMovieById(movie.id);

      let cast = full.cast || [];

      if (typeof cast === "string") {
        try {
          cast = JSON.parse(cast);
        } catch {
          cast = [];
        }
      }

      const rawPreviewUrls = full.preview_urls;
      const rawSeasons = full.seasons;

      const payload: any = {
        ...full,
        cast,
        year: full.year,
        category:
          full.category ??
          full.origin ??
          full.country ??
          "",
        preview_urls:
          typeof rawPreviewUrls === "string"
            ? JSON.parse(rawPreviewUrls)
            : rawPreviewUrls || [],
        seasons:
          typeof rawSeasons === "string"
            ? JSON.parse(rawSeasons)
            : rawSeasons || [],
      };

      setFullMovie(payload);

      // COVER
      const coverKey = extractKey(payload.cover_url);

      upload.setCurrentCoverKey(coverKey);
      upload.setCoverPreview(getR2Url(payload.cover_url) || "");

      // GLOBAL TRAILER
      let globalPreviewKey: string | null = null;
      let globalPreviewUrl: string | null = null;

      if (payload.main_url || payload.video_url) {
        const raw = payload.main_url || payload.video_url;

        globalPreviewKey = extractKey(raw);

        globalPreviewUrl =
          getR2Url(raw) ||
          (globalPreviewKey
            ? `${WORKER_URL}/r2/${globalPreviewKey}`
            : null);
      }

      upload.setCurrentMainKey(globalPreviewKey);
      upload.setMoviePreview(globalPreviewUrl);

      // GLOBAL PREVIEWS
      const previews = payload.preview_urls || [];

      upload.setPreviewVideos(
        previews.map((key: string) => ({
          id: crypto.randomUUID(),
          existingKey: key,
          file: null,
          objectUrl: null,
          progress: 0,
          status: "done" as const,
        }))
      );
    } catch (error) {
      console.error("Failed to load full movie:", error);

      alert("Could not load the full movie details.");
      setSelected(null);
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

    if (upload.coverRef.current) {
      upload.coverRef.current.value = "";
    }
  };

  const handleDeleteMain = async () => {
    if (!confirm("Delete global trailer? This will delete from R2.")) {
      return;
    }

    const oldKey = upload.currentMainKey;

    if (oldKey) await deleteR2File(oldKey);

    upload.setMoviePreview(null);
    upload.setCurrentMainKey(null);

    if (upload.mainRef.current) {
      upload.mainRef.current.value = "";
    }
  };

  const handleDeletePreview = async (
    id: string,
    existingKey: string | null
  ) => {
    if (existingKey && !confirm("Delete this preview?")) return;

    if (existingKey) {
      await deleteR2File(existingKey);
    }

    upload.setPreviewVideos((previous) =>
      previous.filter((preview) => preview.id !== id)
    );
  };

  const handleClearAllText = () => {
    if (
      !confirm(
        "Clear ALL text fields? Title, description, genre, VJ, actors?"
      )
    ) {
      return;
    }

    form.setTitle("");
    form.setGenre("");
    form.setVj("");
    form.setActors("");
    form.setDescription("");
    form.setYear("");
  };

  const handleUpdate = async () => {
    if (!selected || !fullMovie) return;

    if (!form.isValid() && form.title.trim() === "") {
      alert("Title required");
      return;
    }

    if (!form.category) {
      alert("Please select a category or origin before saving.");
      return;
    }

    upload.setUploading(true);

    try {
      // CAST PHOTOS
      const finalCast = [...form.cast];

      for (let index = 0; index < finalCast.length; index++) {
        const member: any = finalCast[index];

        const oldPhotoKey =
          fullMovie.cast?.[index]?.photo || null;

        if (member._file) {
          const key =
            `actors/${selected.id}-` +
            `${cleanKey(member.name)}-` +
            `${Date.now()}-` +
            `${cleanKey(member._file.name)}`;

          const uploadedKey = await uploadToR2(
            member._file,
            key,
            () => {}
          );

          if (oldPhotoKey && oldPhotoKey !== uploadedKey) {
            await deleteR2File(oldPhotoKey);
          }

          finalCast[index] = {
            name: member.name,
            photo: uploadedKey,
          };
        }
      }

      // COVER
      let coverKey = upload.currentCoverKey;
      let mainKey = upload.currentMainKey;

      const newCover = upload.coverRef.current?.files?.[0];

      if (newCover) {
        const oldKey = coverKey;

        const key =
          `covers/${selected.id}-` +
          `${cleanKey(form.title)}-` +
          `${cleanKey(newCover.name)}`;

        coverKey = await uploadToR2(
          newCover,
          key,
          (progress) => upload.setCoverProg(progress)
        );

        if (oldKey && oldKey !== coverKey) {
          await deleteR2File(oldKey);
        }
      }

      // GLOBAL TRAILER
      const newMain = upload.mainRef.current?.files?.[0];

      if (newMain) {
        const oldKey = mainKey;

        const prefix =
          form.type === "Single" ? "movies" : "series-previews";

        const key =
          `${prefix}/${selected.id}-` +
          `${cleanKey(form.title)}-` +
          `${cleanKey(newMain.name)}`;

        mainKey = await uploadToR2(
          newMain,
          key,
          (progress) => upload.setMainProg(progress)
        );

        if (oldKey && oldKey !== mainKey) {
          await deleteR2File(oldKey);
        }
      }

      // GLOBAL PREVIEWS
      const finalPreviewKeys = await uploadPreviewVideosForEdit(
        selected.id,
        upload.previewVideos,
        (id, progress) =>
          upload.updatePreviewProgress(id, progress),
        form.type
      );

      // SEASONS
      let finalSeasons = form.seasons;

      if (form.type !== "Single") {
        finalSeasons = await uploadSeasonsForEdit(
          selected.id,
          form.seasons,
          (seasonId, episodeId, progress, status) => {
            upload.updateEpisodeStatus(
              seasonId,
              episodeId,
              { progress, status },
              form.setSeasons
            );
          }
        );
      }

      // CATEGORY: USE THE CURRENT FORM STATE
      const selectedCategory = form.category;

      const payload: MoviePayload = {
        title: form.title.trim(),
        genre: form.genre.trim(),
        vj: form.vj.trim(),
        type: form.type,
        year: parseInt(form.year, 10) || 0,
        actors: form.actors.trim(),
        cast: finalCast,
        description: form.description.trim(),
        cover_url: coverKey || "",
        main_url: mainKey || undefined,
        preview_urls: finalPreviewKeys,
        seasons: finalSeasons,

        category: selectedCategory,
        origin: selectedCategory,
        country: selectedCategory,
      };

      await updateMovie(selected.id, payload);

      alert(
        `Updated successfully. ID ${safeId(selected.id)}. ` +
        `Category: ${selectedCategory}. ` +
        `Global previews: ${finalPreviewKeys.length}.`
      );

      onClose();
      onUpdated?.();

      await fetchMovies();
    } catch (error: any) {
      console.error("Failed to update movie:", error);
      alert("Update failed: " + (error?.message || "Unknown error"));
    } finally {
      upload.setUploading(false);
      upload.setCoverProg(0);
      upload.setMainProg(0);
    }
  };

  if (!open) return null;

  const isSeries =
    form.type === "Full" || form.type === "Mini";

  return (
    <div className="cc-modal-bg" onClick={onClose}>
      <div
        className="cc-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cc-modal-head">
          <h3>
            Edit Movie{" "}
            {selected
              ? `- ${safeId(selected.id)} - ${selected.title}`
              : `- ${allMovies.length} movies`}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="cc-close"
          >
            ✕
          </button>
        </div>

        {!selected ? (
          <div className="cc-modal-body">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search movies..."
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--bg))",
                color: "hsl(var(--text))",
                fontSize: 16,
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
                marginTop: 12,
                maxHeight: 500,
                overflowY: "auto",
              }}
            >
              {filtered.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => void loadMovie(movie)}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: 10,
                    background: "hsl(var(--surface))",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  <img
                    src={getR2Url(movie.cover_url)}
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK;
                    }}
                    style={{
                      width: 64,
                      height: 84,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                    alt=""
                  />

                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {movie.title}
                    </div>

                    <small style={{ color: "#888" }}>
                      {movie.type} • {movie.year} • {movie.genre} •{" "}
                      {movie.vj} •{" "}
                      {movie.category ||
                        movie.origin ||
                        "no category"}{" "}
                      • {movie.preview_urls?.length || 0} previews
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="cc-modal-body">
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setFullMovie(null);
                  upload.resetUploadState();
                }}
                style={{
                  background: "#222",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "none",
                }}
              >
                ← Back to {allMovies.length}
              </button>

              <button
                type="button"
                onClick={handleClearAllText}
                style={{
                  background: "#3a1a1a",
                  color: "#ff8888",
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #ff444422",
                }}
              >
                Clear All Text
              </button>
            </div>

            {loadingFull ? (
              <div
                style={{
                  padding: 20,
                  textAlign: "center",
                }}
              >
                Loading full movie data...
              </div>
            ) : (
              <>
                <MovieDetailsFields
                  title={form.title}
                  setTitle={form.setTitle}
                  genre={form.genre}
                  setGenre={form.setGenre}
                  vj={form.vj}
                  setVj={form.setVj}
                  type={form.type}
                  setType={form.setType}
                  year={form.year}
                  setYear={form.setYear}
                  actors={form.actors}
                  setActors={form.setActors}
                  cast={form.cast}
                  setCast={form.setCast}
                  description={form.description}
                  setDescription={form.setDescription}
                  category={form.category}
                  setCategory={form.setCategory}
                />

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
                  onCoverFile={(file) => {
                    upload.setCoverPreview(
                      URL.createObjectURL(file)
                    );
                    upload.setCoverProg(0);
                  }}
                  onMainFile={(file) => {
                    upload.setMoviePreview(
                      URL.createObjectURL(file)
                    );
                    upload.setMainProg(0);
                  }}
                  getR2Url={getR2Url}
                />

                {isSeries && (
                  <>
                    <div
                      style={{
                        marginTop: 12,
                        padding: 8,
                        background: "#0f172a",
                        borderRadius: 8,
                        border: "1px solid #22d3ee22",
                      }}
                    >
                      <small style={{ color: "#22d3ee" }}>
                        Series: The main video is the universal
                        trailer. Global previews are used for cubes.
                        Episode previews remain in their episode tiles.
                      </small>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {upload.coverPreview && (
                        <button
                          type="button"
                          onClick={handleDeleteCover}
                          className="cc-btn ghost"
                          style={{
                            color: "#ff4444",
                            fontSize: 12,
                          }}
                        >
                          Delete Cover (R2)
                        </button>
                      )}

                      {upload.moviePreview && (
                        <button
                          type="button"
                          onClick={handleDeleteMain}
                          className="cc-btn ghost"
                          style={{
                            color: "#ff4444",
                            fontSize: 12,
                          }}
                        >
                          Delete Trailer (R2)
                        </button>
                      )}
                    </div>
                  </>
                )}

                <SeriesSection
                  type={form.type}
                  seasons={form.seasons}
                  setSeasons={form.setSeasons}
                />
              </>
            )}
          </div>
        )}

        {selected && (
          <div className="cc-modal-foot">
            <button
              type="button"
              onClick={async () => {
                if (!confirm(`Delete ${selected.title}?`)) return;

                try {
                  const response = await fetch(
                    `${API_URL}/${selected.id}`,
                    { method: "DELETE" }
                  );

                  if (!response.ok) {
                    throw new Error(
                      `Delete failed: ${response.status}`
                    );
                  }

                  setSelected(null);
                  setFullMovie(null);

                  await fetchMovies();
                  onUpdated?.();
                } catch (error: any) {
                  alert(
                    "Delete failed: " +
                    (error?.message || "Unknown error")
                  );
                }
              }}
              className="cc-btn ghost"
              style={{
                color: "#ff4444",
                marginRight: "auto",
              }}
            >
              Delete Movie
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={upload.uploading}
              className="cc-btn ghost"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={upload.uploading || loadingFull}
              onClick={handleUpdate}
              className="cc-btn primary"
            >
              {upload.uploading
                ? "Uploading..."
                : `Save Keep ID ${safeId(selected.id)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
