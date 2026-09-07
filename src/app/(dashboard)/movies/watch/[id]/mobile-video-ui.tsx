"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import "./mobile-full.css"
import SimilarMovies from "./similar-movies"
import { usesingleplayer } from "../../_components/single-player"

export default function MobileVideoUI({ movie }: any){
  const router = useRouter()
  const localRef = useRef<HTMLVideoElement>(null)
  const { videoref: ctxRef, current: ctxCurrent, playmovie } = usesingleplayer() || {}
  const videoRef = ctxRef || localRef
  const activeMovie = ctxCurrent || movie

  const [isFull, setIsFull] = useState(false) // yt by default - shell visible
  const [playing, setPlaying] = useState(true)
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

  if(!activeMovie) return null

  useEffect(()=>{
    document.querySelectorAll('video').forEach(v=>{
      if(v!== videoRef.current){ v.pause(); v.removeAttribute('src'); v.load() }
    })
    document.querySelectorAll('audio').forEach(a=> a.pause())
    const shellEls = document.querySelectorAll('nav, aside, [data-shell], [class*="sidebar"], [class*="bottom-nav"], [class*="tab-bar"]')
    const showShell = () => {
      document.body.style.overflow = ""
      shellEls.forEach((el:any)=>{ el.style.display=""; el.style.visibility=""; el.style.opacity=""; el.style.pointerEvents="" })
      try{ screen.orientation?.unlock?.() }catch{}
    }
    const hideShell = () => {
      document.body.style.overflow = "hidden"
      shellEls.forEach((el:any)=>{ el.style.display="none" })
      try{ screen.orientation?.lock?.("landscape").catch(()=>{}) }catch{}
    }
    if(isFull) hideShell(); else showShell()
    return ()=>{ showShell(); if(!ctxRef && videoRef.current) videoRef.current.pause() }
  },[isFull])

  useEffect(()=>{
    if(videoRef.current){ videoRef.current.volume = isMuted? 0 : volume }
  },[volume, isMuted])

  const togglePlay = () => {
    if(!videoRef.current) return
    if(playing){ videoRef.current.pause(); setPlaying(false) }
    else { videoRef.current.play(); setPlaying(true) }
    setShowPlay(true)
    setTimeout(()=> setShowPlay(false), 800)
  }

  const onTimeUpdate = () => {
    if(videoRef.current?.duration){
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)
    }
  }

  // volume swipe left side
  const onTouchStart = (e: React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    if(x < rect.width * 0.45){ // left side swipe zone
      touchStartY.current = e.touches[0].clientY
      touchStartVol.current = isMuted? 0 : volume
      setShowVol(true)
    }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    if(x < rect.width * 0.45 && showVol){
      const dy = touchStartY.current - e.touches[0].clientY // up = positive
      const delta = dy / rect.height // -1 to 1
      let newVol = Math.max(0, Math.min(1, touchStartVol.current + delta))
      setVolume(newVol)
      setVolPct(Math.round(newVol*100))
      setIsMuted(newVol===0)
      if(volTimeout.current) clearTimeout(volTimeout.current)
      volTimeout.current = setTimeout(()=> setShowVol(false), 1200)
    }
  }
  const onTouchEnd = () => { if(showVol){ volTimeout.current = setTimeout(()=> setShowVol(false), 1000) } }

  const toggleMute = (e:any) => {
    e.stopPropagation()
    if(isMuted || volume===0){ setIsMuted(false); setVolume(volPct>0? volPct/100 : 0.5); setVolPct(volPct>0? volPct : 50) }
    else { setIsMuted(true) }
    setShowVol(true)
    setTimeout(()=> setShowVol(false), 1000)
  }

  return (
    <div className={`mob-full-root ${isFull? 'mode-landscape' : 'mode-youtube'} slide-in-left`}>

      {isFull && (
        <button className="mob-close-x" onClick={()=> setIsFull(false)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      )}

      <div className="mob-full-video-wrap"
        onClick={togglePlay}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <video
          ref={videoRef}
          src={activeMovie.video_url}
          poster={activeMovie.cover_url}
          autoPlay
          playsInline
          controls={false}
          className="mob-full-video"
          onTimeUpdate={onTimeUpdate}
          onPlay={()=> setPlaying(true)}
          onPause={()=> setPlaying(false)}
        />

        {/* top center vol counter */}
        {showVol && (
          <div className="mob-vol-counter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d={volPct>50? "M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" : volPct>0? "M15.54 8.46a5 5 0 0 1 0 7.07" : ""}/></svg>
            <span>{isMuted? 0 : volPct}%</span>
          </div>
        )}

        {/* yt top controls - volume + fullscreen */}
        {!isFull && (
          <div className="mob-yt-topbar">
            <button className="mob-yt-icon" onClick={toggleMute}>
              {isMuted || volPct===0? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
            </button>
            <button className="mob-yt-icon" onClick={(e)=>{ e.stopPropagation(); setIsFull(true) }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
            </button>
          </div>
        )}

        {showPlay && (
          <div className="apple-play-pure">
            {!playing? (
              <svg viewBox="0 0 24 24" width="64" height="64" fill="white" style={{filter:"drop-shadow(0 2px 8px rgba(0,0,0,.6))"}}><path d="M8 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="64" height="64" fill="white" style={{filter:"drop-shadow(0 2px 8px rgba(0,0,0,.6))"}}><rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/></svg>
            )}
          </div>
        )}

        <div className="mob-progress-track">
          <div className="mob-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* BTNS JUST UNDER VIDEO */}
      {!isFull && (
        <div className="mob-yt-actions-under">
          <button onClick={()=> { if(playmovie) playmovie(activeMovie); router.push(`/movies/watch/${activeMovie.id}?t=preview`) }} className="btn-preview">▶ Play Preview</button>
          <button className="btn-share" onClick={()=> navigator.share? navigator.share({url:location.href}) : null}>Share</button>
          <button className="btn-list">+ My List</button>
        </div>
      )}

      <div className="mob-full-body">
        <div className="mob-yt-handle" />
        <h2>{activeMovie.title}</h2>

        <div className="mob-desc-wrap">
          <p className={`mob-full-desc ${!descOpen? 'clamped' : ''}`}>{activeMovie.description}</p>
          {!descOpen && activeMovie.description?.length > 200 && (
            <button className="mob-desc-more" onClick={()=> setDescOpen(true)}>
             ... <span>more</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          )}
          {descOpen && (
            <button className="mob-desc-more" onClick={()=> setDescOpen(false)}>
              less <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
            </button>
          )}
        </div>

        {isFull && (
          <div className="mob-full-btns">
            <button onClick={()=> { if(playmovie) playmovie(activeMovie); router.push(`/movies/watch/${activeMovie.id}?t=preview`) }} className="btn-preview">▶ Play Preview</button>
            <button className="btn-share">Share</button>
            <button className="btn-list">+ My List</button>
          </div>
        )}
        <SimilarMovies current={activeMovie} />
      </div>
    </div>
  )
}
