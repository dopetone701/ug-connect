"use client"
import { useEffect, useState, useMemo } from "react"
import { useMovieStore } from "@/stores/use-movie-store"
import "./favorites-sheet.css"
import MovieCard from "@/app/(dashboard)/movies/_components/movie-card"
import EmptyListCard from "@/app/(dashboard)/movies/_components/empty-list-card"

const WORKER_URL = "https://user-account-server-api.connectu89.workers.dev"

export default function FavoritesSheet() {
  const { favIds, recentIds, lists, hydrated, _hydrate, createList } = useMovieStore() as any
  const [allMovies, setAllMovies] = useState<any[]>([])

  useEffect(()=>{ if(!hydrated) _hydrate?.() }, [hydrated])

  useEffect(()=>{
    try{
      const cached = localStorage.getItem("ug-all-movies")
      if(cached){ const p=JSON.parse(cached); if(Array.isArray(p)&&p.length){ setAllMovies(p); return } }
    }catch{}
    fetch(`${WORKER_URL}/api/movies`).then(r=>r.json()).then(d=>{
      const list = d.movies || d.data || d || []
      if(Array.isArray(list)){ setAllMovies(list); try{localStorage.setItem("ug-all-movies", JSON.stringify(list.slice(0,300)))}catch{} }
    }).catch(()=>{})
  },[])

  const byId = useMemo(()=>{
    const m = new Map()
    allMovies.forEach((x:any)=>{ if(x?.id) { m.set(String(x.id), x); m.set(x.id, x) } })
    return m
  },[allMovies])

  const getMovies = (ids:any[]) => (Array.isArray(ids)? ids : []).map((id:any)=>byId.get(id) || byId.get(String(id))).filter(Boolean)

  const myList = lists?.find((l:any)=>l.id==="my-list") || lists?.[0]
  const customLists = lists?.filter((l:any)=>l.id!=="my-list") || []

  const myListMovies = getMovies(myList?.movieIds)
  const recentMovies = getMovies(recentIds).slice(0,20)
  const favMovies = getMovies(favIds)

  if(!hydrated) return <div className="vault-empty">Loading library...</div>

  return (
    <div className="vault-root vertical">
      {/* MY LIST - FIRST */}
      <div className="vault-section">
        <div className="vault-h"><span>My List</span><span className="v-count">{myListMovies.length}</span></div>
        <div className="vault-row">
          {myListMovies.length===0? <div className="vault-empty small">Empty — add from home</div> :
            myListMovies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)}
        </div>
      </div>

      {/* RECENT - 20 */}
      <div className="vault-section">
        <div className="vault-h"><span>Continue Watching</span><span className="v-count">{recentMovies.length}</span></div>
        <div className="vault-row">
          {recentMovies.length===0? <div className="vault-empty small">No watch history yet</div> :
            recentMovies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)}
        </div>
      </div>

      {/* LIKED */}
      {favMovies.length>0 && (
        <div className="vault-section">
          <div className="vault-h"><span>Liked</span><span className="v-count">{favMovies.length}</span></div>
          <div className="vault-row">
            {favMovies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)}
          </div>
        </div>
      )}

      {/* CUSTOM LISTS - VERTICAL SCROLL WHEN OVERFLOW */}
      {customLists.map((list:any)=>{
        const movies = getMovies(list.movieIds)
        return (
          <div key={list.id} className="vault-section">
            <div className="vault-h"><span>{list.name}</span><span className="v-count">{movies.length}</span></div>
            <div className="vault-row">
              {movies.length===0? <div className="vault-empty small">Empty list</div> :
                movies.map((m:any)=><MovieCard key={String(m.id)} m={m} allMovies={allMovies} />)}
            </div>
          </div>
        )
      })}

      {/* CREATE LIST BTN */}
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