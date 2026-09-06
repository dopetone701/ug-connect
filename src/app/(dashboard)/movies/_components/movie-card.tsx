"use client"
import { Movie } from "../_lib/types"
import { useMovieStore } from "../_lib/use-movie-store"
import { useRouter } from "next/navigation"

export default function MovieCard({ m }: { m: Movie }) {
  const { addRecent, toggleFav, favIds } = useMovieStore()
  const router = useRouter()
  const isFav = favIds.includes(m.id)

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

        <button
          onClick={(e)=>{ e.stopPropagation(); toggleFav(m.id) }}
          className={`dna-fav-btn ${isFav? "active" : ""}`}
          title="favourite"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
            <path d="M12 19.5l-1.4-1.27C5.4 13.36 2 10.2 2 6.5 2 3.42 4.42 1 7.5 1c1.74 0 3.41.81 4.5 2.09C13.09 1.81 14.76 1 16.5 1 19.58 1 22 3.42 22 6.5c0 3.7-3.4 6.86-8.6 11.73L12 19.5z" />
          </svg>
        </button>
      </div>
      <div className="l-card-title centered">{m.title}</div>

      <style>{`
      .dna-fav-btn{
          position:absolute; top:6px; right:6px; z-index:5;
          width:28px; height:28px; border-radius:50%;
          border:1px solid rgba(255,255,255,.25);
          background: rgba(0,0,0,.45);
          backdrop-filter: blur(8px);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition: all.2s ease;
        }
      .dna-fav-btn svg path{
          fill: none;
          stroke: #ffffff;
          stroke-width: 1.8;
          transition: all.2s ease;
        }
      .dna-fav-btn.active{
          background: rgba(255,0,0,.15);
          border-color: #ff0000;
          box-shadow: 0 0 12px rgba(255,0,0,.6);
        }
      .dna-fav-btn.active svg path{
          fill: #ff0000;
          stroke: #ff0000;
        }
      .dna-fav-btn:active{ transform: scale(.88); }
      `}</style>
    </div>
  )
}
