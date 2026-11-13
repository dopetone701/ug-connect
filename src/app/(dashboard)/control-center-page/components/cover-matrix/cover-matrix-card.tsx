"use client";

import { useEffect, useState } from "react";
import type { MatrixMovie } from "./cover-matrix-controller";
import { useCoverMatrix } from "./cover-matrix-controller";
import { useCoverMatrixPanel } from "./cover-matrix-store";
import { CoverMatrixDeleteBtn } from "./cm-delete-btn";
import {
  CoverMatrixReplaceBtn,
  MobileImagePicker,
} from "./cm-replace-btn";

import "./m-card.css";

function useCountdown(target: number | null | undefined) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target) return null;

  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) {
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `00:${String(s).padStart(2, "0")}`;
}

/* =========================================================
   MOVIE CARD
========================================================= */

export function CoverMatrixMovieCard({ movie }: { movie: MatrixMovie }) {
  const selectMovie = useCoverMatrixPanel((s) => s.selectMovie);
  const shuffleOne = useCoverMatrix((s) => s.shuffleOne);
  const addCover = useCoverMatrix((s) => s.addCover);
  const busyId = useCoverMatrix((s) => s.busyId);

  const busy = busyId === movie.id;
  const single = movie.covers.length <= 1;
  const countdown = useCountdown(
    !single ? movie.cover_schedule?.nextRotateAt : null
  );

  return (
    <div className="m-card" onClick={() => selectMovie(movie.id)}>
      <div className="m-card-media">
        <img src={movie.cover_url} alt={movie.title} loading="lazy" draggable={false} />
        {!single && countdown && (
          <div className="m-card-timer-overlay">
            <span className="m-card-timer-label">NEXT COVER IN</span>
            <span className="m-card-timer-big">{countdown}</span>
          </div>
        )}
      </div>

      <div className="m-card-body">
        <div className="m-card-title">{movie.title}</div>
        <div className="m-card-meta">
          {movie.vj ? `VJ ${movie.vj} • ` : ""}
          {movie.covers.length} cover{movie.covers.length === 1 ? "" : "s"}
          {single ? " • add 1 more to unlock shuffle" : ""}
        </div>

        {single ? (
          <MobileImagePicker disabled={busy} onPick={(file) => addCover(movie, file)}>
            {busy ? "Uploading…" : "+ Add Cover"}
          </MobileImagePicker>
        ) : (
          <button
            type="button"
            className="m-card-btn"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              shuffleOne(movie);
            }}
          >
            {busy ? "…" : "🔀 Shuffle"}
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   COVER CARD
========================================================= */

export function CoverMatrixCoverCard({
  movie,
  cover,
  index,
}: {
  movie: MatrixMovie;
  cover: string;
  index: number;
}) {
  const setActiveCover = useCoverMatrix((s) => s.setActiveCover);
  const busyId = useCoverMatrix((s) => s.busyId);
  const busy = busyId === movie.id;

  const raw = movie.covers_raw?.[index] || cover;
  const isActive =
    movie.cover_url === cover ||
    movie.cover_url_raw === raw ||
    movie.cover_schedule?.activeIndex === index;

  const countdown = useCountdown(
    isActive && movie.covers.length > 1
      ? movie.cover_schedule?.nextRotateAt
      : null
  );

  return (
    <div
      className={`m-card ${isActive ? "is-active" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!busy) setActiveCover(movie, cover);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !busy) {
          e.preventDefault();
          setActiveCover(movie, cover);
        }
      }}
    >
      <div className="m-card-media">
        <img src={cover} alt={`${movie.title} cover ${index + 1}`} loading="lazy" draggable={false} />
        {isActive && <span className="m-card-active">ACTIVE</span>}
        {isActive && movie.covers.length > 1 && countdown && (
          <div className="m-card-timer-overlay">
            <span className="m-card-timer-label">NEXT COVER IN</span>
            <span className="m-card-timer-big">{countdown}</span>
          </div>
        )}
      </div>

      <div className="m-card-body">
        <div className="m-card-meta">
          Cover {index + 1}
          {isActive ? " • live now" : ""}
        </div>

        {/* THIS is the fix for Delete opening picker.
            Any click inside here NEVER reaches the card,
            so Delete never triggers Replace's file input,
            and Replace/Delete never trigger setActiveCover. */}
        <div
  className="m-card-actions"
  onClick={(e) => e.stopPropagation()}
  onKeyDown={(e) => e.stopPropagation()}
  style={{ display: "flex", gap: 8 }}
>
  {/* SEPARATE — Replace lives here alone */}
  <span onClick={(e) => e.stopPropagation()}>
    <CoverMatrixReplaceBtn movie={movie} cover={cover} />
  </span>

  {/* SEPARATE — Delete lives here alone, no file input inside */}
  <span onClick={(e) => e.stopPropagation()}>
    <CoverMatrixDeleteBtn movie={movie} cover={cover} isActive={isActive} />
  </span>
</div>

      </div>
    </div>
  );
}

/* =========================================================
   ADD COVER CARD
========================================================= */

export function CoverMatrixAddCard({ movie }: { movie: MatrixMovie }) {
  const addCover = useCoverMatrix((s) => s.addCover);
  const busyId = useCoverMatrix((s) => s.busyId);
  const busy = busyId === movie.id;

  return (
    <div className="m-card m-card-add">
      <MobileImagePicker
        disabled={busy}
        className="m-card-add-picker"
        onPick={(file) => addCover(movie, file)}
      >
        <span className="m-card-add-plus">+</span>
        <span className="m-card-meta">{busy ? "Uploading…" : "Add cover"}</span>
      </MobileImagePicker>

      {busy && <div className="m-card-meta">Uploading…</div>}
    </div>
  );
}
