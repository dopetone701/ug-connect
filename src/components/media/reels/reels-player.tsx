"use client";

import { useEngine } from "@/components/media/engine/use-engine"
import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

export function ReelsPlayer({
  previewUrl,
  currentId,
  playing,
  showPlay,
  onToggle,
  isActive = true,
}: any) {
  const { videoRef } = useEngine() as any
  const router = useRouter()

  const [showPlayIcon, setShowPlayIcon] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveProgressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSrcRef = useRef<string | null>(null)
  const restoredIdRef = useRef<string | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handoffRef = useRef(false)

  const progressKey = `reels-progress-${currentId}`
  const handoffKey = `connect-player-handoff-${currentId}`
  const pcContinueKey = `continue_${currentId}`

  const saveHandoff = useCallback(() => {
    const video = videoRef?.current
    if (!video || !currentId) return
    try {
      const time = Number(video.currentTime)
      if (!Number.isFinite(time)) return
      const payload = JSON.stringify({
        id: String(currentId),
        time,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        wasPlaying: !video.paused,
        playing: !video.paused,
        type: "preview",
        timestamp: Date.now(),
      })
      sessionStorage.setItem(handoffKey, payload)
      sessionStorage.setItem(pcContinueKey, payload)
      sessionStorage.setItem(progressKey, String(time))
    } catch {}
  }, [currentId, handoffKey, pcContinueKey, progressKey, videoRef])

  // MOBILE -> DESKTOP
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) return
      if (handoffRef.current) return
      const video = videoRef?.current
      if (!video || !currentId) return
      handoffRef.current = true
      saveHandoff()
      try {
        const closeReels = (window as any).__UG_CLOSE_REELS_SILENT__
        if (typeof closeReels === "function") closeReels()
      } catch {}
      requestAnimationFrame(() => {
        router.push(`/movies/watch/${String(currentId)}?t=preview`)
      })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [currentId, router, saveHandoff, videoRef])

  // LOAD
  useEffect(() => {
    const video = videoRef?.current
    if (!video || !previewUrl) return
    if (lastSrcRef.current === previewUrl) return
    lastSrcRef.current = previewUrl
    restoredIdRef.current = null
    setIsReady(false)
    if (video.src !== previewUrl) video.src = previewUrl
    try { video.preload = "metadata"; video.load() } catch {}
  }, [previewUrl, videoRef])

  // RESTORE - NOW READS PC KEY TOO
  const restoreProgress = useCallback(() => {
    const video = videoRef?.current
    if (!video || !currentId) return
    if (restoredIdRef.current === String(currentId)) return
    restoredIdRef.current = String(currentId)

    try {
      // 1. Check PC continue key first (PC -> Mobile)
      const pcRaw = sessionStorage.getItem(pcContinueKey)
      if (pcRaw) {
        const data = JSON.parse(pcRaw)
        const time = Number(data?.time)
        if (Number.isFinite(time) && time > 0.5 && (!video.duration || time < video.duration - 0.2)) {
          video.currentTime = time
          // keep it for resume, don't delete immediately
          return
        }
      }

      // 2. Handoff key
      const handoff = sessionStorage.getItem(handoffKey)
      if (handoff) {
        const data = JSON.parse(handoff)
        const time = Number(data?.time)
        if (Number.isFinite(time) && time > 0 && (!video.duration || time < video.duration - 0.2)) {
          video.currentTime = time
        }
        sessionStorage.removeItem(handoffKey)
        return
      }

      // 3. Normal reels progress
      const saved = sessionStorage.getItem(progressKey)
      if (!saved) return
      const time = Number(saved)
      if (Number.isFinite(time) && time > 0 && (!video.duration || time < video.duration - 0.5)) {
        video.currentTime = time
      }
    } catch {}
  }, [currentId, handoffKey, pcContinueKey, progressKey, videoRef])

  const handleCanPlay = useCallback(() => {
    const video = videoRef?.current
    if (!video) return
    setIsReady(true)
    restoreProgress()
    if (isActive && playing) video.play().catch(() => {})
  }, [isActive, playing, restoreProgress, videoRef])

  useEffect(() => {
    const video = videoRef?.current
    if (!video) return
    if (!isActive) { video.pause(); return }
    if (!playing) { video.pause(); return }
    if (!isReady) return
    video.play().catch(() => {})
  }, [isActive, playing, isReady, videoRef])

  useEffect(() => {
    const video = videoRef?.current
    if (!video || !currentId) return
    const save = () => {
      try { if (Number.isFinite(video.currentTime) && video.currentTime > 0) sessionStorage.setItem(progressKey, String(video.currentTime)) } catch {}
    }
    saveProgressRef.current = setInterval(save, 1500)
    video.addEventListener("timeupdate", save)
    video.addEventListener("pause", save)
    video.addEventListener("ended", save)
    const handleVisibility = () => { if (document.visibilityState === "hidden") save() }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      save()
      video.removeEventListener("timeupdate", save)
      video.removeEventListener("pause", save)
      video.removeEventListener("ended", save)
      document.removeEventListener("visibilitychange", handleVisibility)
      if (saveProgressRef.current) { clearInterval(saveProgressRef.current); saveProgressRef.current = null }
    }
  }, [currentId, progressKey, videoRef])

  const handleWaiting = useCallback(() => {}, [isActive, playing, videoRef])

  const handleError = useCallback(() => {
    const video = videoRef?.current
    if (!video || !previewUrl) return
    if (retryRef.current) clearTimeout(retryRef.current)
    retryRef.current = setTimeout(() => {
      try {
        const currentTime = video.currentTime
        video.load()
        const restoreAfterRetry = () => {
          try { if (Number.isFinite(currentTime) && currentTime > 0 && Number.isFinite(video.duration) && currentTime < video.duration) video.currentTime = currentTime } catch {}
          video.removeEventListener("loadedmetadata", restoreAfterRetry)
          if (isActive && playing) video.play().catch(() => {})
        }
        video.addEventListener("loadedmetadata", restoreAfterRetry)
      } catch {}
    }, 1200)
  }, [previewUrl, isActive, playing, videoRef])

  useEffect(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
    if (showPlay) {
      setShowPlayIcon(true)
      timeoutRef.current = setTimeout(() => { setShowPlayIcon(false); timeoutRef.current = null }, 900)
    } else setShowPlayIcon(false)
    return () => { if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null } }
  }, [showPlay, playing])

  useEffect(() => { return () => { if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null } } }, [])

  return (
    <>
      <video
        ref={videoRef}
        key={`preview-${currentId}`}
        src={previewUrl || undefined}
        className="reel-video"
        loop
        playsInline
        controls={false}
        preload="metadata"
        disablePictureInPicture
        onLoadedMetadata={restoreProgress}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onStalled={handleWaiting}
        onError={handleError}
        onClick={onToggle}
      />
      <div className="reel-gradient" />
      {showPlayIcon && (
        <div className="apple-play-pure" style={{ opacity: showPlayIcon ? 1 : 0, transition: "opacity 0.25s ease", pointerEvents: "none" }}>
          {!playing ? (
            <svg viewBox="0 0 24 24" width="72" height="72" fill="white" aria-hidden="true" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}>
              <path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="72" height="72" fill="white" aria-hidden="true" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}>
              <rect x="7" y="5" width="3.5" height="14" rx="1" />
              <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
            </svg>
          )}
        </div>
      )}
    </>
  )
}
