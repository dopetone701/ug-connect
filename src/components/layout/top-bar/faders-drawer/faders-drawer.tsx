"use client";
import { useMemo } from "react";
import { useGlobalSearch } from "../../../../stores/use-global-search";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";
import "./faders-drawer.css";

export default function FadersDrawer() {
  const { isOpen, close, selectGenre } = useFadersDrawer() as any;
  const { allMovies } = useGlobalSearch() as any;

  const genres = useMemo(() => {
    const s = new Set<string>();
    (allMovies || []).forEach((m: any) => {
      String(m.genre || "").split(",").forEach((g: string) => {
        const c = g.trim().toLowerCase();
        if (c) s.add(c);
      });
    });
    return Array.from(s).slice(0,6);
  }, [allMovies]);

  return (
    <div className={`faders-drawer-root ${isOpen? "open" : ""}`}>
      <div className="faders-backdrop" onClick={close} />
      <div className="faders-sheet">
        <div className="faders-handle" />
        <div className="faders-scroll">
          <div className="faders-genre-circles">
            {genres.map((g: string) => (
              <button key={g} className="faders-circle-item" onClick={() => selectGenre(g)} type="button">
                <div className="faders-circle">{g.slice(0,2).toUpperCase()}</div>
                <span className="faders-circle-label">{g}</span>
              </button>
            ))}
          </div>
          <button className="faders-showall" onClick={() => selectGenre(null)} type="button">Show all</button>
        </div>
      </div>
    </div>
  );
}
