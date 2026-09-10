"use client"
import { Movie } from "../_lib/types"
import { useMovieStore } from "../_lib/use-movie-store"
import { useRouter } from "next/navigation"

export default function MovieCard({ m }: { m: Movie }) {
  const { addRecent } = useMovieStore()
  const router = useRouter()

  const openYT = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    addRecent(m.id)
    router.push(`/movies/watch/${m.id}`) // yt page, no ?t=full
  }

  const openPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    addRecent(m.id)
    router.push(`/movies/watch/${m.id}?t=preview`)
  }

  return (
    <div className="latest-card" onClick={openYT}>
      <div className="l-card-cover">
        <img src={m.cover} alt={m.title} loading="lazy" draggable={false} />
        <div className="l-card-fade" />
        <div className="l-card-vj-on">{m.vj}</div>
        <div className="l-card-actions">
          <button className="l-a-btn play on" onClick={openYT}>PLAY</button>
          <button className="l-a-btn prev on" onClick={openPreview}>PRE</button>
        </div>
      </div>
    </div>
  )
}
