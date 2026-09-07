"use client"
export const runtime = 'edge'

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation"
import "../../movies.css"
import "./connect-player.css"
import "./mobile-preview.css"
import "./mobile-full.css"
import MobilePreview from "./mobile-preview"
import MobileVideoUI from "./mobile-video-ui"
import { singleplayerprovider as SinglePlayerProvider } from "../../_components/single-player"

import { useMovieStore } from "../../_lib/use-movie-store"
import SimilarMovies from "./similar-movies"

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies"

export default function WatchPage(){
  const params = useParams()
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const type = search.get("t") || "full"
  const isPreview = type === "preview"

  const { lists, addToList, removeFromList, createList } = useMovieStore() as any
  const mainList = lists?.[0]
  const isInMyList = mainList?.movieIds?.includes(Number(params.id)) || mainList?.movieIds?.includes(String(params.id))

  const [movie, setMovie] = useState<any>(null)
   const videoRef = useRef<HTMLVideoElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const volRef = useRef<HTMLDivElement>(null)
  const lastTimeRef = useRef(0)

  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(1)
  const [hasStarted, setHasStarted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isDraggingVol, setIsDraggingVol] = useState(false)
   const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [quality, setQuality] = useState("auto")
  const [bufferedProgress, setBufferedProgress] = useState(0)

   const [isMobile, setIsMobile] = useState(false)
  const [allMovies, setAllMovies] = useState<any[]>([])
  const [reelIndex, setReelIndex] = useState(0)

  useEffect(()=>{
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return ()=> window.removeEventListener('resize', check)
  },[])

  useEffect(()=>{
    fetch(API_URL, { cache:"no-store" }).then(r=>r.json()).then(d=> {
      setAllMovies(d)
      const idx = d.findIndex((m:any)=> String(m.id)===String(params.id))
      if(idx>=0) setReelIndex(idx)
    })
  },[params.id])

   const updateBufferedProgress = useCallback(() => {
    const video = videoRef.current
    if (!video ||!video.duration ||!video.buffered.length) return
    let bufferedEnd = 0
    for (let i = 0; i < video.buffered.length; i++) {
      const start = video.buffered.start(i)
      const end = video.buffered.end(i)
      if (video.currentTime >= start && video.currentTime <= end) {
        bufferedEnd = end
        break
      }
    }
    if (!bufferedEnd) {
      bufferedEnd = video.buffered.end(video.buffered.length - 1)
    }
    setBufferedProgress(Math.min(100, (bufferedEnd / video.duration) * 100))
  }, [])

  const seekTo = useCallback((clientX:number, rect:DOMRect) => {
    const pct = Math.max(0, Math.min(1, (clientX - rect.left)/rect.width))
    if(videoRef.current && duration){
      videoRef.current.currentTime = pct * duration
      setProgress(pct*100)
    }
  }, [duration])

  useEffect(()=>{
    fetch(API_URL, { cache:"no-store" }).then(r=>r.json()).then(d=> setMovie(d.find((m:any)=> String(m.id)===String(params.id))))
  },[params.id])

  useEffect(()=>{
    if(!movie) return
    setTimeout(()=> setMounted(true), 50)
    const onFs = () => setIsFullScreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  },[movie])

  useEffect(()=>{
    if(!playing) return
    const t = setTimeout(()=> setShowControls(false), 3200)
    return ()=> clearTimeout(t)
  },[playing, showControls])

  // Vertical volume handler
  const updateVolumeFromY = (clientY: number) => {
    if(!volRef.current) return
    const rect = volRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
    setVolume(pct)
    if(videoRef.current) videoRef.current.volume = pct
  }

  useEffect(()=>{
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if(!isDraggingVol) return
      const y = 'touches' in e? e.touches[0].clientY : (e as MouseEvent).clientY
      updateVolumeFromY(y)
    }
    const handleUp = () => setIsDraggingVol(false)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  },[isDraggingVol])

  if(!movie) return <div className="film-root"><div className="film-giant inner-body" style={{display:"flex",alignItems:"center",justifyContent:"center",background:"#000",color:"#fff"}}>Loading connect...</div></div>

  const rawSources = [
    { label: "Auto", value: "auto", url: isPreview? movie.preview_urls?.[0] : movie.video_url },
    { label: "4K • 2160p", value: "2160", url: movie.video_url_4k || movie.video_url_2160 || movie.qualities?.["2160"] || movie.qualities?.["4k"] },
    { label: "2K • 1440p", value: "1440", url: movie.video_url_1440 || movie.qualities?.["1440"] },
    { label: "1080p", value: "1080", url: movie.video_url_1080 || movie.qualities?.["1080"] },
    { label: "720p", value: "720", url: movie.video_url_720 || movie.qualities?.["720"] },
    { label: "480p", value: "480", url: movie.video_url_480 || movie.qualities?.["480"] },
  ].filter(q=>!!q.url)

  const qualitySources = rawSources.length === 1? rawSources : [
    rawSources[0],
  ...rawSources.slice(1),
    { label: "Original", value: "orig", url: isPreview? movie.preview_urls?.[0] : movie.video_url }
  ].filter((v,i,a)=> a.findIndex(x=>x.url===v.url)===i)

  const currentQualityObj = qualitySources.find(q=>q.value===quality) || qualitySources[0]
  const videoUrl = currentQualityObj.url

  const changeQuality = async (q:any) => {
    if(!videoRef.current) return
    lastTimeRef.current = videoRef.current.currentTime
    const wasPlaying =!videoRef.current.paused
    setQuality(q.value)
    setShowQualityMenu(false)
    setTimeout(async ()=>{
      if(!videoRef.current) return
      videoRef.current.currentTime = lastTimeRef.current
      if(wasPlaying) try{ await videoRef.current.play() }catch{}
    }, 80)
  }

  const togglePlay = () => {
    if(!videoRef.current) return
    if(playing) videoRef.current.pause()
    else{ videoRef.current.play(); setHasStarted(true) }
    setPlaying(!playing)
  }

  const handleMyList = () => {
    if(!mainList) createList("my-list")
    const id = mainList?.id || lists?.[0]?.id
    if(isInMyList) removeFromList(id, movie.id)
    else addToList(id, movie.id)
  }

   const formatTime = (sec: number) => {
    if(!sec || isNaN(sec)) return "0:00"
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)
    if(h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    return `${m}:${String(s).padStart(2,'0')}`
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${pathname}?t=full`
    if (navigator.share) {
      try { await navigator.share({ title: movie.title, text: movie.description, url: shareUrl }) } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert("Link copied!")
    }
  }

// AFTER - FIXED PROVIDER NAME
if(isMobile){
  return (
    <SinglePlayerProvider>
      {isPreview? (
        <MobilePreview movies={allMovies} startIndex={reelIndex} currentMovie={movie} onClose={()=> router.back()} />
      ) : (
        <MobileVideoUI movie={movie} allMovies={allMovies} />
      )}
    </SinglePlayerProvider>
  )
}

  return (
    <SinglePlayerProvider>
    <div ref={rootRef} className={`film-root connect-root ${isFullScreen? 'is-shell-full' : ''} ${mounted? 'is-mounted' : 'is-entering'}`}>
      <div className="film-giant connect-player inner-body" onMouseMove={()=> setShowControls(true)} onMouseLeave={()=> playing && setShowControls(false)}>
        <div className="film-center">
          <div className="center-cover">

            <div className="fullscreen-logo top-right">
              <img src="/logo.png" alt="logo" />
            </div>

            <video
              ref={videoRef}
              src={videoUrl}
              poster={movie.cover_url}
              className="connect-video"
              onTimeUpdate={(e)=>{
                const v = e.currentTarget
                setCurrentTime(v.currentTime)
                if (v.duration) {
                  setProgress((v.currentTime / v.duration) * 100)
                  setDuration(v.duration)
                }
                updateBufferedProgress()
              }}
             onProgress={updateBufferedProgress}
              onCanPlay={updateBufferedProgress}
             onLoadedMetadata={(e)=> {
                setDuration((e.target as HTMLVideoElement).duration)
                if(lastTimeRef.current){ (e.target as HTMLVideoElement).currentTime = lastTimeRef.current }
                  updateBufferedProgress()
              }}
              onEnded={()=> setPlaying(false)}
              onClick={togglePlay}
              playsInline
              loop={isPreview}
            />
            {!hasStarted &&!playing && <img src={movie.cover_url} alt={movie.title} className="connect-poster" />}

            <div className={`center-top ${showControls? 'show' : ''}`}>
              <div className="top-pills">
                <span className="c-pill">{movie.genre}</span>
                <span className="c-pill muted">{movie.vj}</span>
              </div>
            </div>

            {!playing && (
              <button className="play-apple" onClick={togglePlay} aria-label="play">
                <span className="play-apple-core">
                  <svg viewBox="0 0 24 24" className="play-apple-tri" fill="none">
                    <path d="M8.2 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" fill="white"/>
                  </svg>
                </span>
              </button>
            )}

            <div className={`connect-controls ${showControls? 'show' : ''}`}>

              <div className="cc-left">
                <div
                  ref={volRef}
                  className="vol-vertical"
                  onMouseDown={(e)=> { setIsDraggingVol(true); updateVolumeFromY(e.clientY) }}
                  onTouchStart={(e)=> { setIsDraggingVol(true); updateVolumeFromY(e.touches[0].clientY) }}
                  onClick={(e)=> updateVolumeFromY(e.clientY)}
                >
                  <div className="vol-vertical-track">
                    <div className="vol-vertical-fill" style={{height:`${volume*100}%`}} />
                    <div className="vol-vertical-thumb" style={{bottom:`calc(${volume*100}% - 5px)`}} />
                  </div>
                  <div className="vol-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  </div>
                </div>

                <div className="action-pills-row">
                  <button className={`pill-btn mylist ${isInMyList? 'added' : ''}`} onClick={handleMyList}>
                    {isInMyList? "✓ ADDED" : "+ MY LIST"}
                  </button>
                  <button className="pill-btn share" onClick={handleShare}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3.5v11"/><path d="M8.5 6.5L12 3l3.5 3.5"/><path d="M4.5 13.5V18a1.5 1.5 0 0 0 1.5 1.5h12A1.5 1.5 0 0 0 19.5 18v-4.5"/></svg>
                    SHARE
                  </button>
                </div>
              </div>

              <div className="cc-center">
                <div className="starz-progress-wrap">
                  <div className="starz-progress"
                    onClick={(e)=>{
                      const bg = e.currentTarget.querySelector('.starz-progress-bg') as HTMLElement
                      if(bg) seekTo(e.clientX, bg.getBoundingClientRect())
                    }}
                    onMouseMove={(e)=>{
                      if(e.buttons!==1) return
                      const bg = e.currentTarget.querySelector('.starz-progress-bg') as HTMLElement
                      if(bg) seekTo(e.clientX, bg.getBoundingClientRect())
                          updateBufferedProgress()
                    }}
                  >
                    <div className="starz-progress-bg">
  <div className="starz-buffered" style={{ width: `${bufferedProgress}%` }} />
  <div className="starz-progress-fill" style={{ width: `${progress}%` }} />
  <div className="starz-thumb" style={{ left: `${progress}%` }} />
</div>
                  </div>
                                   <div className="starz-time-out">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </div>

              <div className="cc-right">
                <button className="cc-icon details-btn" onClick={()=> setDetailsOpen(!detailsOpen)} title="Details">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                </button>
                               <div className="settings-wrap">
                  <button className={`cc-icon settings-btn ${showQualityMenu? 'active':''}`} onClick={()=> setShowQualityMenu(!showQualityMenu)} title="Quality">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0.3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1a2 2 0 1 1-4 0V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0.3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1.8Z" /></svg>
                  </button>
                  {showQualityMenu && (
                    <div className="settings-menu">
                      <div className="settings-head">QUALITY</div>
                      {qualitySources.map(q=>(
                        <button key={q.value} className={`settings-item ${quality===q.value? 'active':''}`} onClick={()=> changeQuality(q)}>
                          <span>{q.label}</span>{quality===q.value && <span className="q-dot">●</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="cc-icon apple-full"
                  onClick={async()=>{
                    try{
                      const fullscreenElement = document.fullscreenElement;
                      if(!fullscreenElement){
                        const element = rootRef.current;
                        if(element?.requestFullscreen){
                          await element.requestFullscreen();
                        }
                      }else{
                        if(document.exitFullscreen){
                          await document.exitFullscreen();
                        }
                      }
                    }catch(error){
                      console.error("Fullscreen toggle failed:", error);
                    }
                  }}
                  title={isFullScreen? "Exit fullscreen" : "Enter fullscreen"}
                  aria-label={isFullScreen? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullScreen? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9h5V4" /><path d="M9 9L4 4" /><path d="M20 9h-5V4" /><path d="M15 9l5-5" /><path d="M4 15h5v5" /><path d="M9 15l-5 5" /><path d="M20 15h-5v5" /><path d="M15 15l5 5" /></svg>
) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M3 3l6 6" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M21 3l-6 6" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M3 21l6-6" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /><path d="M21 21l-6-6" /></svg>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      {detailsOpen && (
        <div className="details-panel under-player">
          <div className="dp-head">
            <h2>{movie.title}</h2>
            <button className="dp-close" onClick={()=> setDetailsOpen(false)}>✕</button>
          </div>
          <div className="dp-meta">
            <span className="c-pill">{movie.genre}</span>
            <span className="c-pill muted">{movie.vj}</span>
            <span className="c-pill muted">{movie.year || "2024"}</span>
          </div>
          <p className="dp-desc">{movie.description}</p>
          <div className="dp-actions">
            <button className={`pill-btn mylist ${isInMyList? 'added' : ''}`} onClick={handleMyList}>{isInMyList? "✓ IN MY LIST" : "+ ADD TO MY LIST"}</button>
            <button className="pill-btn share" onClick={handleShare}>SHARE MOVIE</button>
          </div>
        </div>
      )}
<SimilarMovies current={movie} />
    </div>
    </SinglePlayerProvider>
  )
}
