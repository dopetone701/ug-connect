"use client"

import { useEffect, useRef } from "react"
import { useMovieStore } from "../../../../stores/use-movie-store"
import "../latest-movies.css"
import { useWatchDrawer } from "@/stores/use-watch-drawer"

type Props = {
  movies?: any[]
}

export default function UserListsRow({ movies = [] }: Props) {
  const { lists, createList } = useMovieStore() as any

  useEffect(() => {
    if (lists.length === 0) {
      createList("my-list")
    }
  }, [lists.length, createList])

  const mainList = lists[0]

  if (!mainList) {
    return (
      <div className="latest-root">
        <div className="latest-head">
          <h3 className="latest-title">my list</h3>
        </div>
        <div className="latest-track-wrap">
          <div className="latest-track">
            <div className="latest-card">
              <div className="l-card-cover" style={{display:"flex",alignItems:"center",justifyContent:"center",background:"hsl(var(--surface))",borderRadius:6}}>
                <span style={{ fontWeight: 900, fontSize: 13 }}>MY LIST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const myMovies = movies.filter((m: any) =>
    mainList.movieIds?.includes(String(m.id)) || mainList.movieIds?.includes(m.id)
  )

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">my list</h3>
        <span className="latest-see">{mainList.movieIds?.length || 0} movies</span>
      </div>
      <div className="latest-track-wrap">
        <div className="latest-track">
          {myMovies.length === 0? (
            <div className="latest-card">
              <div className="l-card-cover" style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center",justifyContent:"center",background:"hsl(var(--surface))",borderRadius:6}}>
                <span style={{ fontWeight: 900, fontSize: 14 }}>MY LIST</span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>EMPTY</span>
              </div>
            </div>
          ) : (
            myMovies.map((movie: any) => (
              <ListMovieCard key={String(movie.id)} movie={movie} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ListMovieCard({ movie }: { movie: any }) {
  const movedRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const { addRecent } = useMovieStore() as any
  const { openDrawer } = useWatchDrawer()

  const handlePointerDown = (e: React.PointerEvent) => {
    movedRef.current = false
    startXRef.current = e.clientX
    startYRef.current = e.clientY
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - startXRef.current)
    const dy = Math.abs(e.clientY - startYRef.current)
    if (dx > 6 || dy > 6) movedRef.current = true
  }
  const handlePointerUp = () => {
    setTimeout(() => { movedRef.current = false }, 100)
  }

  const openMovie = (e: React.MouseEvent, mode: "full" | "preview") => {
    e.preventDefault()
    e.stopPropagation()
    if (movedRef.current) return
    const id = String(movie.id)
    addRecent(id)
    try{
      sessionStorage.setItem(`movie_preload_${id}`, JSON.stringify({id, title:movie.title, cover_url:movie.cover, video_url:movie.video, genre:movie.genre, vj:movie.vj, description:movie.desc}))
    }catch{}
    openDrawer(id, mode as any)
  }

  return (
    <div className="latest-card" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div className="l-card-cover" style={{ borderRadius: 6 }}>
        <img src={movie.cover} alt={movie.title} draggable={false} style={{width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none",userSelect:"none"}} />
        <div className="l-card-fade" />
        <div className="l-card-actions" style={{borderRadius:"0 0 6px 6px"}}>
          <button type="button" className="l-a-btn play on" style={{ borderRadius: "0 0 0 6px" }} onClick={(e) => openMovie(e, "full")}>PLAY</button>
          <button type="button" className="l-a-btn prev on" style={{ borderRadius: "0 0 6px 0" }} onClick={(e) => openMovie(e, "preview")}>PRE</button>
        </div>
      </div>
    </div>
  )
}
