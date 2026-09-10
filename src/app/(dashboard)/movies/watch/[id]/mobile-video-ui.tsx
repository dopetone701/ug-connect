"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import "./mobile-full.css"
import SimilarMovies from "./similar-movies"

export default function MobileVideoUI({ movie }: any) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const videoRef = useRef<HTMLVideoElement>(null)
  const hasLoadedSrc = useRef<string | null>(null)

  const [isFull, setIsFull] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [showPlay, setShowPlay] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showVol, setShowVol] = useState(false)
  const [volPct, setVolPct] = useState(100)
  const [descOpen, setDescOpen] = useState(false)

  const touchStartY = useRef(0)
  const touchStartVol = useRef(1)
  const volTimeout = useRef<any>(null)
  const playTimeout = useRef<any>(null)

  useEffect(() => {
    setIsFull(searchParams.get("t") === "full")
  }, [searchParams])

  // LOAD ONCE
  useEffect(() => {
    const v = videoRef.current
    if (!v ||!movie?.video_url) return
    if (searchParams.get("t") === "preview") return
    if (hasLoadedSrc.current === movie.video_url) return

    hasLoadedSrc.current = movie.video_url
    v.src = movie.video_url
    v.load()
    v.volume = isMuted? 0 : volume
    v.play().then(() => setPlaying(true)).catch(() => {})
  }, [movie?.video_url])

  useEffect(() => { hasLoadedSrc.current = null }, [movie?.id])
  useEffect(() => { if (videoRef.current) videoRef.current.volume = isMuted? 0 : volume }, [volume, isMuted])

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
    if (!v ||!v.duration) return
    setProgress((v.currentTime / v.duration) * 100)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    if (x < rect.width * 0.45) {
      touchStartY.current = e.touches[0].clientY
      touchStartVol.current = isMuted? 0 : volume
      setShowVol(true)
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!showVol) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const dy = touchStartY.current - e.touches[0].clientY
    const newVol = Math.max(0, Math.min(1, touchStartVol.current + dy / rect.height))
    setVolume(newVol); setVolPct(Math.round(newVol * 100)); setIsMuted(newVol === 0)
  }
  const onTouchEnd = () => { setTimeout(() => setShowVol(false), 1000) }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMuted || volume === 0) { setVolume(volPct > 0? volPct/100 : 0.5); setIsMuted(false) }
    else setIsMuted(true)
    setShowVol(true)
  }

  // add isAnimating state
const [isAnimating, setIsAnimating] = useState(false)

const enterFull = (e: React.MouseEvent) => {
  e.stopPropagation()
  setIsAnimating(true)
  setTimeout(() => {
    router.replace(`/movies/watch/${movie.id}?t=full`, {scroll:false} as any)
    setTimeout(() => setIsAnimating(false), 460)
  }, 10)
}

const exitFull = (e?: React.MouseEvent) => {
  e?.stopPropagation()
  setIsAnimating(true)
  router.replace(`/movies/watch/${movie.id}`, {scroll:false} as any)
  setTimeout(() => setIsAnimating(false), 460)
}

  const openPreview = (e?: React.MouseEvent) => { e?.stopPropagation(); router.push(`/movies/watch/${movie.id}?t=preview`) }
  const shareMovie = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try { if (navigator.share) await navigator.share({title: movie.title, url: window.location.href}) } catch {}
  }

  if (!movie) return null
  if (searchParams.get("t") === "preview") return null

  return (
    <div className={["mob-full-root", isFull? "mode-landscape" : "mode-youtube"].join(" ")}>

      {/* SINGLE VIDEO - NEVER UNMOUNTS - ALL ACTIONS WRAPPED HERE */}
      <div className="mob-full-video-wrap" onClick={togglePlay} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <video ref={videoRef} poster={movie.cover_url || movie.cover} playsInline controls={false} preload="auto" className="mob-full-video" onTimeUpdate={onTimeUpdate} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />

        {showVol && <div className="mob-vol-counter"><span>{isMuted? 0 : volPct}%</span></div>}

        {!isFull? (
          <div className="mob-yt-topbar">
            <button className="mob-yt-icon" onClick={toggleMute}>{isMuted? "M" : "V"}</button>
            <button className="mob-yt-icon" onClick={enterFull}>⛶</button>
          </div>
        ) : (
          <button className="mob-close-x" onClick={exitFull}>X</button>
        )}

        {showPlay && (
  <div className="apple-play-pure">
    {!playing ? (
      <svg
        viewBox="0 0 24 24"
        width="64"
        height="64"
        fill="white"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}
      >
        <path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" />
      </svg>
    ) : (
      <svg
        viewBox="0 0 24 24"
        width="64"
        height="64"
        fill="white"
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,.6))" }}
      >
        <rect x="7" y="5" width="3.5" height="14" rx="1" />
        <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
      </svg>
    )}
  </div>
)}


        {isFull && (
          <div className="mob-full-btns">
            <button onClick={openPreview} className="btn-preview">▶ Play Preview</button>
            <button className="btn-share" onClick={shareMovie}>Share</button>
            <button className="btn-list">+ My List</button>
          </div>
        )}
      </div>

      {/* PORTRAIT = REAL PAGE */}
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
