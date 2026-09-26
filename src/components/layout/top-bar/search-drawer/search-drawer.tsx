"use client";
import { useMemo, useState } from "react";
import { useGlobalSearch } from "../../../../stores/use-global-search";
import { useFadersDrawer } from "../../../../stores/use-faders-drawer";
import MovieCard from "../../../../app/(dashboard)/movies/_components/movie-card";
import FadersDrawer from "../faders-drawer/faders-drawer";
import "./search-drawer.css";
import "../../../../app/(dashboard)/movies/latest-movies.css";

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

  // ALL CHIP SOURCES
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

  // FILTERED DATA
  const data = useMemo(() => {
    let list = allMovies || [];
    const q = String(query||"").toLowerCase().trim();
    if(q.length>=1){
      const qClean=q.replace(/\s*movies\s*$/,"").trim();
      const words=qClean.split(" ").filter((w)=>w.length>=1);
      list=list.filter((m:any)=>{
        const hay=`${m.title||""} ${m.genre||""} ${m.vj||""} ${m.actors||""}`.toLowerCase();
        if(hay.includes(q)) return true;
        if(words.length>1&&words.every((w:string)=>hay.includes(w))) return true;
        return hay.includes(qClean);
      });
    }
    if(filterType&&filterValue){
      if(filterType==="genre") list=list.filter((m:any)=>String(m.genre||"").toLowerCase().includes(filterValue.toLowerCase()));
      if(filterType==="vj") list=list.filter((m:any)=>String(m.vj||"").toLowerCase().includes(filterValue.toLowerCase()));
      if(filterType==="actor") list=list.filter((m:any)=>String(m.actors||"").toLowerCase().includes(filterValue.toLowerCase()));
      if(filterType==="time"&&timeRange) list=list.filter((m:any)=>{ const y=getYear(m); if(timeRange.end===9999) return y>=timeRange.start; return y>=timeRange.start&&y<timeRange.end; });
    }
    return list;
  }, [allMovies, query, filterType, filterValue, timeRange]);

  // DYNAMIC CHIPS BASED ON FILTER TYPE
  const chipConfig = useMemo(() => {
    if(filterType==="vj") return { list: allVjs, title: "VJ", action: (v:string)=>select("vj",v) };
    if(filterType==="actor") return { list: allActors, title: "Actor", action: (v:string)=>select("actor",v) };
    if(filterType==="time") return { list: allTimeRanges.map((t:any)=>t.label), title: "Time", action: (v:string)=>{ const t=allTimeRanges.find((x:any)=>x.label===v); if(t) selectTime(t.start,t.end); } };
    if(filterType==="genre") return { list: allGenres, title: "Genre", action: (v:string)=>select("genre",v) };
    return { list: allGenres, title: "Genre", action: (v:string)=>selectGenre(v) };
  }, [filterType, allGenres, allVjs, allActors, allTimeRanges, select, selectTime, selectGenre]);

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

      <div className="search-3col-grid">
        {data.map((m:any)=>(
          <div key={m.id} className="search-small-wrap" onClick={()=>setZoomed(m)}>
            <MovieCard m={m} />
          </div>
        ))}
      </div>

      {data.length===0&&<div style={{padding:"40px 20px",textAlign:"center",opacity:0.5}}>No movies for {filterValue}</div>}

      {zoomed&&(
        <div className="search-zoom-overlay" onClick={()=>setZoomed(null)}>
          <div className="search-zoom-card" onClick={(e)=>e.stopPropagation()}><MovieCard m={zoomed} /></div>
        </div>
      )}

      <FadersDrawer />
    </div>
  );
}
