"use client"
import { useEffect, useRef, useState } from "react"
import { useFullscreenListDrawer } from "@/stores/use-fullscreen-list-drawer"
import FullscreenListBody from "./fullscreen-list-body"
import { useRouter } from "next/navigation"
import { useWatchDrawer } from "@/stores/use-watch-drawer"
import { useMovieStore } from "@/stores/use-movie-store"

export default function FullscreenListDrawer({
  current,
  onSelect,
  onSelectEpisode,
  currentEpisodeId,
}: {
  current?: any
  onSelect?: (m: any) => void
  // NEW: live episode switch, from WatchClient.goToEp via PlayerOverlay.
  // When present, episode tiles NEVER go through openDrawer / sessionStorage.
  onSelectEpisode?: (ep: any) => void
  currentEpisodeId?: string | number | null
} = {}) {
  const { isOpen, close } = useFullscreenListDrawer()
  const router = useRouter()
  const { openDrawer } = useWatchDrawer() as any
  const { addRecent } = useMovieStore()

  const isMobileDevice = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return false
    const ua = navigator.userAgent || ""
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const isCoarse = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches
    const hasTouch = "ontouchstart" in window || (navigator as any).maxTouchPoints > 0
    return isMobileUA || (isCoarse && hasTouch)
  }

  // DNA: gradient uses hsl(var(--bg)), X uses hsl(var(--surface))/--border/--text. No hardcoded black/white.
  // ACTIVE: passes currentEpisodeId (real episode id) through — grid compares by id, not tile number.
  // FIXED: episode = SAME path as EpisodesRow in WatchClient.
  // If parent gave us onSelectEpisode (goToEp), use it directly.
  // It calls setOverlayEpId inside WatchClient, video key changes, video rebuilds in place.
  // No openDrawer, no sessionStorage, no close/reopen of watch drawer.
  const openEpisodeFull = (movieId: string, episode: string | number) => {
    if (!movieId) return
    // episode may be id (string/number) or full ep object — normalize to object with id
    const epObj = typeof episode === "object" && episode !== null ? episode : { id: episode }
    if (onSelectEpisode) {
      try { onSelectEpisode(epObj) } catch {}
      try { close() } catch {}
      return
    }
    // FALLBACK (only if parent forgot to wire onSelectEpisode): old path
    try { sessionStorage.setItem(`movie_episode_${movieId}`, String((epObj as any).id)) } catch {}
    try { sessionStorage.setItem(`movie_preload_${movieId}`, JSON.stringify({ id: movieId, ep: (epObj as any).id })) } catch {}
    if (isMobileDevice()) {
      try { close() } catch {}
      setTimeout(() => { try { openDrawer(movieId, "full", (epObj as any).id) } catch {} }, 400)
      return
    }
    try { close() } catch {}
    router.push(`/movies/watch/${movieId}?t=full&ep=${(epObj as any).id}`)
  }

  const openSimilarMovie = (m: any) => {
    if (onSelect) { onSelect(m); return }
    if (!m?.id) return
    const id = String(m.id)
    try { addRecent(id) } catch {}
    try {
      sessionStorage.setItem(`movie_preload_${id}`, JSON.stringify({
        id, title: m.title, cover_url: m.cover_url || m.cover,
        video_url: m.video_url || m.video, genre: m.genre, vj: m.vj, description: m.desc,
      }))
    } catch {}
    if (isMobileDevice()) {
      try { close() } catch {}
      setTimeout(() => { try { openDrawer(id, "full") } catch {} }, 400)
      return
    }
    try { close() } catch {}
    router.push(`/movies/watch/${id}?t=full`)
  }

  useEffect(() => {
    if (typeof document === "undefined") return
    const prev = document.body.style.overflow
    const prevTouch = (document.body.style as any).touchAction
    if (isOpen) {
      document.body.style.overflow = "hidden"
      ;(document.body.style as any).touchAction = "none"
    }
    return () => {
      document.body.style.overflow = prev
      ;(document.body.style as any).touchAction = prevTouch
    }
  }, [isOpen])

  const [shouldRender, setShouldRender] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const clearTimers = () => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }
  useEffect(() => {
    if (isOpen) {
      clearTimers()
      setShouldRender(true)
      setIsVisible(false)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setIsVisible(true))
      })
      return
    }
    if (shouldRender) {
      setIsVisible(false)
      timeoutRef.current = setTimeout(() => { setShouldRender(false); timeoutRef.current = null }, 400)
    }
  }, [isOpen])
  useEffect(() => () => clearTimers(), [])
  const handleClose = () => {
    setIsVisible(false)
    timeoutRef.current = setTimeout(() => { close(); timeoutRef.current = null }, 400)
  }
  if (!shouldRender) return null
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: "58%", zIndex: 10000,
        boxSizing: "border-box", overflow: "hidden", overscrollBehavior: "none" as any,
        touchAction: "none" as any, display: "flex", flexDirection: "column",
        pointerEvents: isVisible ? "auto" : "none",
        transform: isVisible ? "translateX(0)" : "translateX(100%)",
        opacity: isVisible ? 1 : 0,
        transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease",
        background: "linear-gradient(to right, transparent 0%, hsl(var(--bg) / 0.55) 35%, hsl(var(--bg) / 0.95) 100%)",
      }}
    >
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          position: "absolute", inset: 0, zIndex: 1,
          overflowY: "auto", overflowX: "hidden", overscrollBehaviorY: "contain",
          WebkitOverflowScrolling: "touch" as any, touchAction: "pan-y",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 52px)",
          paddingRight: "calc(env(safe-area-inset-right, 0px) + 0px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
          boxSizing: "border-box", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ flexGrow: 0, flexShrink: 0, flexBasis: "auto", width: "100%", height: "auto", display: "flex", flexDirection: "column", overflow: "visible" }}>
          {current ? <FullscreenListBody current={current} onSelect={openSimilarMovie} onSelectEpisode={openEpisodeFull} currentEpisode={currentEpisodeId ?? (current as any).currentEpisode} /> : null}
        </div>
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, display: "flex", justifyContent: "flex-end", paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)", paddingRight: "calc(env(safe-area-inset-right, 0px) + 12px)", boxSizing: "border-box", pointerEvents: "none", background: "transparent" }}>
        <button type="button" aria-label="Close list" onClick={(e) => { e.stopPropagation(); handleClose() }} onPointerDown={(e) => e.stopPropagation()} style={{ width: 32, height: 32, borderRadius: "50%", background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", color: "hsl(var(--text))", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0, pointerEvents: "auto" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1L13 13M13 1L1 13" /></svg>
        </button>
      </div>
    </div>
  )
}

