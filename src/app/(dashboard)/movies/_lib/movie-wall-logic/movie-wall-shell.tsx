"use client"
import { useRef, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { attachNoonScroll } from "../noon-scroll"
import type { BattleGroup } from "./movie-wall-groups"
import MovieWallBody from "./movie-wall-body"
import { useMovieWall } from "./use-movie-wall"
import { useMovieStore } from "@/stores/use-movie-store"
import { useWatchDrawer } from "@/stores/use-watch-drawer"
import { useGlobalSearch } from "@/stores/use-global-search"
import { isGuestUser, openSignInModal } from "@/app/auth-system/movie-locker-if-guest"
import "./movie-wall.css"

function isMobileDevice() {
  if (typeof window === "undefined") return true
  const ua = navigator.userAgent || ""
  if (/iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return true
  if ((navigator as any).maxTouchPoints > 0 && window.innerWidth <= 1024) return true
  return false
}

function OneWall({
  group, isArmed, isMuted, onArm, onToggleMute,
}: {
  group: BattleGroup
  isArmed: boolean
  isMuted: boolean
  onArm: (key: string) => void
  onToggleMute: () => void
}) {
  const router = useRouter()
  const { addRecent } = useMovieStore() as any
  const { openDrawer } = useWatchDrawer() as any
  const { activeVjId, activeMovie, isPreviewing, selectVj } = useMovieWall(group)

  // Click any tile = make this card active + ARM it + UNMUTE it. Other cards auto-disarm.
  const handleSelectVj = useCallback((id: string) => {
    selectVj(id)
    onArm(group.key)
  }, [selectVj, onArm, group.key])

  const handleWatchFull = () => {
    if (isGuestUser()) { openSignInModal(); return }
    const id = String(activeMovie.id)
    addRecent?.(id)
    try {
      sessionStorage.setItem("movies_home_scroll_v1", String(window.scrollY))
      sessionStorage.setItem(`movie_preload_${id}`, JSON.stringify({
        id, title: activeMovie.title, cover_url: activeMovie.cover,
        video_url: activeMovie.video, preview_url: activeMovie.preview?.[0],
        preview_urls: activeMovie.preview, genre: activeMovie.genre, vj: activeMovie.vj, description: activeMovie.desc,
      }))
    } catch {}
    if (isMobileDevice()) { openDrawer(id); return }
    router.push(`/movies/watch/${id}?t=full`)
  }

  return (
    <article className="mw-card">
      <MovieWallBody
        group={group}
        activeVjId={activeVjId}
        activeMovie={activeMovie}
        isPreviewing={isPreviewing}
        selectVj={handleSelectVj}
        isArmed={isArmed}
        isMuted={isMuted}
      />
      {/* BELOW the video: title + sound toggle + watch */}
      <div className="mw-under">
        <div className="mw-title-row">
          <h4 className="mw-title">{group.title}</h4>
          <button
            type="button"
            className="mw-sound"
            onClick={(e) => { e.stopPropagation(); if (!isArmed) onArm(group.key); onToggleMute(); }}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isArmed && !isMuted ? "🔊" : "🔇"}
          </button>
        </div>
        <span className="mw-total">{group.vjs.length} VJs • {group.totalViews.toLocaleString()} views{isArmed ? (isMuted ? " • Muted" : " • Sound on") : " • Tap a tile to play"}</span>
        <button type="button" className="mw-watch" onClick={handleWatchFull}>
          ▶ WATCH FULL MOVIE — {activeMovie.vj}
        </button>
      </div>
    </article>
  )
}

export default function MovieWallShell({ groups }: { groups: BattleGroup[] }) {
  const router = useRouter()
  const trackRef = useRef<HTMLDivElement>(null)
  // ROW RULE: only ONE video plays at a time. null = none armed, all show cover.
  const [armedKey, setArmedKey] = useState<string | null>(null)
  // Video by default is MUTED + auto-looping. Toggle is row-wide so only one sound.
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    if (!trackRef.current) return
    const cleanup = attachNoonScroll(trackRef.current)
    return cleanup
  }, [groups])

  const handleArm = useCallback((key: string) => {
    setArmedKey(key)
    setIsMuted(false) // tile click = active + unmute
  }, [])

  const handleToggleMute = useCallback(() => {
    setIsMuted((p) => !p)
  }, [])

  if (!groups?.length) return null
  const handleSeeAll = () => {
    const clean = "vj battle"
    const gs = useGlobalSearch.getState() as any
    gs.setQuery?.(clean); gs.setSection?.(clean); gs.openSearch?.(); gs.setOpen?.(true)
    if (isMobileDevice()) { window.dispatchEvent(new CustomEvent("ug-open-search-panel")); return }
    router.push(`/search?q=${encodeURIComponent(clean)}&filter=${encodeURIComponent(clean)}&section=${encodeURIComponent(clean)}`)
  }
  return (
    <section className="latest-root mw-section">
      <div className="latest-head">
        <h3 className="latest-title" onClick={handleSeeAll} style={{ cursor: "pointer" }}>VJ BATTLE</h3>
        <button className="latest-see" onClick={handleSeeAll}>SEE ALL</button>
      </div>
      <div ref={trackRef} className="mw-grid">
        {groups.map((g) => (
          <OneWall
            key={g.key}
            group={g}
            isArmed={armedKey === g.key}
            isMuted={isMuted}
            onArm={handleArm}
            onToggleMute={handleToggleMute}
          />
        ))}
      </div>
    </section>
  )
}