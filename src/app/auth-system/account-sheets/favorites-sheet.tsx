"use client"
import { useEffect, useState, useMemo } from "react"
import { useMovieStore } from "@/stores/use-movie-store"
import "./favorites-sheet.css"
import MovieRow from "@/app/(dashboard)/movies/_components/movie-row"

const MOVIE_API = "https://movie-server-api.connectu89.workers.dev/api/movies"

const normalize = (x: any) => {
  const preview = x.preview_urls?.[0] || x.preview_url || x.trailer_url || x.video_preview_url || x.preview
  return {
 ...x,
    id: String(x.id),
    cover: x.cover || x.cover_url,
    cover_url: x.cover || x.cover_url,
    video: x.video || x.video_url,
    video_url: x.video || x.video_url,
    preview_url: preview,
    preview_urls: x.preview_urls || (preview? [preview] : []),
    trailer_url: x.trailer_url || preview,
  }
}

export default function FavoritesSheet() {
  const { favIds = [], recentIds = [], lists = [], watchLaterIds = [], hydrated, _hydrate } = useMovieStore() as any
  const [allMovies, setAllMovies] = useState<any[]>([])

  useEffect(()=>{ if(!hydrated) _hydrate?.() }, [hydrated, _hydrate])

  useEffect(()=>{
    try{
      const c = localStorage.getItem("ug-all-movies")
      if(c){ const p=JSON.parse(c); if(Array.isArray(p)&&p.length){ setAllMovies(p.map(normalize)); return } }
    }catch{}
    fetch(MOVIE_API, { cache:"no-store" }).then(r=>r.json()).then(d=>{
      const list = d.movies || d.data || d || []
      if(Array.isArray(list) && list.length){
        const norm = list.map(normalize)
        setAllMovies(norm)
        try{ localStorage.setItem("ug-all-movies", JSON.stringify(norm)) }catch{}
      }
    }).catch(()=>{})
  },[])

  const byId = useMemo(()=>{
    const m = new Map()
    allMovies.forEach((x:any)=>{ if(x?.id!=null){ m.set(String(x.id), x) } })
    return m
  },[allMovies])

  const getMovies = (ids:any[]) => {
    if(!Array.isArray(ids) ||!ids.length) return []
    return ids.map((id:any)=>{
      const key = String(id)
      return byId.get(key) || allMovies.find((a:any)=> String(a?.id)===key)
    }).filter(Boolean)
  }

  const myList = lists?.find((l:any)=>l.id==="my-list")
  const watchLaterList = lists?.find((l:any)=>l.id==="watch-later")

  const myListMovies = getMovies(myList?.movieIds)
  const historyMovies = getMovies(recentIds).slice(0,20)
  const likedMovies = getMovies(favIds)
  const watchLaterMovies = watchLaterIds?.length? getMovies(watchLaterIds) : getMovies(watchLaterList?.movieIds)

  if(!hydrated) return <div className="vault-empty">Loading...</div>

  // STOP bubble to selector - this fixes swipe when row ends
  const stop = (e:any) => e.stopPropagation()

  return (
    <div className="vault-root" onTouchStart={stop}>
      <div className="vault-row-block" onTouchStart={stop} onTouchMove={stop} onTouchEnd={stop}>
        <MovieRow title="My List" movies={myListMovies} />
      </div>

      {historyMovies.length > 0 && (
        <div className="vault-row-block" onTouchStart={stop} onTouchMove={stop} onTouchEnd={stop}>
          <MovieRow title="Continue Watching" movies={historyMovies} />
        </div>
      )}

      {likedMovies.length > 0 && (
        <div className="vault-row-block" onTouchStart={stop} onTouchMove={stop} onTouchEnd={stop}>
          <MovieRow title="Liked" movies={likedMovies} />
        </div>
      )}

      {watchLaterMovies.length > 0 && (
        <div className="vault-row-block" onTouchStart={stop} onTouchMove={stop} onTouchEnd={stop}>
          <MovieRow title="Watch Later" movies={watchLaterMovies} />
        </div>
      )}
    </div>
  )
}
