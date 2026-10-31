"use client";
import { useMemo, useState, useEffect } from "react";
import { useGlobalSearch } from "../../../../stores/use-global-search";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";
import { useMovieStore } from "@/stores/use-movie-store";
import { getSections } from "@/app/(dashboard)/movies/_lib/sections.config";
import MovieCard from "../../../../app/(dashboard)/movies/_components/movie-card";
import FadersDrawer from "../faders-drawer/faders-drawer";
import "./search-drawer.css";
import "../../../../app/(dashboard)/movies/latest-movies.css";
import FadersCloseBtn from "../faders-drawer/faders-close-btn";
import FilteredContent from "./filtered-content";

const getYear = (m: any) => {
  const raw = m.year || m.Year || m.releaseYear || m.release_year || m.release_date || m.created_at || m.date;
  if (!raw) return 0;
  const str = String(raw);
  const match = str.match(/(19|20)\d{2}/);
  if (match) return parseInt(match[0], 10);
  const y = Number(str.slice(0, 4));
  return isNaN(y) ? 0 : y;
};

// CATEGORY FILTER - west-african = west_african = west african
function normCat(s: string) {
  return String(s || "").toLowerCase().trim().replace(/[-\s]+/g, "_").replace(/_+/g, "_");
}
function getCatIdFromText(txt: string): string | null {
  const q = normCat(txt);
  if (!q) return null;
  const cats = ["popular","western","european","west_african","east_african","south_asian","east_asian","southeast_asian","arab","west-african","east-african","south-asian","east-asian","southeast-asian","ugandan","nigerian","indian","korean","filipino","nigerian","ugandan"];
  for (const id of cats) {
    const nid = normCat(id);
    if (q === nid || q.includes(nid) || nid.includes(q)) return nid;
  }
  return null;
}

export default function SearchDrawer() {
  const { allMovies, query, activeSection } = useGlobalSearch() as any;
  const { filterType, filterValue, timeRange, showFilterRow, select, selectTime, clear, selectGenre } = useFadersDrawer() as any;
  const { favIds, recentIds } = useMovieStore() as any;
  const [zoomed, setZoomed] = useState<any>(null);

 const baseSections = useMemo(() => getSections(allMovies, { favIds, recentIds }), [allMovies, favIds, recentIds]);

  const isMyListView = useMemo(() => {
    if (!activeSection) return false;
    const a = activeSection.toLowerCase().trim();
    return a.includes("my list") || a.includes("favorite") || a.includes("favourite") || a.includes("watchlist");
  }, [activeSection]);

  const isContinueView = useMemo(() => {
    if (!activeSection) return false;
    const a = activeSection.toLowerCase().trim();
    return a.includes("continue") || a.includes("history");
  }, [activeSection]);

  const isPersonalListView = isMyListView || isContinueView;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth <= 1024 || navigator.maxTouchPoints > 0;
    if (!isMobile) return;
    const openedBySection = !!activeSection || !!filterType || showFilterRow;
    if (openedBySection) {
      const t1 = setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        const inputs = document.querySelectorAll('input[type="text"], input[type="search"], input');
        inputs.forEach((el) => (el as HTMLElement).blur());
      }, 50);
      const t2 = setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }, 300);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeSection, filterType, showFilterRow, query]);

  const allGenres = useMemo(() => {
    const s = new Set<string>();
    (allMovies || []).forEach((m: any) => String(m.genre||"").split(",").forEach((g:string)=>{ const c=g.trim().toLowerCase(); if(c) s.add(c); }));
    return Array.from(s).sort();
  }, [allMovies]);

  const allVjs = useMemo(() => {
    const s = new Set<string>();
    (allMovies || []).forEach((m:any)=>{ if(m.vj) s.add(String(m.vj).trim().toLowerCase()); });
    return Array.from(s).sort();
  }, [allMovies]);

  const allActors = useMemo(() => {
    const s = new Set<string>();
    (allMovies || []).forEach((m:any)=>String(m.actors||"").split(",").forEach((a:string)=>{ const v=a.trim().toLowerCase(); if(v) s.add(v); }));
    return Array.from(s).sort();
  }, [allMovies]);

  const { allTimeRanges } = useMemo(() => {
    const yrs:number[]=[];
    allMovies?.forEach((m:any)=>{ const y=getYear(m); if(y>1900&&y<2030) yrs.push(y); });
    const src = yrs.length? yrs : [1991,1995,2000,2005,2010,2015,2020,2024,2025];
    const CURRENT_YEAR = new Date().getFullYear();
    const CURRENT_BUCKET = Math.floor(CURRENT_YEAR/5)*5;
    const set = new Set<string>();
    src.forEach(y=>{ const st=Math.floor(y/5)*5; if(st>=CURRENT_BUCKET) set.add(`${st}-Present`); else set.add(`${st}-${st+5}`); });
    const all = Array.from(set).sort((a,b)=>parseInt(a)-parseInt(b)).map(l=>{
      if(l.includes("Present")){ const s=parseInt(l); return {label:l,start:s,end:9999}; }
      const [s,e]=l.split("-").map(Number); return {label:l,start:s,end:e};
    }).sort((a,b)=>b.start-a.start);
    return { allTimeRanges: all };
  }, [allMovies]);

  const data = useMemo(() => {
    let list: any[] = allMovies || [];
    const q = String(query||"").toLowerCase().trim();
    const yearOnly = q.replace(/\s*movies\s*$/,"").trim();
    const isYearQuery = /^(19|20)\d{2}$/.test(yearOnly);

    // === CATEGORY FILTER FROM D1 ===
    const catFromQuery = getCatIdFromText(String(query || activeSection || ""));
    if (catFromQuery && catFromQuery !== "popular") {
      const filteredByCat = list.filter((m: any) => {
        const mCat = normCat(m.category || m.origin || m.country || "");
        return mCat === catFromQuery;
      });
      if (filteredByCat.length > 0) {
        list = filteredByCat;
      }
    }

    if (activeSection) {
      const activeLower = activeSection.toLowerCase().trim();
      const activeClean = activeLower.replace(/\s*movies\s*$/,"").trim();

      if (isContinueView) {
        const sec = baseSections.find((s:any) => s.title.toLowerCase().includes("continue"));
        if (sec?.data?.length) return sec.data;
        if (recentIds?.length) {
          const recentMovies = recentIds.map((id:string) => allMovies.find((m:any) => String(m.id) === String(id))).filter(Boolean);
          if (recentMovies.length) return recentMovies;
        }
      }

      if (isMyListView) {
        const sec = baseSections.find((s:any) => s.title.toLowerCase().includes("my list") || s.title.toLowerCase().includes("favorite") || s.id === "my-list");
        if (sec?.data?.length) return sec.data;
        if (favIds?.length) {
          const favMovies = allMovies.filter((m:any) => favIds.includes(String(m.id)));
          if (favMovies.length) return favMovies;
        }
      }

      if (activeLower.includes("my list") || activeLower.includes("favorites") || activeLower.includes("favourite") || activeLower.includes("watchlist")) {
        const sec = baseSections.find((s:any) => s.title.toLowerCase().includes("my list") || s.title.toLowerCase().includes("favorite"));
        if (sec) return sec.data;
      }

      const sec = baseSections.find((s:any) => s.id === activeSection || s.title.toLowerCase() === activeSection.toLowerCase() || s.title.toLowerCase() === activeClean);
      if (sec) return sec.data;

      const fallback = baseSections.find((s:any) => s.title.toLowerCase().includes(activeClean));
      if (fallback) return fallback.data;

      const isTvQuery = activeLower.includes("tv series") || activeLower === "tv" || activeLower === "full" || activeLower === "series";
      const isMiniQuery = activeLower.includes("mini series") || activeLower === "mini";
      if (isTvQuery) {
        return (allMovies as any[]).filter((m: any) => (m.type || "").toLowerCase() === "full");
      }
      if (isMiniQuery) {
        return (allMovies as any[]).filter((m: any) => (m.type || "").toLowerCase() === "mini");
      }
    }

    if (isYearQuery) {
      const targetYear = parseInt(yearOnly, 10);
      const withYear: any[] = list
     .map((m: any) => ({ m, y: getYear(m) }))
     .filter((item: any) => item.y!==0 && Math.abs(item.y - targetYear) <= 5)
     .sort((a: any, b: any) => {
          const da = Math.abs(a.y - targetYear);
          const db = Math.abs(b.y - targetYear);
          if (da!== db) return da - db;
          if (a.y === targetYear) return -1;
          if (b.y === targetYear) return 1;
          return b.y - a.y;
        })
     .map((item: any) => ({
       ...item.m,
          _year: item.y,
          _targetYear: targetYear,
        }));
      list = withYear;
    } else if (q.length >= 1){
      const qClean = q.replace(/\s*movies\s*$/,"").trim();

      const isTv = q.includes("tv series") || qClean === "tv" || qClean === "full" || qClean === "series" || q === "tv series";
      const isMini = q.includes("mini series") || qClean === "mini" || q === "mini series";

      if (qClean.includes("continue")) {
        const sec = baseSections.find((s:any) => s.title.toLowerCase().includes("continue"));
        if (sec) {
          list = sec.data;
        }
      } else if (qClean.includes("my list") || qClean.includes("favorite") || qClean.includes("watchlist")) {
        const sec = baseSections.find((s:any) => s.title.toLowerCase().includes("my list") || s.title.toLowerCase().includes("favorite"));
        if (sec) {
          list = sec.data;
        }
      } else if (isTv) {
        list = list.filter((m:any) => String(m.type||"").toLowerCase() === "full");
      } else if (isMini) {
        list = list.filter((m:any) => String(m.type||"").toLowerCase() === "mini");
      } else {
        const isTimeQuery = qClean.includes("-present") || /^\d{4}-\d{4}$/.test(qClean) || /^\d{4}-present$/.test(qClean);
        if (!isTimeQuery) {
          const words = qClean.split(" ").filter((w: any)=>w.length>=1);
          list = list.filter((m: any)=>{
            const hay = `${m.title||""} ${m.genre||""} ${m.vj||""} ${m.actors||""} ${m.type||""} ${m.category||""} ${m.origin||""} ${getYear(m)}`.toLowerCase();
            if(hay.includes(q)) return true;
            if(words.length>1 && words.every((w: string)=>hay.includes(w))) return true;
            return hay.includes(qClean);
          });
        }
      }
    }

    if(!isPersonalListView && filterType&&filterValue){
      if(filterType==="genre") list = list.filter((m: any)=>String(m.genre||"").toLowerCase().includes(filterValue.toLowerCase()));
      if(filterType==="vj") list = list.filter((m: any)=>String(m.vj||"").toLowerCase().includes(filterValue.toLowerCase()));
      if(filterType==="actor") list = list.filter((m: any)=>String(m.actors||"").toLowerCase().includes(filterValue.toLowerCase()));
      if(filterType==="time"&&timeRange) {
        list = list.filter((m: any)=>{
          const y=getYear(m);
          if(!y) return false;
          if(timeRange.end===9999) return y>=timeRange.start;
          return y>=timeRange.start&&y<timeRange.end;
        });
      }
    }
    return list;
 }, [allMovies, query, activeSection, filterType, filterValue, timeRange, baseSections, favIds, recentIds, isMyListView, isContinueView, isPersonalListView]);

  const shouldShowFilterRow = showFilterRow && !isPersonalListView;

  const chipConfig = useMemo(() => {
    if(filterType==="vj") return { list: allVjs, title: "VJ", action: (v:string)=>select("vj",v) };
    if(filterType==="actor") return { list: allActors, title: "Actor", action: (v:string)=>select("actor",v) };
    if(filterType==="time") return { list: allTimeRanges.map((t:any)=>t.label), title: "Time", action: (v:string)=>{ const t=allTimeRanges.find((x:any)=>x.label===v); if(t) selectTime(t.start,t.end); } };
    if(filterType==="genre") return { list: allGenres, title: "Genre", action: (v:string)=>select("genre",v) };
    return { list: allGenres, title: "Genre", action: (v:string)=>selectGenre(v) };
  }, [filterType, allGenres, allVjs, allActors, allTimeRanges, select, selectTime, selectGenre]);

  const yearOnly = String(query||"").replace(/\s*movies\s*$/,"").trim();
  const isYearMode = /^(19|20)\d{2}$/.test(yearOnly);
  const targetYear = isYearMode? parseInt(yearOnly, 10) : 0;

  const exactExists = isYearMode? data.some((m:any)=> m._year === targetYear) : false;
  const fromList = isYearMode? data.filter((m:any)=> m._year >= targetYear).sort((a:any,b:any)=> a._year - b._year).slice(0,10) : [];
  const beforeList = isYearMode? data.filter((m:any)=> m._year < targetYear).sort((a:any,b:any)=> b._year - a._year).slice(0,10) : [];

  return (
    <div className="search-drawer-root">
     {shouldShowFilterRow && (
        <div className="search-filter-row">
          <div className="filter-chips">
<button className={!filterValue?"chip active":"chip"} onClick={()=>{ const fd:any=(useFadersDrawer as any).getState?.(); fd?.select?.(filterType, ""); }} type="button">All</button>
            {chipConfig.list.map((g:string)=>(
              <button key={g} className={filterValue===g?"chip active":"chip"} onClick={()=>chipConfig.action(g)} type="button">{g}</button>
            ))}
          </div>
          <div className="filter-count">{chipConfig.title} • {data.length}</div>
        </div>
      )}

      {isYearMode? (
        <>
          <div className="year-section-label">From {targetYear}</div>

          {!exactExists && (
            <div className="year-no-data">No movie available for {targetYear} — showing closest from {targetYear} to {targetYear+5}</div>
          )}

          <div className="search-3col-grid">
            {fromList.map((m:any)=>(
              <div key={m.id} className="search-small-wrap" onClick={()=>setZoomed(m)}>
                <MovieCard m={m} />
                <div className="card-year-label">{m._year}</div>
              </div>
            ))}
          </div>

          {beforeList.length>0 && (
            <>
              <div className="year-section-label">Before {targetYear}</div>
              <div className="search-3col-grid">
                {beforeList.map((m:any)=>(
                  <div key={m.id} className="search-small-wrap" onClick={()=>setZoomed(m)}>
                    <MovieCard m={m} />
                    <div className="card-year-label">{m._year}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="search-3col-grid">
          {data.map((m:any)=>(
            <div key={m.id} className="search-small-wrap" onClick={()=>setZoomed(m)}>
              <MovieCard m={m} />
            </div>
          ))}
        </div>
      )}

      {data.length===0&&<div style={{padding:"40px 20px",textAlign:"center",opacity:0.5}}>No movies for {filterValue || query || activeSection}</div>}

      {zoomed&&(
        <div className="search-zoom-overlay" onClick={()=>setZoomed(null)}>
          <div className="search-zoom-card" onClick={(e)=>e.stopPropagation()}><MovieCard m={zoomed} /><div className="card-year-label" style={{marginTop:8}}>{getYear(zoomed) || "2024"}</div></div>
        </div>
      )}

      <FadersDrawer />
      <FadersCloseBtn />
      <FilteredContent />
    </div>
  );
}