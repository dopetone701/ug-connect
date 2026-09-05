"use client"
import { useRef } from "react"
import { Movie } from "../_lib/types"
import MovieCard from "./movie-card"
import "../latest-movies.css"

export default function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const state = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    locked: null as null | "x" | "y",
  })

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // only left click / touch
    if (e.button !== 0) return
    
    state.current.isDown = true
    state.current.isDragging = false
    state.current.locked = null
    state.current.startX = e.clientX
    state.current.startY = e.clientY
    state.current.scrollLeft = ref.current!.scrollLeft

    // this is the fix for snap - keep tracking even if finger leaves div
    ref.current!.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!state.current.isDown) return

    const dx = e.clientX - state.current.startX
    const dy = e.clientY - state.current.startY

    // not locked yet - decide if this is vertical scroll or horizontal drag
    if (!state.current.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return // deadzone

      if (Math.abs(dy) > Math.abs(dx)) {
        // VERTICAL - disarm all horizontal scrolls
        state.current.locked = "y"
        state.current.isDown = false
        try { ref.current!.releasePointerCapture(e.pointerId) } catch {}
        return // let the page scroll normally
      } else {
        state.current.locked = "x"
      }
    }

    if (state.current.locked === "x") {
      e.preventDefault()
      state.current.isDragging = true
      // no *1.5 multiplier - that's what causes snap back and forth
      ref.current!.scrollLeft = state.current.scrollLeft - dx
    }
  }

  const end = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!state.current.isDown) return
    state.current.isDown = false
    state.current.locked = null
    try { ref.current!.releasePointerCapture(e.pointerId) } catch {}
    // keep isDragging true for a moment to block click on cards
    setTimeout(() => {
      state.current.isDragging = false
    }, 100)
  }

  // blocks card click after dragging
  const onClickCapture = (e: React.MouseEvent) => {
    if (state.current.isDragging) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  if (!movies?.length) return null

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">{title}</h3>
        <button className="latest-see">SEE ALL</button>
      </div>
      <div className="latest-track-wrap">
        <div
          ref={ref}
          className="latest-track"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={end}
          onPointerCancel={end}
          onClickCapture={onClickCapture}
        >
          {movies.map((m) => (
            <MovieCard key={m.id} m={m} />
          ))}
        </div>
      </div>
    </div>
  )
}
