"use client"

import { useRef } from "react"
import { Movie } from "../_lib/types"
import MovieCard from "./movie-card"
import "../latest-movies.css"

export default function MovieRow({
  title,
  movies,
}: {
  title: string
  movies: Movie[]
}) {
  const ref = useRef<HTMLDivElement>(null)

  const drag = useRef({
    isDown: false,
    isHorizontal: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
  })

  const DRAG_THRESHOLD = 6

  const pointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Don't hijack buttons or other interactive elements
    if ((e.target as HTMLElement).closest("button, a, input, textarea, select")) {
      return
    }

    const el = ref.current
    if (!el) return

    drag.current.isDown = true
    drag.current.isHorizontal = false
    drag.current.isDragging = false

    drag.current.startX = e.clientX
    drag.current.startY = e.clientY
    drag.current.scrollLeft = el.scrollLeft

    el.classList.add("is-pressing")
  }

  const pointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || !drag.current.isDown) return

    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY

    /*
     * Wait until the gesture has enough movement
     * before deciding horizontal vs vertical.
     */
    if (!drag.current.isHorizontal) {
      // Vertical gesture → release carousel control
      if (
        Math.abs(dy) > Math.abs(dx) &&
        Math.abs(dy) > DRAG_THRESHOLD
      ) {
        drag.current.isDown = false
        drag.current.isHorizontal = false
        drag.current.isDragging = false

        el.classList.remove("is-pressing")
        el.classList.remove("is-dragging")

        return
      }

      // Not enough movement yet
      if (Math.abs(dx) < DRAG_THRESHOLD) {
        return
      }

      // Horizontal gesture confirmed
      drag.current.isHorizontal = true
      drag.current.isDragging = true

      el.classList.remove("is-pressing")
      el.classList.add("is-dragging")
    }

    // Direct 1:1 finger movement
    el.scrollLeft = drag.current.scrollLeft - dx
  }

  const pointerUp = () => {
    const el = ref.current

    drag.current.isDown = false
    drag.current.isHorizontal = false

    if (el) {
      el.classList.remove("is-pressing")
      el.classList.remove("is-dragging")
    }

    /*
     * Keep dragging true very briefly so a release
     * doesn't accidentally trigger a card/button click.
     */
    if (drag.current.isDragging) {
      setTimeout(() => {
        drag.current.isDragging = false
      }, 80)
    } else {
      drag.current.isDragging = false
    }
  }

  const pointerCancel = () => {
    drag.current.isDown = false
    drag.current.isHorizontal = false
    drag.current.isDragging = false

    ref.current?.classList.remove("is-pressing")
    ref.current?.classList.remove("is-dragging")
  }

  if (!movies?.length) return null

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">{title}</h3>

        <button
          className="latest-see"
          onClick={() => {
            if (drag.current.isDragging) return
          }}
        >
          SEE ALL
        </button>
      </div>

      <div className="latest-track-wrap">
        <div
          ref={ref}
          className="latest-track"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerCancel}
          onPointerLeave={(e) => {
            /*
             * Only finish mouse drags when the pointer leaves.
             * Touch/pointer gestures are allowed to continue.
             */
            if (e.pointerType === "mouse") {
              pointerUp()
            }
          }}
        >
          {movies.map((m) => (
            <MovieCard
              key={m.id}
              m={m}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
