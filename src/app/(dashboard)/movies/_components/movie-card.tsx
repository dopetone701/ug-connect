"use client"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import { Movie } from "../_lib/types"
import { useMovieStore } from "../_lib/use-movie-store"
import { useWatchDrawer } from "@/stores/use-watch-drawer"

export default function MovieCard({ m }: { m: Movie }) {
  const router = useRouter()
  const { addRecent } = useMovieStore()
  const { openDrawer } = useWatchDrawer() as any

  const movedRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)

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
    setTimeout(() => { movedRef.current = false }, 80)
  }

  const openMovie = (type: "full" | "preview" = "full") => {
    if (movedRef.current) return
    const id = String(m.id)
    addRecent(id)
    try{
      sessionStorage.setItem(`movies_home_scroll_v1`, String(window.scrollY))
      sessionStorage.setItem(`movie_preload_${id}`, JSON.stringify({
        id, title: m.title, cover_url: m.cover, video_url: (m as any).video,
        genre: m.genre, vj: m.vj, description: m.desc
      }))
    }catch{}

    // PC = real page direct - NO drawer
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      router.push(`/movies/watch/${id}?t=${type}`)
      return
    }

    // Mobile = drawer
    openDrawer(id, type as any)
  }

  const openYT = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    openMovie("full")
  }

  const openPreview = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    openMovie("preview")
  }

  return (
    <div
      className="latest-card"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={openYT}
    >
      <div className="l-card-cover">
        <img src={m.cover} alt={m.title} loading="lazy" draggable={false} />
        <div className="l-card-fade" />
        <div className="l-card-vj-on">{m.vj}</div>
        <div className="l-card-actions">
          <button type="button" className="l-a-btn play on" onClick={openYT}>PLAY</button>
          <button type="button" className="l-a-btn prev on" onClick={openPreview}>PRE</button>
        </div>
      </div>
    </div>
  )
}
