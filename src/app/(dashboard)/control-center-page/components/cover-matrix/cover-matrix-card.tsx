"use client";
import { useEffect, useRef, useState } from "react";
import DeleteNotice from "./delete-notice";

function useCountdown(target: number | null | undefined) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { if (!target) return; const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, [target]);
  if (!target) return null;
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `00:${String(s).padStart(2, "0")}`;
}
import type { MatrixMovie } from "./cover-matrix-controller";
import { useCoverMatrix } from "./cover-matrix-controller";
import { useCoverMatrixPanel } from "./cover-matrix-store";
import "./m-card.css";

export function CoverMatrixMovieCard({ movie }: { movie: MatrixMovie }) {
  const selectMovie = useCoverMatrixPanel((s) => s.selectMovie);
  const shuffleOne = useCoverMatrix((s) => s.shuffleOne);
  const addCover = useCoverMatrix((s) => s.addCover);
  const busyId = useCoverMatrix((s) => s.busyId);
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = busyId === movie.id;
  const single = movie.covers.length <= 1;
  const countdown = useCountdown(!single ? movie.cover_schedule?.nextRotateAt : null);
  return (
    <div className="m-card" onClick={() => selectMovie(movie.id)}>
      <div className="m-card-media"><img src={movie.cover_url} alt={movie.title} loading="lazy" />
        {!single && countdown && <div className="m-card-timer-overlay"><span className="m-card-timer-label">NEXT COVER IN</span><span className="m-card-timer-big">{countdown}</span></div>}
      </div>
      <div className="m-card-body">
        <div className="m-card-title">{movie.title}</div>
        <div className="m-card-meta">{movie.vj ? `VJ ${movie.vj} • ` : ""}{movie.covers.length} cover{movie.covers.length === 1 ? "" : "s"}{single ? " • add 1 more to unlock shuffle" : ""}</div>

        {single ? (
          <>
            <button className="m-card-btn" disabled={busy} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
              {busy ? "Uploading…" : "+ Add Cover"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) addCover(movie, f); e.target.value = ""; }} />
          </>
        ) : (
          <button className="m-card-btn" disabled={busy} onClick={(e) => { e.stopPropagation(); shuffleOne(movie); }}>
            {busy ? "…" : "🔀 Shuffle"}
          </button>
        )}
      </div>
    </div>
  );
}

export function CoverMatrixCoverCard({ movie, cover, index }: { movie: MatrixMovie; cover: string; index: number }) {
  const setActiveCover = useCoverMatrix((s) => s.setActiveCover);
  const deleteCover = useCoverMatrix((s) => s.deleteCover);
  const replaceCover = useCoverMatrix((s) => s.replaceCover);
  const busyId = useCoverMatrix((s) => s.busyId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showDelete, setShowDelete] = useState(false);
  const busy = busyId === movie.id;
  const raw = movie.covers_raw?.[index] || cover;
  const isActive = movie.cover_url === cover || movie.cover_url_raw === raw || movie.cover_schedule?.activeIndex === index;
  const countdown = useCountdown(isActive && movie.covers.length > 1 ? movie.cover_schedule?.nextRotateAt : null);
  return (
    <div className={`m-card ${isActive ? "is-active" : ""}`} onClick={() => setActiveCover(movie, cover)}>
      <div className="m-card-media">
        <img src={cover} alt={`${movie.title} cover ${index + 1}`} loading="lazy" />
        {isActive && <span className="m-card-active">ACTIVE</span>}
        {isActive && movie.covers.length > 1 && countdown && <div className="m-card-timer-overlay"><span className="m-card-timer-label">NEXT COVER IN</span><span className="m-card-timer-big">{countdown}</span></div>}
      </div>
      <div className="m-card-body">
        <div className="m-card-meta">Cover {index + 1}{isActive ? " • live now" : ""}</div>

        <div className="m-card-actions">
          <button className="m-card-btn" disabled={busy} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Replace</button>
          <button className="m-card-btn danger" disabled={busy} onClick={(e) => { e.stopPropagation(); setShowDelete(true); }}>Delete</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) replaceCover(movie, cover, f); e.target.value = ""; }} />
      </div>
      <DeleteNotice open={showDelete} cover={cover} movieTitle={movie.title} isActive={isActive} busy={busy} onCancel={() => setShowDelete(false)} onConfirm={() => { setShowDelete(false); deleteCover(movie, cover); }} />
    </div>
  );
}

export function CoverMatrixAddCard({ movie }: { movie: MatrixMovie }) {
  const addCover = useCoverMatrix((s) => s.addCover);
  const busyId = useCoverMatrix((s) => s.busyId);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="m-card m-card-add" onClick={() => fileRef.current?.click()}>
      <div className="m-card-add-plus">+</div>
      <div className="m-card-meta">Add cover</div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) addCover(movie, f); e.target.value = ""; }} />
      {busyId === movie.id && <div className="m-card-meta">Uploading…</div>}
    </div>
  );
}

