"use client"
import { Movie } from "../_lib/types"
import { useMovieStore } from "../_lib/use-movie-store"

export default function MovieCard({ m }: { m: Movie }) {
  const { addRecent, toggleFav, favIds } = useMovieStore()
  const isFav = favIds.includes(m.id)

  return (
    <div className="latest-card">
      <div className="l-card-cover">
        <img src={m.cover} alt={m.title} loading="lazy" />
        <div className="l-card-fade" />
        <div className="l-card-vj-on">{m.vj}</div>
        <div className="l-card-actions">
          <button
            className="l-a-btn play on"
            onClick={() => { addRecent(m.id); if(m.video) window.open(m.video, "_blank") }}
          >
            PLAY
          </button>
          <button
            className="l-a-btn prev on"
            onClick={() => { addRecent(m.id); if(m.preview?.[0]) window.open(m.preview[0], "_blank") }}
          >
            PRE
          </button>
        </div>
        <button
          onClick={(e)=>{ e.stopPropagation(); toggleFav(m.id) }}
          style={{position:"absolute",top:6,right:6,zIndex:5,background:isFav?"#ff2a6d":"rgba(0,0,0,.5)",border:0,borderRadius:20,width:24,height:24,color:"#fff",fontSize:12,cursor:"pointer"}}
          title="favourite"
        >
          ♥
        </button>
      </div>
      <div className="l-card-title centered">{m.title}</div>
    </div>
  )
}
