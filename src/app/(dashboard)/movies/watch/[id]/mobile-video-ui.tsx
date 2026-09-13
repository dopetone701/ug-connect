"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import "./mobile-full.css"
import SimilarMovies from "./similar-movies"

export default function MobileVideoUI({ movie }: any) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const videoRef = useRef<HTMLVideoElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const hasLoadedSrc = useRef<string | null>(null)

  const [isFull, setIsFull] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [showPlay, setShowPlay] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true) // NEW: YT spinner
  const [isMuted, setIsMuted] = useState(false)
  const [descOpen, setDescOpen] = useState(false)

  const playTimeout = useRef<any>(null)

  useEffect(() => {
    setIsFull(searchParams.get("t") === "full")
  }, [searchParams])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [movie?.id, isFull])

  // LOAD VIDEO - NO POSTER
  useEffect(() => {
    const v = videoRef.current
    if (!v ||!movie?.video_url) return
    if (searchParams.get("t") === "preview") return
    if (hasLoadedSrc.current === movie.video_url) return

    hasLoadedSrc.current = movie.video_url
    setIsLoading(true) // show spinner
    v.src = movie.video_url
    v.load()
    v.play().then(() => setPlaying(true)).catch(() => {})
  }, [movie?.video_url])

  useEffect(() => { hasLoadedSrc.current = null }, [movie?.id])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().then(() => setPlaying(true))
    else { v.pause(); setPlaying(false) }
    setShowPlay(true)
    clearTimeout(playTimeout.current)
    playTimeout.current = setTimeout(() => setShowPlay(false), 800)
  }

  const onTimeUpdate = () => {
    const v = videoRef.current
    if (!v?.duration) return
    setProgress((v.currentTime / v.duration) * 100)
  }

  const enterFull = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const el = rootRef.current as any
    try {
      if (el?.requestFullscreen) await el.requestFullscreen()
      // @ts-ignore
      if (screen.orientation?.lock) await screen.orientation.lock('landscape').catch(()=>{})
    } catch {}
    router.replace(`/movies/watch/${movie.id}?t=full`, {scroll:false} as any)
  }

  const exitFull = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      // @ts-ignore
      if (screen.orientation?.unlock) screen.orientation.unlock()
    } catch {}
    router.replace(`/movies/watch/${movie.id}`, {scroll:false} as any)
  }

  const openPreview = (e?: React.MouseEvent) => { e?.stopPropagation(); router.push(`/movies/watch/${movie.id}?t=preview`) }
  const shareMovie = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try { if (navigator.share) await navigator.share({title: movie.title, url: window.location.href}) } catch {}
  }

  if (!movie) return null
  if (searchParams.get("t") === "preview") return null

  return (
    <div ref={rootRef} className={["mob-full-root", isFull? "mode-landscape" : "mode-youtube"].join(" ")}>

      <div className="mob-full-video-wrap" onClick={togglePlay}>
        {/* NO POSTER - black screen like YT */}
        <video
          ref={videoRef}
          playsInline
          controls={false}
          preload="auto"
          className="mob-full-video"
          onTimeUpdate={onTimeUpdate}
          onPlay={() => { setPlaying(true); setIsLoading(false) }}
          onPlaying={() => setIsLoading(false)}
          onCanPlay={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onPause={() => setPlaying(false)}
        />

        {/* YT SPINNING CIRCLE - fade */}
        {isLoading && (
          <div className="yt-spinner">
            <div className="yt-spinner-circle"></div>
          </div>
        )}

        {!isFull? (
          <div className="mob-yt-topbar">
            <button className="mob-yt-icon" onClick={(e)=>{e.stopPropagation(); setIsMuted(!isMuted)}}>{isMuted? "M" : "V"}</button>
            <button className="mob-yt-icon" onClick={enterFull}>⛶</button>
          </div>
        ) : (
          <button className="mob-close-x" onClick={exitFull}>✕</button>
        )}

        {showPlay &&!isLoading && (
          <div className="apple-play-pure">
            {!playing? (
              <svg viewBox="0 0 24 24" width="64" height="64" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}>
                <path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="64" height="64" fill="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}>
                <rect x="7" y="5" width="3.5" height="14" rx="1" />
                <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
              </svg>
            )}
          </div>
        )}

        <div className="mob-progress-track">
          <div className="mob-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {!isFull && (
        <>
          <div className="mob-yt-actions-under">
            <button onClick={openPreview} className="btn-preview">▶ Play Preview</button>
            <button className="btn-share" onClick={shareMovie}>Share</button>
            <button className="btn-list">+ My List</button>
          </div>
          <div className="mob-full-body">
            <h2>{movie.title}</h2>
            <p className={descOpen? "mob-full-desc" : "mob-full-desc clamped"}>{movie.description}</p>
            <button onClick={() => setDescOpen(!descOpen)} className="mob-desc-more">{descOpen? "less" : "...more"}</button>
            <SimilarMovies current={movie} />
          </div>
        </>
      )}
    </div>
  )
}
