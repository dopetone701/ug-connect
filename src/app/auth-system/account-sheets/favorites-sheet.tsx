"use client";
import { useEffect, useState, useMemo } from "react";
import { useMovieStore } from "@/stores/use-movie-store";
import "./favorites-sheet.css";
import MovieCard from "@/app/(dashboard)/movies/_components/movie-card";

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev";

export default function FavoritesSheet() {
  const [err, setErr] = useState<string | null>(null);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [activeListId, setActiveListId] = useState<string>("my-list");

  // catch any render crash
  useEffect(() => {
    const onErr = (e: any) => setErr(e?.message || String(e));
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", (ev: any) => setErr(ev?.reason?.message || String(ev?.reason)));
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onErr as any);
    };
  }, []);

  let store: any = {};
  try { store = useMovieStore(); } catch (e: any) { setErr("useMovieStore failed: " + e.message); }

  const { recentIds = [], lists = [], _hydrate, hydrated } = store || {};

  useEffect(() => {
    try { if (!hydrated && _hydrate) _hydrate(); } catch (e: any) { setErr(e.message); }
  }, [hydrated]);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("ug-all-movies");
      if (cached) {
        const p = JSON.parse(cached);
        if (Array.isArray(p) && p.length) { setAllMovies(p); return; }
      }
    } catch {}
    fetch(`${WORKER_URL}/api/movies`).then(r=>r.json()).then(d=>{
      const list = d.movies || d.data || d || [];
      if (Array.isArray(list)) setAllMovies(list);
    }).catch((e)=> setErr("fetch movies failed: " + e.message));
  }, []);

  const myList = useMemo(() => {
    try {
      if (!Array.isArray(lists) ||!lists.length) return null;
      return lists.find((l:any) => l.id === "my-list") || lists[0];
    } catch (e: any) { setErr(e.message); return null; }
  }, [lists]);

  const customLists = Array.isArray(lists)? lists.filter((l:any)=>l.id!=="my-list") : [];
  const byId = useMemo(()=>{ const m = new Map(); allMovies.forEach((x:any)=>x?.id && m.set(String(x.id), x)); return m; }, [allMovies]);

  const historyMovies = Array.isArray(recentIds)? recentIds.map((id:any)=>byId.get(String(id))).filter(Boolean) : [];
  const activeList = Array.isArray(lists)? (lists.find((l:any)=>l.id===activeListId) || myList) : myList;
  const activeListMovies = (activeList as any)?.movieIds? (activeList as any).movieIds.map((id:any)=>byId.get(String(id))).filter(Boolean) : [];

  // THIS WILL SHOW THE ERROR ON YOUR PHONE INSTEAD OF BLACK SCREEN
  if (err) {
    return <div className="vault-empty" style={{height:"auto", padding:"12px", whiteSpace:"pre-wrap", color:"#ff5a5a"}}>ERR: {err}</div>;
  }

  if (!hydrated) return <div className="vault-empty">Loading vault...</div>;

  return (
    <div className="vault-root">
      <div className="vault-tabs">
        <button className={`v-tab ${activeListId==="recent"?"on":""}`} onClick={()=>setActiveListId("recent")}>History • {recentIds?.length||0}</button>
        <button className={`v-tab ${activeListId==="my-list"?"on":""}`} onClick={()=>setActiveListId("my-list")}>My List • {(myList as any)?.movieIds?.length||0}</button>
        {customLists.map((l:any)=><button key={l.id} className={`v-tab ${activeListId===l.id?"on":""}`} onClick={()=>setActiveListId(l.id)}>{l.name} • {l.movieIds?.length||0}</button>)}
      </div>
      <div className="vault-track">
        {activeListId==="recent"? (historyMovies.length? historyMovies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />) : <div className="vault-empty">No watch history yet</div>) :
         activeListMovies.length? activeListMovies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />) : <div className="vault-empty">Empty list — add movies from home</div>}
      </div>
    </div>
  );
}