
'use client'

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

  const rawList = movies?.length ? movies : currentMovie ? [currentMovie] : []

  const list = rawList.filter((m: any) => {
    const preview = m.preview_urls?.[0] || m.preview_url || m.trailer_url || m.video_preview_url
    return !!preview
  })

  const safeStart = Math.min(startIndex, Math.max(0, list.length - 1))

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

