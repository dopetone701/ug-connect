"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ReelsPlayer } from "./reels-player"
import { ReelsActions } from "./reels-actions"
import { ReelsModal } from "./reels-modal"
import { useCommentPanel } from "@/stores/use-comment-panel"
import "./reels.css"

export function ReelsFeed({
  movies,
  startIndex = 0,
  currentMovie,
  onClose,
}: any) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const { isOpen, open } = useCommentPanel()

  const [active, setActive] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [autoScroll, setAutoScroll] = useState(false)

  const rawList = movies?.length ? movies : currentMovie ? [currentMovie] : []

  const list = rawList.filter((m: any) => {
    const preview = m.preview_urls?.[0] || m.preview_url || m.trailer_url || m.video_preview_url
    return !!preview
  })

  const safeStart = Math.min(startIndex, Math.max(0, list.length - 1))

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

  useEffect(() => {
    const c = containerRef.current
    if (!c) return
    const timer = setTimeout(() => {
      c.scrollTo({ top: c.clientHeight * safeStart, behavior: "auto" as any })
    }, 50)
    return () => clearTimeout(timer)
  }, [safeStart])

  useEffect(() => {
    const c = containerRef.current
    if (!c) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
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

  if (!list.length) return null

  return (
    <div
      ref={containerRef}
      className="reels-tiktok-container"
      style={{ overflow: isOpen ? "hidden" : "auto" }}
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
              onCommentClick={() => open(String(m.id))}
            />

            <ReelsModal current={m} onWatchFull={() => handleWatchFull(m)} />
          </div>
        )
      })}
    </div>
  )
}

