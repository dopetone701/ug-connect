"use client";
import { useMemo, useState } from "react";
import { useGlobalSearch } from "../../../../stores/use-global-search";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";
import MovieCard from "../../../../app/(dashboard)/movies/_components/movie-card";
import FadersDrawer from "../faders-drawer/faders-drawer";
import "./search-drawer.css";
import "../../../../app/(dashboard)/movies/latest-movies.css";

export default function SearchDrawer() {
  const { allMovies, query } = useGlobalSearch() as any;
  const { selectedGenre, showFilterRow, selectGenre } = useFadersDrawer() as any;
  const [zoomed, setZoomed] = useState<any>(null);

  const allGenres = useMemo(() => {
    const s = new Set<string>();
    (allMovies || []).forEach((m: any) => {
      String(m.genre || "").split(",").forEach((g: string) => {
        const c = g.trim().toLowerCase();
        if (c) s.add(c);
      });
    });
    return Array.from(s).sort();
  }, [allMovies]);

  const data = useMemo(() => {
    let list = allMovies || [];
    const q = String(query || "").toLowerCase().trim();
    if (q.length >= 1) {
      const qClean = q.replace(/\s*movies\s*$/, "").trim();
      const words = qClean.split(" ").filter((w) => w.length >= 1);
      list = list.filter((m: any) => {
        const title = String(m.title || "").toLowerCase();
        const genre = String(m.genre || "").toLowerCase();
        const vj = String(m.vj || "").toLowerCase();
        const hay = `${title} ${genre} ${vj}`;
        if (hay.includes(q)) return true;
        if (genre === qClean) return true;
        if (vj === qClean) return true;
        if (words.length > 1 && words.every((w: string) => hay.includes(w))) return true;
        if (hay.includes(qClean)) return true;
        return false;
      });
    }
    if (selectedGenre) {
      list = list.filter((m: any) =>
        String(m.genre || "").toLowerCase().includes(selectedGenre.toLowerCase()) ||
        String(m.vj || "").toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }
    return list;
  }, [allMovies, query, selectedGenre]);

  return (
    <div className="search-drawer-root">
      {showFilterRow && (
        <div className="search-filter-row">
          <div className="filter-chips">
            <button className={!selectedGenre? "chip active" : "chip"} onClick={() => selectGenre(null)} type="button">All</button>
            {allGenres.map((g: string) => (
              <button key={g} className={selectedGenre === g? "chip active" : "chip"} onClick={() => selectGenre(g)} type="button">{g}</button>
            ))}
          </div>
        </div>
      )}

      <div className="search-3col-grid">
        {data.map((m: any) => (
          <div key={m.id} className="search-small-wrap" onClick={() => setZoomed(m)}>
            <MovieCard m={m} />
          </div>
        ))}
      </div>

      {zoomed && (
        <div className="search-zoom-overlay" onClick={() => setZoomed(null)}>
          <div className="search-zoom-card" onClick={(e) => e.stopPropagation()}>
            <MovieCard m={zoomed} />
          </div>
        </div>
      )}

      <FadersDrawer />
    </div>
  );
}