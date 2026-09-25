'use client'

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ReelsPlayer } from "./reels-player"
import { ReelsActions } from "./reels-actions"
import { ReelsModal } from "./reels-modal"
import "./reels.css"

export function ReelsFeed({
  movies,
  startIndex = 0,
  currentMovie,
  onClose,
}: any) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const [active, setActive] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  // ============================================================
  // RAW LIST
  // ============================================================
  const rawList = movies?.length
    ? movies
    : currentMovie
      ? [currentMovie]
      : []

  // ============================================================
  // FILTER — ONLY MOVIES WITH PREVIEWS
  // ============================================================
  const list = rawList.filter((m: any) => {
    const preview =
      m.preview_urls?.[0] ||
      m.preview_url ||
      m.trailer_url ||
      m.video_preview_url

    return !!preview
  })

  // ============================================================
  // SAFE START INDEX
  // ============================================================
  const safeStart = Math.min(
    startIndex,
    Math.max(0, list.length - 1)
  )

  // ============================================================
  // JUMP TO START
  // ============================================================
  useEffect(() => {
    const c = containerRef.current
    if (!c) return

    const timer = setTimeout(() => {
      c.scrollTo({
        top: c.clientHeight * safeStart,
        behavior: "auto" as any,
      })
    }, 50)

    return () => clearTimeout(timer)
  }, [safeStart])

  // ============================================================
  // ACTIVE REEL DETECTION
  // ============================================================
  useEffect(() => {
    const c = containerRef.current
    if (!c) return

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (
            e.isIntersecting &&
            e.intersectionRatio > 0.75
          ) {
            const newActive = Number(
              (e.target as HTMLElement).dataset.index
            )

            setActive(newActive)

            // Every newly active reel starts playing
            setIsPlaying(true)
          }
        })
      },
      {
        threshold: 0.75,
        root: c,
      }
    )

    Array.from(c.children).forEach((child) => {
      obs.observe(child)
    })

    return () => obs.disconnect()
  }, [list.length])

  // ============================================================
  // PLAY / PAUSE
  // ============================================================
  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  // ============================================================
  // WATCH FULL MOVIE
  // ============================================================
  const handleWatchFull = useCallback(
    (m: any) => {
      onClose?.()
      router.push(
        `/movies/watch/${m.id}?t=full`
      )
    },
    [onClose, router]
  )

  if (!list.length) return null

  return (
    <div
      ref={containerRef}
      className="reels-tiktok-container"
    >
      {list.map((m: any, i: number) => {
        const previewUrl =
          m.preview_urls?.[0] ||
          m.preview_url ||
          m.trailer_url ||
          m.video_preview_url

        const isActive = active === i

        return (
          <div
            key={`${m.id}-${i}`}
            data-index={i}
            className="reels-tiktok-item"
          >
            {/* ==================================================
                VIDEO
                ================================================== */}
            {isActive ? (
              <ReelsPlayer
                previewUrl={previewUrl}
                currentId={m.id}
                playing={isPlaying}
                showPlay={true}
                onToggle={handleTogglePlay}
                isActive={true}
              />
            ) : (
              // No cover image — black placeholder until active
              <div
                className="reel-video"
                style={{
                  background: "#000",
                  width: "100%",
                  height: "100%",
                }}
              />
            )}

            {/* ==================================================
                REELS UI
                Top bar
                Like / Comment / Share / More
                Comment input
                ================================================== */}
            <ReelsActions
              onClose={onClose}
            />

            {/* ==================================================
                MOVIE MODAL / DETAILS
                ================================================== */}
            <ReelsModal
              current={m}
              onWatchFull={() =>
                handleWatchFull(m)
              }
            />
          </div>
        )
      })}
    </div>
  )
}
