"use client"
import { useRouter } from "next/navigation"
import "./series-row.css"

export default function TvSeriesRow({ movies, onSeeAll }: { movies: any[]; onSeeAll?: (v: string) => void }) {
  const router = useRouter()
  if (!movies?.length) return null
  return (
    <div className="series-root">
      <div className="series-head">
        <h3 className="series-title" onClick={() => onSeeAll?.("tv series")}>TV Series</h3>
        <button className="series-see" onClick={() => onSeeAll?.("tv series")}>SEE ALL</button>
      </div>
      <div className="series-track">
        {movies.map((m:any) => {
          const eps = (m.seasons || []).flatMap((s:any)=> s.episodes || []).slice(0,20)
          const list = eps.length ? eps : Array.from({length:6}).map((_,i)=>({ episode_number:i+1, title:`Ep ${i+1}` }))
          return (
            <div key={m.id} className="series-big-card">
              <img src={m.cover_url || m.cover} alt={m.title} />
              <div className="series-dark" />
              <div className="series-bottom">
                <div className="s-title">{m.title}</div>
                <div className="s-ep-row">
                  {list.map((ep:any,i:number)=>(
                    <button key={i} onClick={()=> router.push(`/movies/watch/${m.id}`)}>{ep.episode_number || i+1}</button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
