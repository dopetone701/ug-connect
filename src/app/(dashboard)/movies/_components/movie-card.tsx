"use client"

import { useRef } from "react"
import { Movie } from "../_lib/types"
import { useMovieStore } from "../_lib/use-movie-store"
import { useWatchDrawer } from "@/stores/use-watch-drawer"

export default function MovieCard({ m }: { m: Movie }) {
  const { addRecent } = useMovieStore()
  const { openDrawer } = useWatchDrawer()

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
    setTimeout(() => { movedRef.current = false }, 100)
  }

  const openYT = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (movedRef.current) return
    addRecent(m.id)
    openDrawer(m.id) // <-- FIX: pass id
  }

  const openPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (movedRef.current) return
    addRecent(m.id)
    openDrawer(m.id) // <-- FIX: pass id
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
