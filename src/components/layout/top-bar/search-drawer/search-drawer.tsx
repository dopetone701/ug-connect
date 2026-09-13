"use client";
import { useMemo, useState } from "react";
import { useGlobalSearch } from "../../../../stores/use-global-search";
import MovieCard from "../../../../app/(dashboard)/movies/_components/movie-card";
import "./search-drawer.css";
import "../../../../app/(dashboard)/movies/latest-movies.css";

export default function SearchDrawer() {
  const { allMovies, query } = useGlobalSearch();
  const [zoomed, setZoomed] = useState<any>(null);

  const data = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (q.length < 1) return allMovies;

    const qClean = q.replace(/\s*movies\s*$/,"").trim() // "action movies" -> "action"
    const words = qClean.split(" ").filter(w => w.length >= 1) // ["action"] or ["vj","junior"]

    return allMovies.filter((m: any) => {
      const title = (m.title || "").toLowerCase()
      const genre = (m.genre || "").toLowerCase()
      const vj = (m.vj || "").toLowerCase()
      const hay = `${title} ${genre} ${vj}`

      // 1. full phrase still works
      if (hay.includes(q)) return true
      // 2. clean genre/vj exact match - fixes "action movies"
      if (genre === qClean) return true
      if (vj === qClean) return true
      // 3. every word must exist somewhere - "vj junior" needs both words
      if (words.length > 1 && words.every(w => hay.includes(w))) return true
      // 4. single word fallback
      if (hay.includes(qClean)) return true

      return false
    });
  }, [allMovies, query]);

  return (
    <div className="search-drawer-root">
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
    </div>
  );
}
