"use client"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "./series-row.css"

function useVisible(ref: React.RefObject<HTMLDivElement | null>) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShow(true)
        ob.disconnect()
      }
    }, { rootMargin: "400px" })
    ob.observe(ref.current)
    return () => ob.disconnect()
  }, [])
  return show
}

function MiniCard({ m, onPush }: { m: any; onPush: (url: string) => void }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isVisible = useVisible(cardRef)
  const seasons = m.seasons || []
  const parts = seasons.flatMap((s: any) => s.episodes || []).slice(0, 10)
  const seasonLabel = seasons.length > 1? `S1-S${seasons.length}` : "S1"
  const fallbackCover = m.cover_url || m.cover || "/placeholder.png"

  const getPartTitle = (part: any, i: number) => {
    if (!part.title) return `Part ${i + 1}`
    return part.title.replace(/episode/gi, "Part")
  }

  return (
    <div className="series-big-card rectangle" ref={cardRef}>
      <div className="series-cover-wrap" role="button" tabIndex={0} onClick={() => onPush(`/movies/watch/${m.id}`)}>
        <img src={fallbackCover} alt={m.title} draggable={false} loading="lazy" decoding="async" />
        <div className="series-dark" />
        <div className="series-top-row">
          <div className="series-vj">{m.vj || "VJ Junior"}</div>
          <div className="series-season">{seasonLabel}</div>
        </div>
        <div className="series-big-title">{m.title}</div>
      </div>

      <div className="s-ep-track">
        {isVisible? (
          parts.map((part: any, i: number) => (
            <div key={part.id || i} className="s-ep-mini-card" role="button" tabIndex={0} onClick={() => onPush(`/movies/watch/${m.id}?ep=${part.id || i}`)}>
              <div className="s-ep-mini-cover">
                <img src={part.preview_url || part.cover_url || fallbackCover} alt={getPartTitle(part, i)} loading="lazy" decoding="async" draggable={false} />
                <div className="s-ep-fade" />
              </div>
              <div className="s-ep-title">{getPartTitle(part, i)}</div>
            </div>
          ))
        ) : (
          <div className="s-no-ep">...</div>
        )}
      </div>
    </div>
  )
}

export default function MiniSeriesRow({ movies, onSeeAll }: { movies: any[]; onSeeAll?: (v: string) => void }) {
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
        <h3 className="series-title" onClick={() => onSeeAll?.("mini series")}>Mini Series</h3>
        <button className="series-see" onClick={() => onSeeAll?.("mini series")}>SEE ALL</button>
      </div>

      <div className="series-track-wrap">
        <button className="s-arrow left" onClick={() => scroll("left")} aria-label="prev">
          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button className="s-arrow right" onClick={() => scroll("right")} aria-label="next">
          <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        <div className="series-track" ref={trackRef}>
          {movies.map((m: any) => (
            <MiniCard key={m.id} m={m} onPush={(url) => router.push(url)} />
          ))}
        </div>
      </div>
    </div>
  )
}
