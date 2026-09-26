"use client";
import { useMemo, useState } from "react";
import { useGlobalSearch } from "../../../../stores/use-global-search";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";
import MovieCard from "../../../../app/(dashboard)/movies/_components/movie-card";
import FadersDrawer from "../faders-drawer/faders-drawer";
import "./search-drawer.css";
import "../../../../app/(dashboard)/movies/latest-movies.css";
import FadersCloseBtn from "../faders-drawer/faders-close-btn";
import FilteredContent from "./filtered-content";

const getYear = (m: any) => {
  const raw = m.year || m.releaseYear || m.release_year || m.Year || m.release_date || m.created_at;
  if (!raw) return 0;
  const y = Number(String(raw).slice(0, 4));
  return isNaN(y)? 0 : y;
};

export default function SearchDrawer() {
  const { allMovies, query } = useGlobalSearch() as any;
  const { filterType, filterValue, timeRange, showFilterRow, select, selectTime, clear, selectGenre } = useFadersDrawer() as any;
  const [zoomed, setZoomed] = useState<any>(null);

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
      const words = qClean.split(" ").filter((w: any)=>w.length>=1);
      list = list.filter((m: any)=>{
        const hay = `${m.title||""} ${m.genre||""} ${m.vj||""} ${m.actors||""} ${getYear(m)}`.toLowerCase();
        if(hay.includes(q)) return true;
        if(words.length>1 && words.every((w: string)=>hay.includes(w))) return true;
        return hay.includes(qClean);
      });
    }

    if(filterType&&filterValue){
      if(filterType==="genre") list = list.filter((m: any)=>String(m.genre||"").toLowerCase().includes(filterValue.toLowerCase()));
      if(filterType==="vj") list = list.filter((m: any)=>String(m.vj||"").toLowerCase().includes(filterValue.toLowerCase()));
      if(filterType==="actor") list = list.filter((m: any)=>String(m.actors||"").toLowerCase().includes(filterValue.toLowerCase()));
      if(filterType==="time"&&timeRange) list = list.filter((m: any)=>{ const y=getYear(m); if(timeRange.end===9999) return y>=timeRange.start; return y>=timeRange.start&&y<timeRange.end; });
    }
    return list;
  }, [allMovies, query, filterType, filterValue, timeRange]);

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
      {showFilterRow && (
        <div className="search-filter-row">
          <div className="filter-chips">
            <button className={!filterType?"chip active":"chip"} onClick={()=>clear()} type="button">All</button>
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

      {data.length===0&&<div style={{padding:"40px 20px",textAlign:"center",opacity:0.5}}>No movies for {filterValue || query}</div>}

      {zoomed&&(
        <div className="search-zoom-overlay" onClick={()=>setZoomed(null)}>
          <div className="search-zoom-card" onClick={(e)=>e.stopPropagation()}><MovieCard m={zoomed} /><div className="card-year-label" style={{marginTop:8}}>{getYear(zoomed)}</div></div>
        </div>
      )}

      <FadersDrawer />
      <FadersCloseBtn />
      <FilteredContent />
    </div>
  );
}
