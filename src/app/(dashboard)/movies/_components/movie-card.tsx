"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Movie } from "../_lib/types"
import { useMovieStore } from "../../../../stores/use-movie-store"
import { useWatchDrawer } from "@/stores/use-watch-drawer"
import { useReelsDrawer } from "@/stores/use-reels-drawer"
import ReplayArrowPlayIcon from "@/modal-generator/svg-icons/replay-arrow-play-icon"
import "./movie-card-continue-watching.css"

export default function MovieCard({
  m,
  allMovies,
  isContinueRow = false,
}: {
  m: Movie
  allMovies?: Movie[]
  isContinueRow?: boolean
}) {
  const router = useRouter()
  const { addRecent } = useMovieStore()
  const { openDrawer } = useWatchDrawer() as any
  const { openReels } = useReelsDrawer() as any

  const movedRef = useRef(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)

  // FIXED: read from getState not hook closure, so works before/after hydrate
   const [progressState, setProgressState] = useState(() => {
    try {
      const state = useMovieStore.getState() as any
      const id = String((m as any).id)
      const p = state.watchProgress?.[id] || state.getProgress?.(id)
      if (p && p.percent > 0) return { percent: p.percent, time: p.time, duration: p.duration }
    } catch {}
    if (!isContinueRow) return { percent: 0, time: 0, duration: 0 }
    return { percent: 8, time: 0, duration: 0 }
  })

  // AUTO-DETECT Continue Watching - pros way, no props needed
  const hasRealProgress = progressState.percent > 0 && progressState.percent < 100
  const autoIsContinue = isContinueRow || hasRealProgress || (progressState.percent >= 95)


  useEffect(() => {
    if (!isContinueRow) return
    const id = String((m as any).id)
   
    const syncProgress = () => {
      try {
        const state = useMovieStore.getState() as any
        const p = state.watchProgress?.[id] || state.getProgress?.(id)
        if (p && p.percent > 0) {
          setProgressState({ percent: p.percent, time: p.time, duration: p.duration })
        }
      } catch {}
    }

    syncProgress()
   
    let unsub: any = null
    try {
      unsub = useMovieStore.subscribe((s: any) => {
        const p = s.watchProgress?.[id]
        if (p && p.percent > 0) setProgressState({ percent: p.percent, time: p.time, duration: p.duration })
      })
    } catch {}
   
    window.addEventListener("focus", syncProgress)
    window.addEventListener("storage", syncProgress)
    // custom event when WatchPage saves progress
    window.addEventListener("ug-progress-updated", syncProgress as any)

    return () => {
      try { unsub?.() } catch {}
      window.removeEventListener("focus", syncProgress)
      window.removeEventListener("storage", syncProgress)
      window.removeEventListener("ug-progress-updated", syncProgress as any)
    }
  }, [isContinueRow, (m as any).id])

   const progress = progressState.percent
  const isFullyWatched = progress >= 95
  const showAsContinue = isContinueRow || hasRealProgress || isFullyWatched

  const handlePointerDown = (e: React.PointerEvent) => {
    movedRef.current = false
    startXRef.current = e.clientX
    startYRef.current = e.clientY
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - startXRef.current)
    const dy = Math.abs(e.clientY - startYRef.current)
    if (dx > 6 || dy > 6) {
      movedRef.current = true
    }
  }

  const handlePointerUp = () => {
    setTimeout(() => {
      movedRef.current = false
    }, 80)
  }

  const normalize = (x: any) => {
    const preview =
      x.preview_urls?.[0] ||
      x.preview_url ||
      x.trailer_url ||
      x.video_preview_url ||
      x.preview

    return {
      ...x,
      id: String(x.id),
      cover: x.cover || x.cover_url,
      cover_url: x.cover || x.cover_url,
      video: x.video || x.video_url,
      video_url: x.video || x.video_url,
      preview_url: preview,
      preview_urls: x.preview_urls || (preview ? [preview] : []),
      trailer_url: x.trailer_url || preview,
    }
  }

  const openMovie = (type: "full" | "preview" = "full") => {
    if (movedRef.current) return

    const id = String(m.id)
    addRecent(id)

    const nm = normalize(m)

    if (isContinueRow && isFullyWatched && type === "full") {
      try {
        const store = useMovieStore.getState() as any
        store.clearProgress?.(id)
        sessionStorage.removeItem(`continue_${id}`)
        localStorage.removeItem(`continue_${id}`)
        sessionStorage.setItem(
          `continue_${id}`,
          JSON.stringify({ time: 0, duration: 0, percent: 0, playing: true, type })
        )
      } catch {}
    }

    try {
      sessionStorage.setItem(
        "movies_home_scroll_v1",
        String(window.scrollY)
      )

      sessionStorage.setItem(
        `movie_preload_${id}`,
        JSON.stringify({
          id,
          title: nm.title,
          cover_url: nm.cover,
          video_url: nm.video_url,
          preview_url: nm.preview_url,
          preview_urls: nm.preview_urls,
          genre: nm.genre,
          vj: nm.vj,
          description: nm.desc,
        })
      )
    } catch {}

    const isDesktop = (() => {
      if (typeof window === "undefined") return false
      const ua = navigator.userAgent
      const phoneUA =
        /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)
      const touchDevice =
        navigator.maxTouchPoints > 0
      const width = window.innerWidth
      if (phoneUA) return false
      if (touchDevice && width <= 1024) return false
      return true
    })()

    if (isDesktop) {
      router.push(`/movies/watch/${id}?t=${type}`)
      return
    }

    if (type === "preview") {
      const rawList =
        allMovies && allMovies.length
          ? allMovies
          : [m]

      const list = rawList.map(normalize)

      const idx = rawList.findIndex(
        (x) => String(x.id) === id
      )

      openReels(
        list,
        idx >= 0 ? idx : 0
      )

      return
    }

    openDrawer(id)
  }

  const openYT = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    openMovie("full")
  }

  const openPreview = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    openMovie("preview")
  }

  return (
    <div
      className="latest-card"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={openYT}
    >
      <div className="l-card-cover">
        <img
          src={m.cover}
          alt={m.title}
          loading="lazy"
          draggable={false}
        />

        <div className="l-card-fade" />

        {/* FIXED: Always show for Continue row, with true dynamics */}
       {showAsContinue && (
          <div className="ug-progress-track">
            <div
              className="ug-progress-fill"
              style={{ width: `${Math.max(3, Math.min(100, progress))}%` }}
            />
          </div>
        )}

        <div className="l-card-vj-on">
          {m.vj}
        </div>

        <div className="l-card-actions">
          <button
            type="button"
            className="l-a-btn play on"
            onClick={openYT}
          >
           {showAsContinue ? (
              isFullyWatched ? (
                <>
                  <span className="replay-icon-wrap">
                    <ReplayArrowPlayIcon />
                  </span>
                  PLAY
                </>
              ) : (
                "RESUME"
              )
            ) : (
              "PLAY"
            )}
          </button>

          <button
            type="button"
            className="l-a-btn prev on"
            onClick={openPreview}
          >
            PRE
          </button>
        </div>
      </div>
    </div>
  )
}

