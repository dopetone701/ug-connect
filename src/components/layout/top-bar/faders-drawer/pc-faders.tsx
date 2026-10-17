"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePcFadersDrawer } from "@/stores/use-pc-faders-drawer";
import { useFadersDrawer } from "@/stores/use-faders-drawer";
import { useGlobalSearch } from "@/stores/use-global-search";
import { GENRES, GENRE_IMAGE_MAP } from "../../../../app/(dashboard)/movies/_lib/genre-filter";
import "./pc-faders.css";

const getYear = (m: any) => {
  const raw = m.year || m.Year || m.releaseYear || m.release_year || m.release_date || m.created_at || m.date;
  if (!raw) return 0;
  const str = String(raw);
  const match = str.match(/(19|20)\d{2}/);
  if (match) return parseInt(match[0], 10);
  const y = Number(str.slice(0, 4));
  return isNaN(y) ? 0 : y;
};

const KNOWN_GENRES = GENRES.filter((g) => g.id !== "all").map((g) => ({ id: g.id, label: g.label.toLowerCase() }));
function parseGenresFromString(raw: string): string[] {
  if (!raw) return [];
  const lower = raw.toLowerCase();
  const found: string[] = [];
  KNOWN_GENRES.forEach((k) => {
    const variants = [k.id, k.id.replace(/-/g, " "), k.label.toLowerCase()];
    for (const v of variants) { if (lower.includes(v)) { if (!found.includes(k.id)) found.push(k.id); break; } }
  });
  if (found.length === 0) { String(raw).split(",").forEach((p) => { const c = p.trim().toLowerCase(); if (c) found.push(c); }); }
  return found;
}

function useFaderData() {
  const { allMovies } = useGlobalSearch() as any;
  const genres = useMemo(() => {
    const s = new Set<string>();
    allMovies?.forEach((m: any) => { parseGenresFromString(String(m.genre || "")).forEach((g) => { if (g) s.add(g); }); });
    return Array.from(s).filter((g) => GENRES.some((cg) => cg.id === g)).sort();
  }, [allMovies]);
  const vjs = useMemo(() => {
    const s = new Set<string>();
    allMovies?.forEach((m: any) => { if (m.vj) s.add(String(m.vj).trim().toLowerCase()); });
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
  return { genres, vjs, actors, oldRanges, newRanges, genreImageMap: GENRE_IMAGE_MAP };
}

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return true;
  if (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024) return true;
  return false;
}

export default function PcFaders() {
  const router = useRouter();
  const { close, filterType, filterValue } = usePcFadersDrawer() as any;
  const gs: any = useGlobalSearch();
  const fd: any = useFadersDrawer();
  const { genres, vjs, actors, oldRanges, newRanges, genreImageMap } = useFaderData();

  const LIMIT = 8;
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setIsMounted(false);
    setTimeout(() => close(), 300);
  };

  const handleSelect = (type: string, value: string) => {
    const clean = value.toLowerCase().trim();
    fd.select?.(type, clean);
    setIsClosing(true);
    setIsMounted(false);
    setTimeout(() => {
      close();
      setTimeout(() => {
        const mobile = isMobileDevice();
        const cleanParam = encodeURIComponent(clean);
        gs.setQuery?.(clean);
        gs.setSection?.(type === "actor" ? null : clean);
        gs.setOpen?.(true);
        gs.setIsOpen?.(true);
        gs.openSearch?.();
        if (mobile) {
          window.dispatchEvent(new CustomEvent("ug-open-search-panel"));
        } else {
          router.push(`/search?q=${cleanParam}&filter=${type}&section=${cleanParam}`);
        }
      }, 100);
    }, 280);
  };

  // FIXED: Time now shows in topbar + dynamic island + filtered content
  const handleSelectTime = (start: number, end: number) => {
    const label = start >= 2020 ? `${start}-Present` : `${start}-${end}`;
    fd.selectTime?.(start, end);
    setIsClosing(true);
    setIsMounted(false);
    setTimeout(() => {
      close();
      setTimeout(() => {
        const mobile = isMobileDevice();
        // FIX: Set query to label so topbar + dynamic island show it
        // SearchDrawer will skip text search for time queries and use timeRange from drive
        gs.setQuery?.(label);
        gs.setSection?.(null);
        gs.setOpen?.(true);
        gs.setIsOpen?.(true);
        gs.openSearch?.();
        if (mobile) {
          window.dispatchEvent(new CustomEvent("ug-open-search-panel"));
        } else {
          router.push(`/search?q=${encodeURIComponent(label)}&filter=time&section=time&start=${start}&end=${end}`);
        }
      }, 100);
    }, 280);
  };

  const handleSeeAll = (type: "genre" | "vj" | "actor" | "time") => {
    fd.select?.(type, "");
    fd.setShowFilterRow?.(true);
    setIsClosing(true);
    setIsMounted(false);
    setTimeout(() => {
      close();
      setTimeout(() => {
        const mobile = isMobileDevice();
        gs.setQuery?.("");
        gs.setSection?.(type);
        gs.setOpen?.(true);
        gs.setIsOpen?.(true);
        gs.openSearch?.();
        if (mobile) {
          window.dispatchEvent(new CustomEvent("ug-open-search-panel"));
        } else {
          router.push(`/search?q=&filter=${type}&section=${type}`);
        }
      }, 100);
    }, 280);
  };

  return (
    <div className={`pc-faders-page ${isMounted ? "open" : ""} ${isClosing ? "closing" : ""}`}>
      <div className="pc-faders-page-header">
        <h2>Filters</h2>
        <button onClick={handleClose} className="pc-faders-page-close">✕ Close</button>
      </div>
      <div className="pc-faders-page-content">
        <div className="f-section">
          <div className="f-section-title">Filter by genre</div>
          <div className="f-circles-grid">
            {genres.slice(0, LIMIT).map((g: string) => {
              const key = g.toLowerCase().trim();
              const imgSrc = genreImageMap[key] || "";
              const genreObj = GENRES.find((x) => x.id === key);
              const label = genreObj?.label || g;
              return (
                <button key={g} className={`f-circle-item ${filterType === "genre" && filterValue === g ? "active" : ""}`} onClick={() => handleSelect("genre", g)} type="button">
                  <div className="f-circle has-img">
                    {imgSrc ? <img src={imgSrc} alt={g} loading="lazy" /> : null}
                    <span className="f-circle-fallback" style={{ display: imgSrc ? "none" : "flex" }}>{label[0]?.toUpperCase()}</span>
                  </div>
                  <span className="f-circle-label">{label}</span>
                </button>
              );
            })}
          </div>
          {genres.length > LIMIT && <button className="f-showall" onClick={() => handleSeeAll("genre")} type="button">See all ({genres.length})</button>}
        </div>

        <div className="f-section">
          <div className="f-section-title">Filter by VJ</div>
          <div className="f-pills-grid">
            {vjs.slice(0, LIMIT).map((v: string) => (
              <button key={v} className={`f-pill ${filterType === "vj" && filterValue === v ? "active" : ""}`} onClick={() => handleSelect("vj", v)} type="button">{v}</button>
            ))}
          </div>
          {vjs.length > LIMIT && <button className="f-showall" onClick={() => handleSeeAll("vj")} type="button">See all ({vjs.length})</button>}
        </div>

        <div className="f-section">
          <div className="f-section-title">Filter by actor</div>
          <div className="f-circles-grid">
            {actors.slice(0, LIMIT).map((a: string) => (
              <button key={a} className={`f-circle-item ${filterType === "actor" && filterValue === a ? "active" : ""}`} onClick={() => handleSelect("actor", a)} type="button">
                <div className="f-circle actor">★</div><span className="f-circle-label">{a}</span>
              </button>
            ))}
          </div>
          {actors.length > LIMIT && <button className="f-showall" onClick={() => handleSeeAll("actor")} type="button">See all ({actors.length})</button>}
        </div>

        <div className="f-section">
          <div className="f-section-title">Filter by time</div>
          <div className="wa-card">
            <div className="wa-subhead">Latest & Current</div>
            {newRanges.slice(0, 3).map((t: any) => (
              <button key={t.label} className={`wa-row ${filterType === "time" && filterValue === t.label ? "active" : ""}`} onClick={() => handleSelectTime(t.start, t.end)} type="button">
                <div className="wa-row-icon">◉</div><div className="wa-row-label">{t.label}</div><div className="wa-row-chev">›</div>
              </button>
            ))}
            <div className="wa-subhead">Old is Gold ( Below 2005 )</div>
            {oldRanges.slice(0, 2).map((t: any) => (
              <button key={t.label} className={`wa-row ${filterType === "time" && filterValue === t.label ? "active" : ""}`} onClick={() => handleSelectTime(t.start, t.end)} type="button">
                <div className="wa-row-icon">◷</div><div className="wa-row-label">{t.label}</div><div className="wa-row-chev">›</div>
              </button>
            ))}
            {(oldRanges.length + newRanges.length) > 5 && <button className="wa-seeall" onClick={() => handleSeeAll("time")} type="button">See all ({oldRanges.length + newRanges.length})</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

