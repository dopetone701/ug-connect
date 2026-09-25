'use client'
import { useRouter } from "next/navigation"
import { useWatchDrawer } from "@/stores/use-watch-drawer"
import { useReelsDrawer } from "@/stores/use-reels-drawer"
import { useMovieStore } from "@/stores/use-movie-store"

export function ReelsModal({ current, onWatchFull }: any) {
  const router = useRouter()
  const { openDrawer } = useWatchDrawer() as any
  const { closeReels } = useReelsDrawer() as any
  const { addRecent } = useMovieStore() as any

  if(!current) return null

  const handleClick = () => {
    const id = String(current.id)
    const preview = (current as any).preview_urls?.[0] || (current as any).preview_url || (current as any).trailer_url

    try{
      addRecent?.(id)
      sessionStorage.setItem(`movie_preload_${id}`, JSON.stringify({
        id,
        title: current.title,
        cover_url: current.cover || current.cover_url,
        video_url: current.video || current.video_url,
        preview_url: preview,
        preview_urls: current.preview_urls || (preview? [preview] : []),
        genre: current.genre,
        vj: current.vj,
        description: current.description || current.desc
      }))
    }catch{}

    // PC -> use parent push
    if (typeof window!== "undefined" && window.innerWidth > 768) {
      if (onWatchFull) onWatchFull()
      else router.push(`/movies/watch/${id}?t=full`)
      return
    }

    // MOBILE -> open watch drawer like MovieCard
    closeReels?.()
    setTimeout(() => openDrawer(id), 120)
  }

  return (
    <div className="reel-info">
      <h3>{current.title}</h3>
      <p className="reel-desc">{current.description? `${current.description.slice(0,110)}...` : ""}</p>
      <div className="reel-pills">
        {current.genre && <span style={{ background:"hsl(var(--surface))", border:"1px solid hsl(var(--border))", color:"hsl(var(--text))"}}>{current.genre}</span>}
        {current.vj && <span style={{ background:"hsl(var(--surface))", border:"1px solid hsl(var(--border))", color:"hsl(var(--text))"}}>{current.vj}</span>}
      </div>
      <button
        type="button"
        className="reel-watch-full"
        style={{ background:"hsl(var(--primary))", color:"hsl(var(--primary-text))"}}
        onClick={handleClick}
      >
        ▶ Watch Full Movie
      </button>
    </div>
  )
}
