"use client"

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ReelsPlayer } from "./reels-player"
import { ReelsActions } from "./reels-actions"
import { ReelsModal } from "./reels-modal"
import { useCommentPanel } from "@/stores/use-comment-panel"
import "./reels.css"

// useLayoutEffect warns during server render, so fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export function ReelsFeed({
  movies,
  startIndex = 0,
  currentMovie,
  onClose,
}: any) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { isOpen, open } = useCommentPanel()

  const rawList = movies?.length ? movies : currentMovie ? [currentMovie] : []

  const list = rawList.filter((m: any) => {
    const preview = m.preview_urls?.[0] || m.preview_url || m.trailer_url || m.video_preview_url
    return !!preview
  })

  const safeStart = Math.min(startIndex, Math.max(0, list.length - 1))

  // ✅ FIX 1 — Start on the right reel BEFORE first paint.
  // With open-preview queue [clicked, ...rest], safeStart is always 0.
  // Before: useState(0) -> rendered wrong reel, then scrolled to safeStart.
  const [active, setActive] = useState(safeStart)
  const [isPlaying, setIsPlaying] = useState(true)
  const [autoScroll, setAutoScroll] = useState(false)

  // ✅ FIX 3 — If drawer is reused, update active when a new queue / startIndex comes in.
  // Without this, 2nd Preview shows the old reel first = looks like a flash.
  useIsoLayoutEffect(() => {
    setActive(safeStart)
    setIsPlaying(true)
  }, [safeStart, movies])

  // Refs so the observer and the restore effect always see the latest values.
  const isOpenRef = useRef(isOpen)
  const activeRef = useRef(safeStart)
  const wasOpenRef = useRef(false)
  activeRef.current = active

  // ---- AUTO SCROLL STATE ----
  useEffect(() => {
    try {
      const v = localStorage.getItem("ugc_auto_scroll")
      setAutoScroll(v === "true")
    } catch {}
    const onChanged = (e: any) => {
      const next = e?.detail !== undefined ? !!e.detail : (localStorage.getItem("ugc_auto_scroll") === "true")
      setAutoScroll(next)
    }
    window.addEventListener("ugc_auto_scroll_changed" as any, onChanged)
    window.addEventListener("storage", (ev: StorageEvent) => {
      if (ev.key === "ugc_auto_scroll") setAutoScroll(ev.newValue === "true")
    })
    return () => {
      window.removeEventListener("ugc_auto_scroll_changed" as any, onChanged)
    }
  }, [])

  // ✅ FIX 2 — Set scrollTop BEFORE paint, no setTimeout, no scrollTo animation.
  // This is the Facebook pattern: queue is already [clicked, ...rest],
  // so we just place the container at safeStart before the user sees anything.
  // Deleted old code: useEffect + setTimeout(50ms) + scrollTo({ behavior: "auto" })
  // That old code caused the wrong-preview flash.
  useIsoLayoutEffect(() => {
    const c = containerRef.current
    if (!c) return
    c.style.scrollSnapType = "none"
    c.scrollTop = c.clientHeight * safeStart
    requestAnimationFrame(() => {
      c.scrollTop = c.clientHeight * safeStart
      requestAnimationFrame(() => {
        c.style.scrollSnapType = ""
      })
    })
  }, [safeStart])

  useEffect(() => {
    const c = containerRef.current
    if (!c) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          // While comments are open the other reels are display:none and the feed is
          // collapsed, so intersection results are meaningless. Ignore them.
          if (isOpenRef.current) return
          if (e.isIntersecting && e.intersectionRatio > 0.75) {
            const newActive = Number((e.target as HTMLElement).dataset.index)
            setActive(newActive)
            setIsPlaying(true)
          }
        })
      },
      { threshold: 0.75, root: c }
    )
    Array.from(c.children).forEach((child) => obs.observe(child))
    return () => obs.disconnect()
  }, [list.length])

  // ---- KEEP THE SAME REEL WHEN COMMENTS CLOSE ----
  // Opening comments collapses the feed and the browser resets its scroll to 0.
  // On close, scroll straight back to the reel that was active, before paint,
  // with snapping off so the browser does not re-snap to a different reel.
  useIsoLayoutEffect(() => {
    isOpenRef.current = isOpen
    if (wasOpenRef.current && !isOpen) {
      const c = containerRef.current
      if (c) {
        const top = c.clientHeight * activeRef.current
        c.style.scrollSnapType = "none"
        c.scrollTop = top
        requestAnimationFrame(() => {
          c.scrollTop = top
          requestAnimationFrame(() => { c.style.scrollSnapType = "" })
        })
      }
    }
    wasOpenRef.current = isOpen
  }, [isOpen])

  // ---- AUTO SCROLL ACTIVATION / DEACTIVATION ----
  const scrollToIndex = useCallback((idx: number) => {
    const c = containerRef.current
    if (!c) return
    if (idx < 0 || idx >= list.length) return
    c.scrollTo({ top: c.clientHeight * idx, behavior: "smooth" as any })
    setActive(idx)
    setIsPlaying(true)
  }, [list.length])

  const scrollToNext = useCallback(() => {
    if (active < list.length - 1) {
      scrollToIndex(active + 1)
    }
  }, [active, list.length, scrollToIndex])

  useEffect(() => {
    if (!autoScroll) return
    const c = containerRef.current
    if (!c) return

    // Listen for video ended on active reel
    const handleEnded = () => {
      // Small delay like TikTok / Reels
      setTimeout(() => {
        scrollToNext()
      }, 800)
    }

    const attach = () => {
      const activeVideo = document.querySelector('.reels-tiktok-item.active .reel-video') as HTMLVideoElement
      if (!activeVideo) return null
      activeVideo.addEventListener('ended', handleEnded)
      return activeVideo
    }

    let video = attach()
    // Re-attach when active changes (mutation observer on active class)
    const mo = new MutationObserver(() => {
      if (video) video.removeEventListener('ended', handleEnded)
      video = attach()
    })
    mo.observe(c, { attributes: true, subtree: true, attributeFilter: ['class'] })

    return () => {
      if (video) video.removeEventListener('ended', handleEnded)
      mo.disconnect()
    }
  }, [autoScroll, active, scrollToNext])

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const handleWatchFull = useCallback(
    (m: any) => {
      onClose?.()
      router.push(`/movies/watch/${m.id}?t=full`)
    },
    [onClose, router]
  )

  // ✅ Never return null — always render black, so Home can never show through.
  // Before: if (!list.length) return null -> 1 frame of transparent drawer -> Home flash.
  if (!list.length) {
    return (
      <div
        className="reels-tiktok-container"
        style={{ background: "#000", width: "100%", height: "100dvh", overflow: "hidden" }}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className="reels-tiktok-container"
      style={{ overflow: isOpen ? "hidden" : "auto", background: "#000" }}
    >
      {list.map((m: any, i: number) => {
        const previewUrl = m.preview_urls?.[0] || m.preview_url || m.trailer_url || m.video_preview_url
        const isActive = active === i

        return (
          <div key={`${m.id}-${i}`} data-index={i} className={`reels-tiktok-item ${isActive ? 'active' : ''}`}>
            {isActive ? (
              <ReelsPlayer
                previewUrl={previewUrl}
                currentId={m.id}
                playing={isPlaying && !isOpen}
                showPlay={true}
                onToggle={handleTogglePlay}
                isActive={true}
              />
            ) : (
              <div className="reel-video" style={{ background: "#000", width: "100%", height: "100%" }} />
            )}

            <ReelsActions
              movieId={String(m.id)}
              movie={m}
              heartCount={(m as any).heart_count || 1}
              commentCount={(m as any).comment_count || 0}
              onClose={onClose}
              onCommentClick={() => open(String(m.id), m)}
            />

            <ReelsModal current={m} onWatchFull={() => handleWatchFull(m)} />
          </div>
        )
      })}
    </div>
  )
}
