"use client"
import { useEffect, useState, useMemo } from "react"
import { useMovieStore } from "@/stores/use-movie-store"
import "./favorites-sheet.css"
import MovieCard from "@/app/(dashboard)/movies/_components/movie-card"
import EmptyListCard from "@/app/(dashboard)/movies/_components/empty-list-card"

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev"

export default function FavoritesSheet() {
  const store = useMovieStore() as any
  const { favIds = [], recentIds = [], lists = [], hydrated, _hydrate, createList } = store
  const [allMovies, setAllMovies] = useState<any[]>([])

  useEffect(()=>{ if(!hydrated) _hydrate?.() }, [hydrated])

  useEffect(()=>{
    try{
      const cached = localStorage.getItem("ug-all-movies")
      if(cached){ const p=JSON.parse(cached); if(Array.isArray(p)&&p.length){ setAllMovies(p); return } }
    }catch{}
    fetch(`${WORKER_URL}/api/movies`).then(r=>r.json()).then(d=>{
      const list = d.movies || d.data || d || []
      if(Array.isArray(list)){ setAllMovies(list); try{localStorage.setItem("ug-all-movies", JSON.stringify(list.slice(0,400)))}catch{} }
    }).catch(()=>{})
  },[])

  const byId = useMemo(()=>{
    const m = new Map<string, any>()
    allMovies.forEach((x:any)=>{
      if(!x?.id) return
      m.set(String(x.id), x)
      m.set(x.id, x)
    })
    return m
  },[allMovies])

  const getMovies = (ids:any[]) => {
    if(!Array.isArray(ids)) return []
    return ids.map((id:any)=> byId.get(String(id)) || byId.get(id)).filter(Boolean)
  }

  const myList = lists?.find((l:any)=>l.id==="my-list") || lists?.[0]
  const customLists = lists?.filter((l:any)=>l.id!=="my-list") || []

  const myListMovies = getMovies(myList?.movieIds)
  const recentMovies = getMovies(recentIds).slice(0,20)
  const likedMovies = getMovies(favIds)

  if(!hydrated) return <div className="vault-empty">Loading library...</div>

  return (
    <div className="vault-root">
      {/* 1. MY LIST - FIRST */}
      <div className="vault-section">
        <div className="vault-h">My List • {myListMovies.length}</div>
        <div className="vault-row">
          {myListMovies.length===0? (
            <div className="vault-empty" style={{height:90}}>Empty — add from home</div>
          ) : myListMovies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)}
        </div>
      </div>

      {/* 2. RECENT WATCHED - UP TO 20 */}
      <div className="vault-section">
        <div className="vault-h">Continue Watching • {recentMovies.length}</div>
        <div className="vault-row">
          {recentMovies.length===0? (
            <div className="vault-empty" style={{height:90}}>No watch history yet</div>
          ) : recentMovies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)}
        </div>
      </div>

      {/* 3. LIKED */}
      {likedMovies.length>0 && (
        <div className="vault-section">
          <div className="vault-h">Liked • {likedMovies.length}</div>
          <div className="vault-row">
            {likedMovies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)}
          </div>
        </div>
      )}

      {/* 4. CUSTOM LISTS - VERTICAL STACK, EACH ROW SCROLLS HORIZONTALLY */}
      {customLists.map((list:any)=>{
        const movies = getMovies(list.movieIds)
        return (
          <div key={list.id} className="vault-section">
            <div className="vault-h">{list.name} • {movies.length}</div>
            <div className="vault-row">
              {movies.length===0? (
                <div className="vault-empty" style={{height:90}}>Empty list</div>
              ) : movies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)}
            </div>
          </div>
        )
      })}

      {/* CREATE NEW LIST */}
      <div className="vault-section">
        <div className="vault-row">
          <EmptyListCard onClick={()=>{
            const name = prompt("New list name")
            if(name) createList(name)
          }} />
        </div>
      </div>
    </div>
  )
}