"use client"
import { useRef } from "react"
import { Movie } from "../_lib/types"
import MovieCard from "./movie-card"
import "../latest-movies.css"

export default function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ isDown:false, startX:0, scrollLeft:0 })

  const mDown = (e: any) => {
    drag.current.isDown = true
    drag.current.startX = (e.pageX?? e.touches?.[0]?.pageX) - ref.current!.offsetLeft
    drag.current.scrollLeft = ref.current!.scrollLeft
  }
  const mUp = () => { drag.current.isDown = false }
  const mMove = (e: any) => {
    if(!drag.current.isDown) return
    e.preventDefault()
    const x = (e.pageX?? e.touches?.[0]?.pageX) - ref.current!.offsetLeft
    const walk = (x - drag.current.startX) * 1.5
    ref.current!.scrollLeft = drag.current.scrollLeft - walk
  }

  if(!movies?.length) return null

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
          onMouseDown={mDown}
          onMouseLeave={mUp}
          onMouseUp={mUp}
          onMouseMove={mMove}
          onTouchStart={mDown}
          onTouchEnd={mUp}
          onTouchMove={mMove}
        >
          {movies.map(m => <MovieCard key={m.id} m={m} />)}
        </div>
      </div>
    </div>
  )
}
