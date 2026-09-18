"use client";

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation"
import "../../movies.css"
import "./connect-player.css"
import "./mobile-preview.css"
import MobilePreview from "./mobile-preview"
import { singleplayerprovider as SinglePlayerProvider } from "../../_components/single-player"
import { useMovieStore } from "../../_lib/use-movie-store"
import SimilarMovies from "./similar-movies"
import EpisodesRow from "./episodes-row"


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

  const [movie, setMovie] = useState<any>(null)
  const [allMovies, setAllMovies] = useState<any[]>([])
  const [reelIndex, setReelIndex] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const volRef = useRef<HTMLDivElement>(null)
  const lastTimeRef = useRef(0)
  const autoPlayTimerRef = useRef<any>(null)

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
  const [isLoading, setIsLoading] = useState(true)
  const [descExpanded, setDescExpanded] = useState(false) // <-- NEW

  


  const skip = useCallback((sec: number) => {
    if(!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + sec))
  }, [duration])

  const updateBufferedProgress = useCallback(() => {
    const video = videoRef.current
    if (!video ||!video.duration ||!video.buffered.length) return
    let bufferedEnd = 0
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.currentTime >= video.buffered.start(i) && video.currentTime <= video.buffered.end(i)) {
        bufferedEnd = video.buffered.end(i); break
      }
    }
    if (!bufferedEnd) bufferedEnd = video.buffered.end(video.buffered.length - 1)
    setBufferedProgress(Math.min(100, (bufferedEnd / video.duration) * 100))
  }, [])

  const seekTo = useCallback((clientX:number, rect:DOMRect) => {
    const pct = Math.max(0, Math.min(1, (clientX - rect.left)/rect.width))
    if(videoRef.current && duration){
      videoRef.current.currentTime = pct * duration
      setProgress(pct*100)
    }
  }, [duration])

  const updateVolumeFromY = useCallback((clientY: number) => {
    if(!volRef.current) return
    const rect = volRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
    setVolume(pct)
    if(videoRef.current) videoRef.current.volume = pct
  }, [])

  const togglePlay = useCallback(() => {
    if(!videoRef.current) return
    if(videoRef.current.paused){
      videoRef.current.muted = false
      videoRef.current.play().then(()=>{ setPlaying(true); setHasStarted(true)}).catch(()=>{})
    }else{
      videoRef.current.pause()
      setPlaying(false)
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const video = videoRef.current as any;
    const root = rootRef.current as any;
    if (!video ||!root) return;
    if (!isFullScreen) {
      setIsFullScreen(true);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      try {
        if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        else if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: "hide" });
        if (window.innerWidth <= 768) {
          // @ts-ignore
          if (screen.orientation?.lock) await screen.orientation.lock('landscape').catch(()=>{});
        }
      } catch {}
      window.scrollTo(0,0);
    } else {
      setIsFullScreen(false);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        // @ts-ignore
        if (document.webkitFullscreenElement) await document.webkitExitFullscreen();
        // @ts-ignore
        if (screen.orientation?.unlock) screen.orientation.unlock();
      } catch {}
    }
  }, [isFullScreen]);

  const formatTime = useCallback((sec: number) => {
    if(!sec || isNaN(sec)) return "0:00"
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)
    if(h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    return `${m}:${String(s).padStart(2,'0')}`
  }, [])

  useEffect(()=>{
    fetch(API_URL, { cache:"no-store" }).then(r=>r.json()).then(d=> {
      setAllMovies(d)
      setMovie(d.find((m:any)=> String(m.id)===String(params.id)))
      const idx = d.findIndex((m:any)=> String(m.id)===String(params.id))
      if(idx>=0) setReelIndex(idx)
    })
  },[params.id])

  useEffect(()=>{
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return ()=> window.removeEventListener('resize', check)
  },[])

  useEffect(()=>{
    if(!movie) return
    const id = setTimeout(()=> setMounted(true), 50)
    const onFs = () => {
      const fs =!!document.fullscreenElement ||!!(document as any).webkitFullscreenElement;
      setIsFullScreen(fs || (window.innerWidth <= 768 && document.body.style.overflow === 'hidden' && isFullScreen));
      if (!fs && window.innerWidth > 768) setIsFullScreen(false);
    }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs as any)
    return () => { clearTimeout(id); document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('webkitfullscreenchange', onFs as any) }
  },[movie, isFullScreen])

  useEffect(()=>{
    if(!playing) return
    const t = setTimeout(()=> setShowControls(false), 3200)
    return ()=> clearTimeout(t)
  },[playing, showControls])

  useEffect(()=>{
    if(!isDraggingVol) return
    const handleMove = (e: any) => {
      const y = 'touches' in e? e.touches[0].clientY : e.clientY
      updateVolumeFromY(y)
    }
    const handleUp = () => setIsDraggingVol(false)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleMove, {passive:true})
    window.addEventListener('touchend', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleUp)
    }
  },[isDraggingVol, updateVolumeFromY])

  const isInMyList = mainList?.movieIds?.includes(Number(params.id)) || mainList?.movieIds?.includes(String(params.id))

   const epId = search.get("ep") || search.get("e")
  const allEps = movie?.seasons?.flatMap((s:any)=>s.episodes||[]) || []
  const activeEp = epId? allEps.find((ep:any)=> String(ep.id)===String(epId)) : null
  const epUrl = activeEp?.video_url || activeEp?.url


  const rawSources = movie? [
    { label: "Auto", value: "auto", url: epUrl || (isPreview? movie.preview_urls?.[0] : movie.video_url) },

    { label: "4K • 2160p", value: "2160", url: movie.video_url_4k || movie.video_url_2160 || movie.qualities?.["2160"] || movie.qualities?.["4k"] },
    { label: "2K • 1440p", value: "1440", url: movie.video_url_1440 || movie.qualities?.["1440"] },
    { label: "1080p", value: "1080", url: movie.video_url_1080 || movie.qualities?.["1080"] },
    { label: "720p", value: "720", url: movie.video_url_720 || movie.qualities?.["720"] },
    { label: "480p", value: "480", url: movie.video_url_480 || movie.qualities?.["480"] },
  ].filter(q=>!!q.url) : []

  const qualitySources = rawSources.filter((v,i,a)=> a.findIndex(x=>x.url===v.url)===i)
  const currentQualityObj = qualitySources.find(q=>q.value===quality) || qualitySources[0]
  const videoUrl = currentQualityObj?.url


useEffect(()=>{
  if(!videoUrl || !videoRef.current) return
  if(!activeEp) return // <-- THIS FIXES SMALL CARDS NEVER AUTOPLAYING
  if(isPreview) return
  setIsLoading(true)
  if(autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
  autoPlayTimerRef.current = setTimeout(async () => {
    const v = videoRef.current
    if(!v) return
    try {
      v.muted = true
      v.volume = volume
      await v.play()
      setPlaying(true)
      setHasStarted(true)
      setIsLoading(false)
      setTimeout(()=> { if(v){ v.muted = false; v.volume = volume } }, 400)
    } catch (e) {
      setIsLoading(false)
    }
  }, 800) // 800ms not 3000ms = instant
  return ()=> clearTimeout(autoPlayTimerRef.current)
}, [videoUrl, activeEp?.id, isPreview])


  const changeQuality = async (q:any) => {
    if(!videoRef.current || q.value===quality) return
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

  const handleMyList = () => {
    if(!mainList) createList("my-list")
    const id = mainList?.id || lists?.[0]?.id
    if(!movie) return
    if(isInMyList) removeFromList(id, movie.id)
    else addToList(id, movie.id)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${pathname}?t=full`
    if(!movie) return
    if (navigator.share) {
      try { await navigator.share({ title: movie.title, text: movie.description, url: shareUrl }) } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert("Link copied!")
    }
  }

  const handlePlayPreview = () => {
    if(isPreview){
      router.push(`${pathname}?t=full`)
    } else {
      router.push(`${pathname}?t=preview`)
    }
  }

  if(!movie) return <div className="film-root"><div className="film-giant inner-body" style={{display:"flex",alignItems:"center",justifyContent:"center",background:"#000",color:"#fff"}}>Loading connect...</div></div>

  if(isPreview && isMobile){
    return (
      <SinglePlayerProvider>
        <MobilePreview movies={allMovies} startIndex={reelIndex} currentMovie={movie} onClose={()=> router.back()} />
      </SinglePlayerProvider>
    )
  }

  return (
    <SinglePlayerProvider>
    <div ref={rootRef} className={`film-root connect-root ${isFullScreen? 'is-shell-full' : ''} ${mounted? 'is-mounted' : 'is-entering'} ${isMobile? 'is-mobile-layout' : 'is-desktop-layout'}`}>
      <div className="film-giant connect-player inner-body" onMouseMove={()=> setShowControls(true)} onMouseLeave={()=> playing && setShowControls(false)} onTouchStart={()=> setShowControls(true)}>
        <div className="film-center">
          <div className="center-cover">
            <div className="fullscreen-logo top-right"><img src="/logo.png" alt="logo" /></div>
            <video
key={`${movie.id}-${quality}-${activeEp?.id || 'default'}`}
              ref={videoRef}
              src={videoUrl}
              className="connect-video"
              onLoadStart={()=> setIsLoading(true)}
              onWaiting={()=> setIsLoading(true)}
              onCanPlay={()=> setIsLoading(false)}
              onPlaying={()=> { setIsLoading(false); setPlaying(true); setHasStarted(true) }}
              onPause={()=> setPlaying(false)}
              onTimeUpdate={(e)=>{
                const v = e.currentTarget
                setCurrentTime(v.currentTime)
                lastTimeRef.current = v.currentTime
                if (v.duration) { setProgress((v.currentTime / v.duration) * 100); setDuration(v.duration) }
                updateBufferedProgress()
              }}
              onProgress={updateBufferedProgress}
              onLoadedMetadata={(e)=> {
                setDuration((e.target as HTMLVideoElement).duration)
                if(lastTimeRef.current) (e.target as HTMLVideoElement).currentTime = lastTimeRef.current
                updateBufferedProgress()
              }}
              onEnded={()=> setPlaying(false)}
              onClick={togglePlay}
              playsInline
              webkit-playsinline="true"
              loop={isPreview}
              preload="auto"
              muted
            />
            {isLoading && (
              <div className="connect-loader">
                <div className="connect-spinner" />
              </div>
            )}
            <div className={`center-top ${showControls? 'show' : ''}`}>
              <div className="top-pills"><span className="c-pill">{movie.vj}</span></div>
            </div>
            {!playing &&!isLoading && (
              <button className="play-apple" onClick={togglePlay} aria-label="play">
                <span className="play-apple-core"><svg viewBox="0 0 24 24" className="play-apple-tri" fill="none"><path d="M8.2 5.2a1 1 0 0 0-1 1v11.6a1 1 0 0 0 1.54.84l8.9-5.8a1 1 0 0 0 0-1.68l-8.9-5.8a1 1 0 0 0-.54-.16Z" fill="white"/></svg></span>
              </button>
            )}
            <div className={`connect-controls ${showControls? 'show' : ''}`}>
              <div className="cc-progress-top">
                <div className="starz-progress" onClick={(e)=>{ const bg = e.currentTarget.querySelector('.starz-progress-bg') as HTMLElement; if(bg) seekTo(e.clientX, bg.getBoundingClientRect()) }}>
                  <div className="starz-progress-bg">
                    <div className="starz-buffered" style={{ width: `${bufferedProgress}%` }} />
                    <div className="starz-progress-fill" style={{ width: `${progress}%` }} />
                    <div className="starz-thumb" style={{ left: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <div className="cc-bottom-row">
                <div className="cc-left-time">{formatTime(currentTime)} / {formatTime(duration)}</div>
                <div className="cc-right-simple">
                  <button className="cc-icon apple-full" onClick={toggleFullscreen}>
                    {isFullScreen? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 9h5V4"/><path d="M9 9L4 4"/><path d="M20 9h-5V4"/><path d="M15 9l5-5"/><path d="M4 15h5v5"/><path d="M9 15l-5 5"/><path d="M20 15h-5v5"/><path d="M15 15l5 5"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M3 3l6 6"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 3l-6 6"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M3 21l6-6"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M21 21l-6-6"/></svg>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

<div className="connect-under-section" style={{ display: isFullScreen ? 'none' : 'flex' }}>
        <div className="connect-action-row">
          <button className="c-action-btn primary" onClick={handlePlayPreview}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5.14v14l11-7-11-7z"/></svg>
            {isPreview? "Play Full" : "Play Preview"}
          </button>
          <button className={`c-action-btn ${isInMyList? 'active' : ''}`} onClick={handleMyList}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            {isInMyList? "In My List" : "My List"}
          </button>
          <button className="c-action-btn" onClick={handleShare}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
            Share
          </button>
        </div>

        <div className="connect-desc-block">
          <h1 className="c-title">{movie.title}</h1>
          <div className="c-meta-row">
            <span className="c-pill">{movie.genre}</span>
            <span className="c-pill muted">{movie.vj}</span>
            <span className="c-pill muted">{movie.year || "2024"}</span>
            <span className="c-pill muted">{movie.rating || "HD"}</span>
          </div>

          {/* 5 LINES + MORE/LESS */}
          <div className="c-desc-wrap">
            <p className={`c-desc ${!descExpanded? 'clamped' : ''}`}>
              {movie.description}
            </p>
            {movie.description && movie.description.length > 100 && (
              <button className="c-more-btn" onClick={()=> setDescExpanded(!descExpanded)}>
                {descExpanded? "See less" : "...more"}
              </button>
            )}
          </div>
        </div>
      </div>

      {detailsOpen && (<div className="details-panel under-player"><div className="dp-head"><h2>{movie.title}</h2><button className="dp-close" onClick={()=> setDetailsOpen(false)}>✕</button></div><div className="dp-meta"><span className="c-pill">{movie.genre}</span><span className="c-pill muted">{movie.vj}</span><span className="c-pill muted">{movie.year || "2024"}</span></div><p className="dp-desc">{movie.description}</p></div>)}


           {!isFullScreen && movie?.seasons?.length > 0 && (
        <EpisodesRow 
          movie={movie} 
          activeEpId={epId} 
onSelect={(ep)=> router.push(`${pathname}?t=full&ep=${ep.id}`)}
        />
      )}


      <SimilarMovies current={movie} />
    </div>

    {isMobile && (
  <style>{`
    @media (max-width: 768px){
      header, .top-bar, .topbar, .dashboard-header { display:none !important; }
    }
  `}</style>
)}

    </SinglePlayerProvider>
  )
}
