"use client"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "./series-row.css"

// surgical: only render when scrolled into view
function useVisible(ref: React.RefObject<HTMLDivElement | null>) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); ob.disconnect() }
    }, { rootMargin: "400px" })
    ob.observe(ref.current)
    return () => ob.disconnect()
  }, [ref])
  return show
}

export default function TvSeriesRow({ movies, onSeeAll }: { movies: any[]; onSeeAll?: (v: string) => void }) {
  const router = useRouter()
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return
    trackRef.current.scrollBy({ left: dir === "left"? -360 : 360, behavior: "smooth" })
  }

  if (!movies?.length) return null

  return (
    <div className="series-root">
      <div className="series-head">
        <h3 className="series-title" onClick={() => onSeeAll?.("tv series")}>TV Series</h3>
        <button className="series-see" onClick={() => onSeeAll?.("tv series")}>SEE ALL</button>
      </div>

      <div className="series-track-wrap">
        <button className="s-arrow left" onClick={() => scroll("left")} aria-label="scroll left">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button className="s-arrow right" onClick={() => scroll("right")} aria-label="scroll right">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        <div className="series-track" ref={trackRef}>
          {movies.map((m: any) => {
            const seasons = m.seasons || []
            const episodes = seasons.flatMap((s: any) => s.episodes || [])
            const seasonLabel = seasons.length > 1? `S1-S${seasons.length}` : seasons[0]?.name? seasons[0].name.slice(0,4) : "S1"
            const cardRef = useRef<HTMLDivElement>(null)
            const isVisible = useVisible(cardRef)

            return (
              <div key={m.id} className="series-big-card" ref={cardRef}>
                <div className="series-cover-wrap" role="button" tabIndex={0} onClick={() => router.push(`/movies/watch/${m.id}`)}>
                  <img src={m.cover_url || m.cover} alt={m.title} draggable={false} loading="lazy" decoding="async" />
                  <div className="series-dark" />
                  <div className="series-top-row">
                    <div className="series-vj">{m.vj || "VJ Junior"}</div>
                    <div className="series-season">{seasonLabel}</div>
                  </div>
                  <div className="series-big-title">{m.title}</div>
                </div>

                {/* FIX 1: removed wheel ref hack - was causing autoplay/lag */}
                <div className="s-ep-track">
                  {/* FIX 2: render only when scrolled + 10 only */}
                  {isVisible? (
                    episodes.length > 0? episodes.slice(0, 10).map((ep: any, i: number) => (
                      <div key={ep.id || i} className="s-ep-mini-card" role="button" tabIndex={0} onClick={() => router.push(`/movies/watch/${m.id}?ep=${ep.id || i}`)}>
                        <div className="s-ep-mini-cover">
                          <img src={ep.preview_url || ep.cover_url || m.cover_url || m.cover} alt={ep.title} loading="lazy" decoding="async" draggable={false} />
                          <div className="s-ep-fade" />
                        </div>
                        <div className="s-ep-title">{ep.title || `Ep ${i+1}`}</div>
                      </div>
                    )) : <div className="s-no-ep">No episodes</div>
                  ) : (
                    <div className="s-no-ep">...</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
