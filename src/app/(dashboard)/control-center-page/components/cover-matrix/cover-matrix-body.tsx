"use client";
import { useMemo, useState } from "react";
import { useCoverMatrix } from "./cover-matrix-controller";
import { useCoverMatrixPanel } from "./cover-matrix-store";
import { CoverMatrixMovieCard, CoverMatrixCoverCard, CoverMatrixAddCard } from "./cover-matrix-card";
import "./m-body.css";

const PRESETS = [
  { label: "6h", ms: 6 * 60 * 60 * 1000 },
  { label: "24h", ms: 24 * 60 * 60 * 1000 },
  { label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
];

export default function CoverMatrixBody() {
  const view = useCoverMatrixPanel((s) => s.view);
  const selectedMovieId = useCoverMatrixPanel((s) => s.selectedMovieId);
  const backToMovies = useCoverMatrixPanel((s) => s.backToMovies);
  const movies = useCoverMatrix((s) => s.movies);
  const loading = useCoverMatrix((s) => s.loading);
  const scheduleRotate = useCoverMatrix((s) => s.scheduleRotate);
  const shuffleOne = useCoverMatrix((s) => s.shuffleOne);

  const movie = useMemo(() => movies.find((m) => m.id === selectedMovieId), [movies, selectedMovieId]);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? movies.filter((m) => `${m.title} ${m.vj || ""} ${m.genre || ""}`.toLowerCase().includes(q)) : movies;
    return list.slice(0, 20); // limit to 20
  }, [movies, query]);

  if (loading && !movies.length) return <div className="m-body-empty">Loading covers…</div>;
  if (view === "covers" && movie) {
    return (
      <div className="m-body">
        <div className="m-body-head">
          <button className="m-body-back" onClick={backToMovies}>← All Movies</button>
          <div><div className="m-body-title">{movie.title}</div><div className="m-body-sub">{movie.covers.length} covers • click a cover to make it live</div></div>
          {movie.covers.length <= 1 ? (
            <div className="m-body-schedule"><span>➕ Add 1 more cover to init schedule mode</span></div>
          ) : (
            <div className="m-body-schedule">
              <span>Auto-rotate:</span>
              {PRESETS.map((p) => (
                <button key={p.label} className={movie.cover_schedule?.intervalMs === p.ms ? "active" : ""} onClick={() => scheduleRotate(movie, p.ms)}>{p.label}</button>
              ))}
              <button onClick={() => shuffleOne(movie)}>🔀 Shuffle</button>
            </div>
          )}
        </div>
        <div className="m-body-grid">
          {movie.covers.map((c, i) => <CoverMatrixCoverCard key={c + i} movie={movie} cover={c} index={i} />)}
          <CoverMatrixAddCard movie={movie} />
        </div>
      </div>
    );
  }
  return (
    <div className="m-body">
      <div className="m-body-head"><div><div className="m-body-title">All Movies</div><div className="m-body-sub">Tap a movie to see its covers • Tap Shuffle to change its cover now</div></div></div>
      <input className="m-body-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍 Search movies, VJ, genre…" />
      <div className="m-body-count">Showing {filtered.length} of {movies.length} movies</div>
      {filtered.length === 0 ? <div className="m-body-empty">{movies.length === 0 ? "No movies yet." : "No matches — try another search."}</div> : (
        <div className="m-body-grid">{filtered.map((m) => <CoverMatrixMovieCard key={m.id} movie={m} />)}</div>
      )}
    </div>
  );
}

