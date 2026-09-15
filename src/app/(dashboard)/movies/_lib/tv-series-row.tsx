"use client"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import "./series-row.css"

export default function TvSeriesRow({ movies, onSeeAll }: { movies: any[]; onSeeAll?: (v: string) => void }) {
  const router = useRouter()
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return
    const amount = 360
    trackRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  if (!movies?.length) return null

  return (
    <div className="series-root">
      <div className="series-head">
        <h3 className="series-title" onClick={() => onSeeAll?.("tv series")}>TV Series</h3>
        <button className="series-see" onClick={() => onSeeAll?.("tv series")}>SEE ALL</button>
      </div>

      <div className="series-track-wrap">
        {/* LEFT ARROW ON CARD */}
        <button className="s-arrow left" onClick={() => scroll("left")} aria-label="scroll left">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        {/* RIGHT ARROW ON CARD */}
        <button className="s-arrow right" onClick={() => scroll("right")} aria-label="scroll right">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        <div className="series-track" ref={trackRef}>
          {movies.map((m: any) => {
            const seasons = m.seasons || []
            const episodes = seasons.flatMap((s: any) => s.episodes || [])
            const seasonLabel = seasons.length > 1 ? `S1-S${seasons.length}` : seasons[0]?.name ? seasons[0].name.slice(0,4) : "S1"
            
            return (
              <div key={m.id} className="series-big-card">
                <div className="series-cover-wrap" onClick={() => router.push(`/movies/watch/${m.id}`)}>
                  <img src={m.cover_url || m.cover} alt={m.title} draggable={false} />
                  <div className="series-dark" />
                  <div className="series-top-row">
                    <div className="series-vj">{m.vj || "VJ Junior"}</div>
                    <div className="series-season">{seasonLabel}</div>
                  </div>
                  <div className="series-big-title">{m.title}</div>
                </div>

<div 
  className="s-ep-track"
  ref={(el) => {
    if (!el) return
    if ((el as any)._wheelAdded) return
    ;(el as any)._wheelAdded = true
    el.addEventListener('wheel', (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        el.scrollLeft += e.deltaY
      }
    }, { passive: false })
  }}
>
                  {episodes.length > 0 ? episodes.slice(0, 30).map((ep: any, i: number) => (
                    <div key={ep.id || i} className="s-ep-mini-card" onClick={() => router.push(`/movies/watch/${m.id}?ep=${ep.id || i}`)}>
                      <div className="s-ep-mini-cover">
                        <img src={ep.preview_url || ep.cover_url || m.cover_url || m.cover} alt={ep.title} loading="lazy" draggable={false} />
                        <div className="s-ep-fade" />
                      </div>
                      <div className="s-ep-title">{ep.title || `Ep ${i+1}`}</div>
                    </div>
                  )) : <div className="s-no-ep">No episodes</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
