"use client"

export const runtime = 'edge'

import { useEffect, useState, useRef } from "react"
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation"
import "../../movies.css"
import "./connect-player.css"


const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies"

export default function WatchPage(){
  const params = useParams()
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const type = search.get("t") || "full"
  const isPreview = type === "preview"

  const [movie, setMovie] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [shellFull, setShellFull] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(1)
  const [hasStarted, setHasStarted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(()=>{
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  },[])

  useEffect(()=>{
    fetch(API_URL, { cache:"no-store" }).then(r=>r.json()).then(d=> setMovie(d.find((m:any)=> String(m.id)===String(params.id))))
  },[params.id])

  useEffect(()=>{
    if(!movie) return
    if(isMobile){
      setTimeout(()=> {
        setShellFull(true)
        setMounted(true)
      }, 50)
    } else {
      if(!isPreview) {
        setTimeout(()=> setShellFull(true), 200)
      }
      setMounted(true)
    }
  },[movie, isPreview, isMobile])

  useEffect(()=>{
    if(!playing) return
    const t = setTimeout(()=> setShowControls(false), 3200)
    return ()=> clearTimeout(t)
  },[playing, showControls])

  if(!movie) return <div className="film-root"><div className="film-giant" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>Loading connect...</div></div>

  const videoUrl = isPreview? movie.preview_urls?.[0] : movie.video_url

  const togglePlay = () => {
    if(!videoRef.current) return
    if(playing) videoRef.current.pause()
    else{
      videoRef.current.play()
      setHasStarted(true)
    }
    setPlaying(!playing)
  }

  const seekTo = (clientX:number, rect:DOMRect) => {
    const pct = Math.max(0, Math.min(1, (clientX - rect.left)/rect.width))
    if(videoRef.current && duration){
      videoRef.current.currentTime = pct * duration
      setProgress(pct*100)
    }
  }

  const setVolumeFromX = (clientX:number, rect:DOMRect) => {
    const pct = Math.max(0, Math.min(1, (clientX - rect.left)/rect.width))
    setVolume(pct)
    if(videoRef.current) videoRef.current.volume = pct
  }

  const goFullMovie = () => {
    // keeps same route, only switches t param to full - links to full movie
    router.push(`${pathname}?t=full`)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${pathname}?t=full`
    if (navigator.share) {
      try { await navigator.share({ title: movie.title, text: movie.description, url: shareUrl }) } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl)
    }
  }

  return (
    <div
      ref={rootRef}
      className={`
        film-root connect-root
        ${shellFull? 'is-shell-full' : ''}
        ${isPreview? 'mode-preview' : 'mode-full'}
        ${isMobile? 'is-mobile' : 'is-desktop'}
        ${isMobile && isPreview? 'mobile-tiktok' : ''}
        ${isMobile &&!isPreview? 'mobile-cinema' : ''}
        ${mounted? 'is-mounted' : 'is-entering'}
      `}
    >
      <div
        className={`
          film-giant connect-player
          ${shellFull? 'shell-full' : ''}
          ${isPreview? 'tiktok-sheet' : 'cinema-sheet-left'}
          no-radius
        `}
        onMouseMove={()=> setShowControls(true)}
        onMouseLeave={()=> playing && setShowControls(false)}
      >
        {!shellFull &&!isMobile && <div className="film-bg"><div className="gblob b1"/><div className="gblob b2"/></div>}

        {!shellFull &&!isMobile && (
          <div className="strip-wrap upper full"><div className="strip-track ltr">{[...Array(18)].map((_,i)=>(<div key={i} className="strip-card dna-pose" />))}</div></div>
        )}

        <div className="film-center no-radius">
          <div className="center-cover no-radius">
            {shellFull && (
              <div className="fullscreen-logo top-right">
                <img src="/logo.png" alt="logo" />
              </div>
            )}

            <video
              ref={videoRef}
              src={videoUrl}
              poster={movie.cover_url}
              className={`connect-video no-radius ${isPreview && isMobile? 'vertical-full' : 'horizontal-full'}`}
              onTimeUpdate={(e)=>{
                const v=e.currentTarget;
                setCurrentTime(v.currentTime)
                setProgress((v.currentTime/v.duration)*100);
                setDuration(v.duration)
              }}
              onLoadedMetadata={(e)=> setDuration((e.target as HTMLVideoElement).duration)}
              onEnded={()=> setPlaying(false)}
              onClick={togglePlay}
              playsInline
              loop={isPreview}
            />

            {!hasStarted &&!playing && <img src={movie.cover_url} alt={movie.title} className="connect-poster no-radius" />}

            {isPreview &&!shellFull &&!isMobile && <div className="center-fade" />}

            <div className={`center-top ${showControls? 'show' : ''}`}>
              <button className="back-home-btn" onClick={()=> router.push('/movies')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                BACK
              </button>
              <div className="top-pills">
                <span className="c-pill">{movie.genre}</span>
                <span className="c-pill muted">{movie.vj}</span>
                {isPreview && <span className="c-pill preview-badge">PREVIEW</span>}
              </div>
            </div>

            <div className={`center-desc right-side ${shellFull? 'hide-in-full' : ''} desktop-only`}>
              <div className="c-title">{movie.title}</div>
              <div className="c-text">{movie.description?.slice(0,130)}</div>
            </div>

            {isPreview && isMobile && (
              <div className="preview-meta-right-bottom">
                <div className="preview-meta-content">
                  <div className="c-title">{movie.title}</div>
                  <div className="c-text">{movie.description?.slice(0,90)}...</div>
                  <div className="preview-meta-row">
                    <span className="c-pill small">{movie.genre}</span>
                    <span className="c-pill small muted">{movie.vj}</span>
                  </div>
                  <button className="btn-watch-full" onClick={goFullMovie}>
                    {/* pure svg triangle */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8.2 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z"/></svg>
                    Watch Full Movie
                  </button>
                </div>

                <div className="reels-actions-stack">
                  {/* HEART - TikTok SVG */}
                  <button className="reel-act" onClick={()=> setLiked(!liked)}>
                    <span className={`reel-icon-circle ${liked? 'liked' : ''}`}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill={liked? "hsl(var(--primary))" : "none"} stroke={liked? "hsl(var(--primary))" : "white"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20.6l-1.4-1.28C6.2 15.3 2 12.2 2 8.4 2 5.1 4.5 2.5 7.8 2.5c1.86 0 3.63.86 4.7 2.2 1.07-1.34 2.84-2.2 4.7-2.2C20.5 2.5 23 5.1 23 8.4c0 3.8-4.2 6.9-8.6 10.92L12 20.6z"/>
                      </svg>
                    </span>
                    <small>12.4K</small>
                  </button>

                  {/* COMMENT */}
                  <button className="reel-act" onClick={()=> document.dispatchEvent(new CustomEvent('open-comments'))}>
                    <span className="reel-icon-circle">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.5 8.5 0 0 1-12.8 7.37L3 21l2.1-5.22A8.5 8.5 0 0 1 21 11.5z"/>
                      </svg>
                    </span>
                    <small>842</small>
                  </button>

                  {/* SHARE - Apple SVG */}
                  <button className="reel-act" onClick={handleShare}>
                    <span className="reel-icon-circle">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3.5v11"/>
                        <path d="M8.5 6.5L12 3l3.5 3.5"/>
                        <path d="M4.5 13.5V18a1.5 1.5 0 0 0 1.5 1.5h12A1.5 1.5 0 0 0 19.5 18v-4.5"/>
                      </svg>
                    </span>
                    <small>Share</small>
                  </button>
                </div>
              </div>
            )}

            {/* APPLE PLAY - iPhone 14 Pro Max exact triangle */}
            {!playing && (
              <button className="play-apple" onClick={togglePlay} aria-label="play">
                <span className="play-apple-core">
                  <svg viewBox="0 0 24 24" className="play-apple-tri" fill="none">
                    <path d="M8.2 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" fill="white"/>
                  </svg>
                </span>
              </button>
            )}

            <div className={`connect-controls no-radius ${showControls? 'show' : ''} ${isMobile && isPreview? 'controls-tiktok' : ''}`}>
              <div className="cc-left">
                <button className="cc-icon" onClick={togglePlay}>
                  {playing?
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="7" y="5" width="3.2" height="14" rx="1"/><rect x="13.8" y="5" width="3.2" height="14" rx="1"/></svg> :
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8.2 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z"/></svg>
                  }
                </button>

                <div className="vol-premium desktop-only"
                  onClick={(e)=> setVolumeFromX(e.clientX, (e.currentTarget as any).getBoundingClientRect())}
                  onMouseMove={(e)=>{ if(e.buttons===1) setVolumeFromX(e.clientX, (e.currentTarget as any).getBoundingClientRect()) }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  <div className="vol-track"><div className="vol-fill" style={{width:`${volume*100}%`}} /></div>
                </div>

                <div className="starz-progress-wrap">
                  <div className="starz-progress"
                    onClick={(e)=>{
                      const bg = (e.currentTarget as HTMLElement).querySelector('.starz-progress-bg') as HTMLElement
                      const rect = bg.getBoundingClientRect()
                      seekTo(e.clientX, rect)
                    }}
                    onMouseMove={(e)=>{
                      if(e.buttons!== 1) return
                      const bg = (e.currentTarget as HTMLElement).querySelector('.starz-progress-bg') as HTMLElement
                      const rect = bg.getBoundingClientRect()
                      seekTo(e.clientX, rect)
                    }}
                  >
                    <div className="starz-progress-bg">
                      <div className="starz-progress-fill" style={{width:`${progress}%`}} />
                      <div className="starz-thumb" style={{left:`${progress}%`}} />
                    </div>
                  </div>
                  <div className="starz-time-out">
                    {Math.floor(currentTime/60)}:{String(Math.floor(currentTime%60)).padStart(2,'0')} / {Math.floor(duration/60)}:{String(Math.floor(duration%60)).padStart(2,'0')}
                  </div>
                </div>
              </div>

              <div className="cc-right">
                <button className="cc-icon apple-full desktop-only" onClick={async()=>{
                  if(!shellFull){ setShellFull(true); try{ await rootRef.current?.requestFullscreen() }catch{} }
                  else{ setShellFull(false); try{ if(document.fullscreenElement) await document.exitFullscreen() }catch{} }
                }}>
                  {shellFull? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M4 14h6v6M20 10V4h-6M14 20h6v-6M10 4H4v6"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>}
                </button>
                <button className="cc-icon" onClick={()=>{
                  if(shellFull && isMobile){ setShellFull(false); try{ if(document.fullscreenElement) document.exitFullscreen() }catch{} }
                  router.push('/movies')
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {!shellFull &&!isMobile && (
          <div className="strip-wrap lower full"><div className="strip-track rtl">{[...Array(18)].map((_,i)=>(<div key={i} className="strip-card dna-pose" />))}</div></div>
        )}
      </div>
    </div>
  )
}
