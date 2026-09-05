"use client"
import { useRef } from "react"
import { Movie } from "../_lib/types"
import MovieCard from "./movie-card"
import "../latest-movies.css"

export default function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
  const ref = useRef<HTMLDivElement>(null)

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
        >
          {movies.map(m => <MovieCard key={m.id} m={m} />)}
        </div>
      </div>
    </div>
  )
}
