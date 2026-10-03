"use client";
import { useEffect, useState, useMemo } from "react";
import { useMovieStore } from "@/stores/use-movie-store";
import "./favorites-sheet.css";

// reuse your real card
import MovieCard from "@/app/movies/_components/movie-card/movie-card";

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev";

export default function FavoritesSheet() {
  const { favIds, recentIds, lists, _hydrate, hydrated } = useMovieStore();
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [activeListId, setActiveListId] = useState<string>("my-list");

  useEffect(() => {
    if (!hydrated) _hydrate();
  }, [hydrated, _hydrate]);

  // fetch all movies once to resolve IDs -> real movie objects
  useEffect(() => {
    const cached = localStorage.getItem("ug-all-movies");
    if (cached) {
      try { setAllMovies(JSON.parse(cached)); return; } catch {}
    }
    fetch(`${WORKER_URL}/api/movies`)
      .then(r => r.json())
      .then(d => {
        const list = d.movies || d.data || d || [];
        setAllMovies(list);
        localStorage.setItem("ug-all-movies", JSON.stringify(list.slice(0,200)));
      })
      .catch(()=>{});
  }, []);

  const myList = lists.find(l => l.id === "my-list") || lists[0];
  const customLists = lists.filter(l => l.id !== "my-list");

  const byId = useMemo(() => {
    const map = new Map<string, any>();
    allMovies.forEach((m:any) => map.set(String(m.id), m));
    return map;
  }, [allMovies]);

  const historyMovies = recentIds.map(id => byId.get(String(id))).filter(Boolean);
  const myListMovies = (myList?.movieIds || []).map((id:any) => byId.get(String(id))).filter(Boolean);
  const activeList = lists.find(l => l.id === activeListId) || myList;
  const activeListMovies = (activeList?.movieIds || []).map((id:any) => byId.get(String(id))).filter(Boolean);

  return (
    <div className="vault-root">
      {/* TABS */}
      <div className="vault-tabs">
        <button className={`v-tab ${activeListId==="recent"?"on":""}`} onClick={()=>setActiveListId("recent")}>
          History • {recentIds.length}
        </button>
        <button className={`v-tab ${activeListId==="my-list"?"on":""}`} onClick={()=>setActiveListId("my-list")}>
          My List • {myList?.movieIds.length||0}
        </button>
        {customLists.map(l=>(
          <button key={l.id} className={`v-tab ${activeListId===l.id?"on":""}`} onClick={()=>setActiveListId(l.id)}>
            {l.name} • {l.movieIds.length}
          </button>
        ))}
      </div>

      {/* RENDER REAL CARDS */}
      <div className="vault-track">
        {activeListId==="recent" ? (
          historyMovies.length===0 ? <div className="vault-empty">No watch history yet</div> :
          historyMovies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)
        ) : activeListMovies.length===0 ? (
          <div className="vault-empty">Empty list — add movies from home</div>
        ) : (
          activeListMovies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)
        )}
      </div>

      {/* QUICK ROW - My List + History always visible below */}
      {activeListId!=="my-list" && myListMovies.length>0 && (
        <div className="vault-section">
          <h4 className="vault-h">My List</h4>
          <div className="vault-row">
            {myListMovies.slice(0,8).map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)}
          </div>
        </div>
      )}
    </div>
  );
}