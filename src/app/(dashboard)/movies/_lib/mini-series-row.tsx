"use client"
import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { attachNoonScroll } from "./noon-scroll"
import "./series-row.css"
import { usesingleplayer } from "../_components/single-player"

export default function MiniSeriesRow({ movies, onSeeAll }: { movies: any[]; onSeeAll?: (v: string) => void }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { playmovie } = usesingleplayer()

  useEffect(()=>{ if(!trackRef.current) return; const cleanup = attachNoonScroll(trackRef.current); return cleanup; }, [])

  if (!movies?.length) return null

  return (
    <div className="series-root">
      <div className="series-head">
        <h3 className="series-title" onClick={() => onSeeAll?.("mini series")}>Mini Series</h3>
        <button className="series-see" onClick={() => onSeeAll?.("mini series")}>SEE ALL</button>
      </div>

      <div className="series-track" ref={trackRef}>
        {movies.map((m) => {
          const allEps = (m.seasons || []).flatMap((s:any)=> s.episodes || [])
          const eps = allEps.length ? allEps.slice(0,20) : Array.from({length: Math.min(20, m.seasons?.length || 8)}).map((_,i)=>({ episode_number:i+1, title:`Episode ${i+1}` }))
          
          return (
            <div key={m.id} className="series-big-card">
              <img className="series-big-cover" src={m.cover_url || m.cover} alt={m.title} draggable={false} />
              <div className="series-big-dark" />

              <div className="series-big-top">
                <span className="s-pill">MINI</span>
                <span className="s-pill muted">{m.year || m.genre}</span>
              </div>

              <button className="series-play-fab" onClick={()=>{ playmovie(m); router.push(`/movies/watch/${m.id}?t=full`) }}>
                <svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.8 L18 12 L8 18.2 Z" fill="white"/></svg>
              </button>

              <div className="series-big-bottom">
                <div className="s-title" onClick={()=> router.push(`/movies/watch/${m.id}`)}>{m.title}</div>
                <div className="s-sub">{(m.actors || m.vj || "").toString().slice(0,40)} • {m.seasons?.length || 1} Season</div>

                <div className="s-ep-track">
                  {eps.map((ep:any, i:number)=>(
                    <button key={i} className="s-ep-card" onClick={(e)=>{
                      e.stopPropagation()
                      playmovie(m)
                      router.push(`/movies/watch/${m.id}?t=full&e=${ep.episode_number || i+1}`)
                    }}>
                      <div className="s-ep-num">{ep.episode_number || i+1}</div>
                      <div className="s-ep-name">{(ep.title || `Ep ${i+1}`).slice(0,16)}</div>
                    </button>
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
