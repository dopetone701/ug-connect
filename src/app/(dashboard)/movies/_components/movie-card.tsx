"use client"
import { Movie } from "../_lib/types"
import { useMovieStore } from "../_lib/use-movie-store"
import { useRouter } from "next/navigation"

export default function MovieCard({ m }: { m: Movie }) {
  const { addRecent } = useMovieStore()
  const router = useRouter()

  return (
    <div className="latest-card">
      <div className="l-card-cover">
        <img src={m.cover} alt={m.title} loading="lazy" draggable={false} />
        <div className="l-card-fade" />
        <div className="l-card-vj-on">{m.vj}</div>
        <div className="l-card-actions">
          <button className="l-a-btn play on" onClick={() => { addRecent(m.id); router.push(`/movies/watch/${m.id}?t=full`) }}>PLAY</button>
          <button className="l-a-btn prev on" onClick={() => { addRecent(m.id); router.push(`/movies/watch/${m.id}?t=preview`) }}>PRE</button>
        </div>
      </div>
    </div>
  )
}
