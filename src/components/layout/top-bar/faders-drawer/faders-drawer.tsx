"use client";
import { useMemo, useState } from "react";
import { useGlobalSearch } from "../../../../stores/use-global-search";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";
import "./faders-drawer.css";

const getYear = (m: any) => {
  const raw = m.year || m.releaseYear || m.release_year || m.Year || m.release_date || m.created_at;
  if (!raw) return 0;
  const y = Number(String(raw).slice(0, 4));
  return isNaN(y)? 0 : y;
};

export default function FadersDrawer() {
  const { allMovies } = useGlobalSearch() as any;
  const { isOpen, close, select, selectTime, filterType, filterValue } = useFadersDrawer() as any;

  const [exG, setExG] = useState(false);
  const [exV, setExV] = useState(false);
  const [exA, setExA] = useState(false);
  const [exT, setExT] = useState(false);

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
    allMovies?.forEach((m: any) => {
      const y = getYear(m);
      if (y > 1900 && y < 2030) yrs.push(y);
    });

    const source = yrs.length? yrs : [1991, 1995, 1999, 2000, 2003, 2005, 2010, 2015, 2020, 2023, 2024, 2025];
    const CURRENT_YEAR = new Date().getFullYear();
    const CURRENT_BUCKET = Math.floor(CURRENT_YEAR / 5) * 5;

    const set = new Set<string>();
    source.forEach(y => {
      const start = Math.floor(y / 5) * 5;
      if (start >= CURRENT_BUCKET) {
        set.add(`${start}-Present`);
      } else {
        set.add(`${start}-${start + 5}`);
      }
    });

    const all = Array.from(set)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(l => {
        if (l.includes("Present")) {
          const s = parseInt(l);
          return { label: l, start: s, end: 9999 };
        }
        const [s, e] = l.split("-").map(Number);
        return { label: l, start: s, end: e };
      });

    return {
      oldRanges: all.filter(r => r.start < 2005),
      newRanges: all.filter(r => r.start >= 2005).sort((a, b) => b.start - a.start),
    };
  }, [allMovies]);

  return (
    <div className={`faders-drawer-root ${isOpen? "open" : ""}`}>
      <div className="faders-backdrop" onClick={close} />
      <div className="faders-sheet">
        <div className="faders-handle" />
        <div className="faders-scroll">

          {/* 1 GENRE - CIRCLES */}
          <div className="f-section">
            <div className="f-section-title">Filter by genre</div>
            <div className="f-circles-grid">
              {(exG? genres : genres.slice(0, 6)).map((g: string) => (
                <button key={g} className={`f-circle-item ${filterType === "genre" && filterValue === g? "active" : ""}`} onClick={() => select("genre", g)} type="button">
                  <div className="f-circle">{g[0]?.toUpperCase()}</div>
                  <span className="f-circle-label">{g}</span>
                </button>
              ))}
            </div>
            {genres.length > 6 && <button className="f-showall" onClick={() => setExG(v =>!v)}>{exG? "Show less" : `See all (${genres.length})`}</button>}
          </div>

          {/* 2 VJ - 3D PILLS */}
          <div className="f-section">
            <div className="f-section-title">Filter by VJ</div>
            <div className="f-pills-grid">
              {(exV? vjs : vjs.slice(0, 6)).map((v: string) => (
                <button key={v} className={`f-pill ${filterType === "vj" && filterValue === v? "active" : ""}`} onClick={() => select("vj", v)} type="button">
                  {v}
                </button>
              ))}
            </div>
            {vjs.length > 6 && <button className="f-showall" onClick={() => setExV(v =>!v)}>{exV? "Show less" : `See all (${vjs.length})`}</button>}
          </div>

          {/* 3 ACTOR - CIRCLES */}
          <div className="f-section">
            <div className="f-section-title">Filter by actor</div>
            <div className="f-circles-grid">
              {(exA? actors : actors.slice(0, 6)).map((a: string) => (
                <button key={a} className={`f-circle-item ${filterType === "actor" && filterValue === a? "active" : ""}`} onClick={() => select("actor", a)} type="button">
                  <div className="f-circle actor">★</div>
                  <span className="f-circle-label">{a}</span>
                </button>
              ))}
            </div>
            {actors.length > 6 && <button className="f-showall" onClick={() => setExA(v =>!v)}>{exA? "Show less" : `See all (${actors.length})`}</button>}
          </div>

          {/* 4 TIME - TITLE OUTSIDE TILE + LATEST ON TOP + PRESENT */}
          <div className="f-section">
            <div className="f-section-title">Filter by time</div>
            <div className="wa-card">
              <div className="wa-subhead">Latest & Current</div>
              {newRanges.length === 0 && <div style={{ padding: "10px 16px", opacity:.5, fontSize: "12px" }}>No recent movies</div>}
              {(exT? newRanges : newRanges.slice(0, 6)).map((t: any) => (
                <button key={t.label} className={`wa-row ${filterType === "time" && filterValue === t.label? "active" : ""}`} onClick={() => selectTime(t.start, t.end)} type="button">
                  <div className="wa-row-icon">◉</div>
                  <div className="wa-row-label">{t.label}</div>
                  <div className="wa-row-chev">›</div>
                </button>
              ))}

              <div className="wa-subhead">Old is Gold ( Below 2005 )</div>
              {oldRanges.length === 0 && <div style={{ padding: "10px 16px", opacity:.5, fontSize: "12px" }}>No old movies</div>}
              {(exT? oldRanges : oldRanges.slice(0, 4)).map((t: any) => (
                <button key={t.label} className={`wa-row ${filterType === "time" && filterValue === t.label? "active" : ""}`} onClick={() => selectTime(t.start, t.end)} type="button">
                  <div className="wa-row-icon">◷</div>
                  <div className="wa-row-label">{t.label}</div>
                  <div className="wa-row-chev">›</div>
                </button>
              ))}
              {(oldRanges.length + newRanges.length) > 10 && <button className="wa-seeall" onClick={() => setExT(v =>!v)}>{exT? "Show less" : `See all (${oldRanges.length + newRanges.length})`}</button>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
