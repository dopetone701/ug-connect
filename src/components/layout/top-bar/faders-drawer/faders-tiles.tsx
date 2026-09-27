"use client";
import { useMemo } from "react";
import { useGlobalSearch } from "../../../../stores/use-global-search";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";

const getYear = (m: any) => {
  const raw = m.year || m.releaseYear || m.release_year || m.Year || m.release_date || m.created_at;
  if (!raw) return 0;
  const y = Number(String(raw).slice(0, 4));
  return isNaN(y)? 0 : y;
};

export function useFaderData() {
  const { allMovies } = useGlobalSearch() as any;
  const genres = useMemo(() => {
    const s = new Set<string>();
    allMovies?.forEach((m: any) => String(m.genre || "").split(",").forEach((g: string) => { const v=g.trim().toLowerCase(); if(v) s.add(v); }));
    return Array.from(s).sort();
  }, [allMovies]);
  const vjs = useMemo(() => {
    const s = new Set<string>();
    allMovies?.forEach((m: any) => { if(m.vj) s.add(String(m.vj).trim().toLowerCase()); });
    return Array.from(s).sort();
  }, [allMovies]);
  const actors = useMemo(() => {
    const s = new Set<string>();
    allMovies?.forEach((m: any) => String(m.actors||"").split(",").forEach((a: string) => { const v=a.trim().toLowerCase(); if(v) s.add(v); }));
    return Array.from(s).sort();
  }, [allMovies]);
  const { oldRanges, newRanges } = useMemo(() => {
    const yrs: number[] = [];
    allMovies?.forEach((m: any) => { const y = getYear(m); if (y > 1900 && y < 2030) yrs.push(y); });
    const source = yrs.length? yrs : [1991, 1995, 1999, 2000, 2003, 2005, 2010, 2015, 2020, 2023, 2024, 2025];
    const CURRENT_YEAR = new Date().getFullYear();
    const CURRENT_BUCKET = Math.floor(CURRENT_YEAR / 5) * 5;
    const set = new Set<string>();
    source.forEach(y => {
      const start = Math.floor(y / 5) * 5;
      if (start >= CURRENT_BUCKET) set.add(`${start}-Present`);
      else set.add(`${start}-${start + 5}`);
    });
    const all = Array.from(set).sort((a, b) => parseInt(a) - parseInt(b)).map(l => {
      if (l.includes("Present")) return { label: l, start: parseInt(l), end: 9999 };
      const [s, e] = l.split("-").map(Number);
      return { label: l, start: s, end: e };
    });
    return { oldRanges: all.filter(r => r.start < 2005), newRanges: all.filter(r => r.start >= 2005).sort((a, b) => b.start - a.start) };
  }, [allMovies]);
  const genreImageMap: Record<string, string> = {
    action: "/genre-filter-images/action.JPG",
    adventure: "/genre-filter-images/adventure.JPG",
    animations: "/genre-filter-images/animations.jpg",
    animation: "/genre-filter-images/animations.jpg",
    crime: "/genre-filter-images/crime.PNG",
    horror: "/genre-filter-images/horror.PNG",
    "rango-all": "/genre-filter-images/rango-all.PNG",
    romantic: "/genre-filter-images/romantic.PNG",
    romance: "/genre-filter-images/romantic.PNG",
    scify: "/genre-filter-images/scify.PNG",
    "sci-fi": "/genre-filter-images/scify.PNG",
    scifi: "/genre-filter-images/scify.PNG",
    thriller: "/genre-filter-images/thriller.jpg",
  };
  return { genres, vjs, actors, oldRanges, newRanges, genreImageMap };
}

export default function FadersTiles({ select, selectTime, filterType, filterValue, onSeeAll }: any) {
  const { genres, vjs, actors, oldRanges, newRanges, genreImageMap } = useFaderData();
  const openSearchAll = (type: "genre" | "vj" | "actor" | "time") => {
    const fd: any = (useFadersDrawer as any).getState?.();
    const gs: any = (useGlobalSearch as any).getState?.();
    fd.setShowFilterRow?.(true);
    fd.select?.(type, "");
    gs?.setQuery?.(""); gs?.setSection?.(type); gs?.setOpen?.(true); gs?.setIsOpen?.(true); gs?.openDrawer?.(); gs?.setShowSearch?.(true);
    if (onSeeAll) onSeeAll();
  };
  return (
    <>
      <div className="f-section">
        <div className="f-section-title">Filter by genre</div>
        <div className="f-circles-grid">
          {genres.slice(0, 6).map((g: string) => {
            const key = g.toLowerCase().trim(); const imgSrc = genreImageMap[key] || "";
            return (
              <button key={g} className={`f-circle-item ${filterType === "genre" && filterValue === g? "active" : ""}`} onClick={() => select("genre", g)} type="button">
                <div className="f-circle has-img">
                  {imgSrc? <img src={imgSrc} alt={g} loading="lazy" onError={(e) => { (e.currentTarget as any).style.display = "none"; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display = "flex"; }} /> : null}
                  <span className="f-circle-fallback" style={{ display: imgSrc? "none" : "flex" }}>{g[0]?.toUpperCase()}</span>
                </div>
                <span className="f-circle-label">{g}</span>
              </button>
            );
          })}
        </div>
        {genres.length > 6 && <button className="f-showall" onClick={() => openSearchAll("genre")} type="button">See all ({genres.length})</button>}
      </div>
      <div className="f-section">
        <div className="f-section-title">Filter by VJ</div>
        <div className="f-pills-grid">
          {vjs.slice(0, 6).map((v: string) => (
            <button key={v} className={`f-pill ${filterType === "vj" && filterValue === v? "active" : ""}`} onClick={() => select("vj", v)} type="button">{v}</button>
          ))}
        </div>
        {vjs.length > 6 && <button className="f-showall" onClick={() => openSearchAll("vj")} type="button">See all ({vjs.length})</button>}
      </div>
      <div className="f-section">
        <div className="f-section-title">Filter by actor</div>
        <div className="f-circles-grid">
          {actors.slice(0, 6).map((a: string) => (
            <button key={a} className={`f-circle-item ${filterType === "actor" && filterValue === a? "active" : ""}`} onClick={() => select("actor", a)} type="button">
              <div className="f-circle actor">★</div><span className="f-circle-label">{a}</span>
            </button>
          ))}
        </div>
        {actors.length > 6 && <button className="f-showall" onClick={() => openSearchAll("actor")} type="button">See all ({actors.length})</button>}
      </div>
      <div className="f-section">
        <div className="f-section-title">Filter by time</div>
        <div className="wa-card">
          <div className="wa-subhead">Latest & Current</div>
          {newRanges.slice(0, 3).map((t: any) => (
            <button key={t.label} className={`wa-row ${filterType === "time" && filterValue === t.label? "active" : ""}`} onClick={() => selectTime(t.start, t.end)} type="button">
              <div className="wa-row-icon">◉</div><div className="wa-row-label">{t.label}</div><div className="wa-row-chev">›</div>
            </button>
          ))}
          <div className="wa-subhead">Old is Gold ( Below 2005 )</div>
          {oldRanges.slice(0, 2).map((t: any) => (
            <button key={t.label} className={`wa-row ${filterType === "time" && filterValue === t.label? "active" : ""}`} onClick={() => selectTime(t.start, t.end)} type="button">
              <div className="wa-row-icon">◷</div><div className="wa-row-label">{t.label}</div><div className="wa-row-chev">›</div>
            </button>
          ))}
          {(oldRanges.length + newRanges.length) > 5 && <button className="wa-seeall" onClick={() => openSearchAll("time")} type="button">See all ({oldRanges.length + newRanges.length})</button>}
        </div>
      </div>
    </>
  );
}
