"use client"
import { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Movie } from "../_lib/types"
import MovieCard from "./movie-card"
import "../latest-movies.css"
import { useGlobalSearch } from "@/stores/use-global-search"

export default function MovieRow({ title, movies, onSeeAll }: { title: string; movies: Movie[]; onSeeAll?: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    const container = ref.current
    if (!container) return
    let isDown = false
    let startX = 0
    let scrollStart = 0
    let velocity = 0
    let lastX = 0
    let lastTime = 0
    let rafId = 0
    const getScroll = () => container.scrollLeft
    const killMomentum = () => cancelAnimationFrame(rafId)
    const momentum = () => {
      cancelAnimationFrame(rafId)
      const step = () => {
        velocity *= 0.92
        if (Math.abs(velocity) < 0.5) return
        container.scrollLeft += velocity
        rafId = requestAnimationFrame(step)
      }
      rafId = requestAnimationFrame(step)
    }
    const onDown = (x: number) => {
      killMomentum()
      isDown = true
      isDraggingRef.current = false
      startX = x
      lastX = x
      scrollStart = getScroll()
      lastTime = performance.now()
      velocity = 0
      container.classList.add('is-dragging')
    }
    const onMove = (x: number, e?: Event) => {
      if (!isDown) return
      const now = performance.now()
      const dx = x - startX
      const dist = x - lastX
      const dt = now - lastTime || 16
      if (Math.abs(dx) > 3 &&!isDraggingRef.current) isDraggingRef.current = true
      if (isDraggingRef.current) {
        if (e) e.preventDefault()
        velocity = (dist / dt) * 16
        container.scrollLeft = scrollStart - dx
      }
      lastX = x
      lastTime = now
    }
    const onUp = () => {
      if (!isDown) return
      isDown = false
      container.classList.remove('is-dragging')
      if (Math.abs(velocity) > 2) {
        velocity = -velocity
        momentum()
      }
      setTimeout(() => { isDraggingRef.current = false }, 60)
    }
    const md = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('.l-a-btn')) return; onDown(e.pageX) }
    const mm = (e: MouseEvent) => onMove(e.pageX, e)
    const mu = () => onUp()
    const td = (e: TouchEvent) => { if ((e.target as HTMLElement).closest('.l-a-btn')) return; onDown(e.touches[0].pageX) }
    const tm = (e: TouchEvent) => onMove(e.touches[0].pageX, e)
    const tu = () => onUp()
    container.addEventListener('mousedown', md)
    window.addEventListener('mousemove', mm, { passive: false } as any)
    window.addEventListener('mouseup', mu)
    container.addEventListener('touchstart', td, { passive: true } as any)
    container.addEventListener('touchmove', tm, { passive: false } as any)
    container.addEventListener('touchend', tu, { passive: true } as any)
    return () => {
      cancelAnimationFrame(rafId)
      container.removeEventListener('mousedown', md)
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('mouseup', mu)
      container.removeEventListener('touchstart', td as any)
      container.removeEventListener('touchmove', tm as any)
      container.removeEventListener('touchend', tu as any)
    }
  }, [movies])

  const handleSeeAll = () => {
    const clean = title.toLowerCase().trim() // adventure, vj junior, actor name, movie title - all dynamic
    if(onSeeAll){
      onSeeAll(clean)
      return
    }
    // fallback if no prop passed
    useGlobalSearch.getState().setQuery(clean)
    router.push(`/search?q=${encodeURIComponent(clean)}`)
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
            <div
              key={m.id}
              onClick={()=>{
                if(isDraggingRef.current) return
                router.push(`/movies/watch/${m.id}`)
              }}
            >
              <MovieCard m={m} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
