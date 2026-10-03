"use client"
import { useEffect, useState, useMemo } from "react"
import { useMovieStore } from "@/stores/use-movie-store"
import "./favorites-sheet.css"
import MovieRow from "@/app/(dashboard)/movies/_components/movie-row"
import EmptyListCard from "@/app/(dashboard)/movies/_components/empty-list-card"

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev"

export default function FavoritesSheet() {
  const { favIds = [], recentIds = [], lists = [], hydrated, _hydrate, createList } = useMovieStore() as any
  const [allMovies, setAllMovies] = useState<any[]>([])

  useEffect(()=>{ if(!hydrated) _hydrate?.() }, [hydrated])

  useEffect(()=>{
    try{
      const c = localStorage.getItem("ug-all-movies")
      if(c){ const p=JSON.parse(c); if(Array.isArray(p)&&p.length){ setAllMovies(p); return } }
    }catch{}
    fetch(`${WORKER_URL}/api/movies`).then(r=>r.json()).then(d=>{
      const list = d.movies || d.data || d || []
      if(Array.isArray(list)) setAllMovies(list)
    }).catch(()=>{})
  },[])

  const byId = useMemo(()=>{
    const m = new Map()
    allMovies.forEach((x:any)=>{ if(x?.id){ m.set(String(x.id), x); m.set(x.id, x) } })
    return m
  },[allMovies])

  const getMovies = (ids:any[]) => {
    if(!Array.isArray(ids)) return []
    return ids.map((id:any)=> byId.get(String(id)) || byId.get(id)).filter(Boolean)
  }

  const myList = lists?.find((l:any)=>l.id==="my-list")
  const customLists = lists?.filter((l:any)=>l.id!=="my-list") || []

  const myListMovies = getMovies(myList?.movieIds)
  const historyMovies = getMovies(recentIds).slice(0,20)
  const likedMovies = getMovies(favIds) // <-- liked movies OR reels if ids match

  if(!hydrated) return <div className="vault-empty">Loading...</div>

  return (
    <div className="vault-root">
      {/* 1. MY LIST - default first */}
      <MovieRow title="My List" movies={myListMovies} />

      {/* 2. CONTINUE WATCHING - only if he watched */}
      {historyMovies.length > 0 && (
        <MovieRow title="Continue Watching" movies={historyMovies} />
      )}

      {/* 3. LIKED - only if he liked a movie OR reel */}
      {likedMovies.length > 0 && (
        <MovieRow title="Liked" movies={likedMovies} />
      )}

      {/* 4. CUSTOM LISTS - pile below, not hardcoded */}
      {customLists.map((list:any)=>{
        const movies = getMovies(list.movieIds)
        return <MovieRow key={list.id} title={list.name} movies={movies} />
      })}

      {/* CREATE NEW LIST */}
      <div className="latest-root">
        <div className="latest-track-wrap">
          <div className="latest-track">
            <EmptyListCard onClick={()=>{
              const name = prompt("New list name?")
              if(name?.trim()) createList(name.trim())
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}