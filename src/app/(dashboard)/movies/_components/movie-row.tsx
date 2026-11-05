"use client"
import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Movie } from "../_lib/types"
import MovieCard from "./movie-card"
import "../latest-movies.css"
import { useGlobalSearch } from "@/stores/use-global-search"
import { attachNoonScroll } from "../_lib/noon-scroll"

function isMobileDevice() {
  if (typeof window === "undefined") return true
  const ua = navigator.userAgent || ""
  if (/iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return true
  if (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024) return true
  return false
}

export default function MovieRow({ title, movies, onSeeAll }: { title: string; movies: Movie[]; onSeeAll?: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const isContinueRow = title.toLowerCase().includes("continue")

  // ONLY scroll owner via noon-scroll — no custom drag code here anymore
  useEffect(() => {
    if (!ref.current) return
    const cleanup = attachNoonScroll(ref.current)
    return cleanup
  }, [movies])

  const handleSeeAll = () => {
    const clean = title.toLowerCase().trim()
    const cleanParam = encodeURIComponent(clean)
    const mobile = isMobileDevice()

    const gs = useGlobalSearch.getState() as any
    gs.setQuery(clean)
    gs.setSection(clean)
    gs.openSearch()
    gs.setOpen?.(true)
    gs.setIsOpen?.(true)

    if(onSeeAll){
      onSeeAll(clean)
    }

    if (mobile) {
      if (typeof window!== "undefined") {
        window.dispatchEvent(new CustomEvent("ug-open-search-panel"))
      }
      return
    }

    router.push(`/search?q=${cleanParam}&filter=${cleanParam}&section=${cleanParam}`)
  }

  if(!movies?.length) return null

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title" onClick={handleSeeAll} style={{cursor:"pointer"}}>{title}</h3>
        <button className="latest-see" onClick={handleSeeAll}>SEE ALL</button>
      </div>
      <div className="latest-track-wrap">
        <div ref={ref} className="latest-track">
          {movies.map(m => (
            <MovieCard key={String(m.id)} m={m} allMovies={movies} isContinueRow={isContinueRow} />
          ))}
        </div>
      </div>
    </div>
  )
}
