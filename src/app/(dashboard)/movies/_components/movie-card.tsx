"use client"

import { useRef } from "react"
import { Movie } from "../_lib/types"
import { useMovieStore } from "../_lib/use-movie-store"
import { useRouter } from "next/navigation"

export default function MovieCard({ m }: { m: Movie }) {
  const { addRecent } = useMovieStore()
  const router = useRouter()

  // Prevent accidental clicks after dragging/scrolling
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

    // A small tolerance prevents tiny finger/mouse movement
    // from being treated as a click.
    if (dx > 6 || dy > 6) {
      movedRef.current = true
    }
  }

  const handlePointerUp = () => {
    // Don't reset immediately.
    // onClick fires after pointerup, so keep the lock alive.
    setTimeout(() => {
      movedRef.current = false
    }, 100)
  }

  const openYT = (e?: React.MouseEvent) => {
    e?.stopPropagation()

    if (movedRef.current) {
      e?.preventDefault()
      return
    }

    addRecent(m.id)
    router.push(`/movies/watch/${m.id}`)
  }

  const openPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation()

    if (movedRef.current) {
      e?.preventDefault()
      return
    }

    addRecent(m.id)
    router.push(`/movies/watch/${m.id}?t=preview`)
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
        <img
          src={m.cover}
          alt={m.title}
          loading="lazy"
          draggable={false}
        />

        <div className="l-card-fade" />

        <div className="l-card-vj-on">
          {m.vj}
        </div>

        <div className="l-card-actions">
          <button
            type="button"
            className="l-a-btn play on"
            onClick={openYT}
          >
            PLAY
          </button>

          <button
            type="button"
            className="l-a-btn prev on"
            onClick={openPreview}
          >
            PRE
          </button>
        </div>
      </div>
    </div>
  )
}
