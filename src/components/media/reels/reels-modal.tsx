"use client"
import { useRouter } from "next/navigation"
import { useWatchDrawer } from "@/stores/use-watch-drawer"
import { useReelsDrawer } from "@/stores/use-reels-drawer"
import { useMovieStore } from "@/stores/use-movie-store"
import Padlock from "@/modal-generator/svg-icons/padlock-icon"
import {
  useIsGuest,
  isGuestUser,
  openSignInModal,
} from "@/app/auth-system/movie-locker-if-guest"

function cleanVj(raw: any): string {
  if (!raw) return ""
  let s = String(raw).trim()
  s = s.replace(/^VJ\s+/i, "").replace(/^VJ$/i, "").trim()
  s = s.replace(/^VJ\.\s*/i, "").trim()
  return s
}

function getRealVj(movie: any): string {
  if (!movie) return "UG"
  const raw = movie.vj || movie.translatedBy || movie.vjs?.[0] || movie.channel || movie.narrator || movie.vjs || movie.VJ || ""
  const cleaned = cleanVj(raw)
  if (cleaned && cleaned.toUpperCase() !== "UG") return cleaned
  try {
    const ls = localStorage.getItem("ugc_current_vj") || localStorage.getItem("ugc_last_reel_vj")
    if (ls) {
      const lsClean = cleanVj(ls)
      if (lsClean && lsClean.toUpperCase() !== "UG") return lsClean
    }
  } catch {}
  return cleaned || "UG"
}

export function ReelsModal({ current, onWatchFull }: any) {
  const router = useRouter()
  const { openDrawer } = useWatchDrawer() as any
  const { closeReels } = useReelsDrawer() as any
  const { addRecent } = useMovieStore() as any

  // GUEST GATE: reactive for UI (small padlock next to Watch Full if guest)
  const isGuest = useIsGuest()

  if(!current) return null

  const realVj = getRealVj(current)
  const displayVj = realVj && realVj.toUpperCase() !== "UG" ? realVj : ""

  const handleClick = () => {
    // GUEST GATE: guests can PREVIEW (they are already in reels),
    // but cannot Watch Full Movie. Fresh read, no stale closure.
    // No addRecent, no preload, no drawer, no router if guest.
    if (isGuestUser()) {
      openSignInModal()
      return
    }

    const id = String(current.id)
    const preview = (current as any).preview_urls?.[0] || (current as any).preview_url || (current as any).trailer_url || (current as any).video_preview_url

    try{
      addRecent?.(id)
      if (realVj && realVj.toUpperCase() !== "UG") {
        localStorage.setItem("ugc_current_vj", realVj)
        localStorage.setItem("ugc_last_reel_vj", realVj)
      }
      sessionStorage.setItem(`movie_preload_${id}`, JSON.stringify({
        id,
        title: current.title,
        cover_url: current.cover || current.cover_url,
        video_url: current.video || current.video_url,
        preview_url: preview,
        preview_urls: current.preview_urls || (preview? [preview] : []),
        genre: current.genre,
        vj: realVj,
        description: current.description || current.desc
      }))
    }catch{}

    if (typeof window!== "undefined" && window.innerWidth > 768) {
      if (onWatchFull) onWatchFull()
      else router.push(`/movies/watch/${id}?t=full`)
      return
    }

    // ✅ FIX — Reels -> Watch Full, no Home flash
    // Before: closeReels() + setTimeout(() => openDrawer(id), 120)
    // -> 120ms gap with nothing on screen -> Home flashes
    // After: open Watch Drawer FIRST (it covers Reels instantly),
    // then close Reels underneath, next frame. No timeout, no gap.
    openDrawer(id, "full")
    requestAnimationFrame(() => {
      closeReels?.()
    })
  }

  return (
    <div className="reel-info">
      <h3>{current.title}</h3>
      <p className="reel-desc">{current.description? `${current.description.slice(0,110)}...` : ""}</p>
      <div className="reel-pills">
        {current.genre && <span style={{ background:"hsl(var(--surface))", border:"1px solid hsl(var(--border))", color:"hsl(var(--text))"}}>{current.genre}</span>}
        {displayVj && <span style={{ background:"hsl(var(--surface))", border:"1px solid hsl(var(--border))", color:"hsl(var(--text))"}}>VJ {displayVj}</span>}
      </div>
      <button
        type="button"
        className="reel-watch-full"
        style={{ background:"hsl(var(--primary))", color:"hsl(var(--primary-text))"}}
        onClick={handleClick}
      >
        {isGuest && (
          <span className="guest-lock-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 14, lineHeight: 0, overflow: "hidden", verticalAlign: "middle", marginRight: 6, flexShrink: 0, transform: "translateY(-1px)" }}>
            <Padlock size={14} />
          </span>
        )}
        ▶ Watch Full Movie
      </button>
    </div>
  )
}
