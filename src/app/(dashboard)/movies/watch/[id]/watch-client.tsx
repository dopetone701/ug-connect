"use client";

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation"
import "../../movies.css"
import "./connect-player.css"
import "./mobile-preview.css"
import MobilePreview from "./mobile-preview"
import SimilarMovies from "./similar-movies"
import EpisodesRow from "./episodes-row"

// CLEAN IMPORTS - CORRECT NAMES
import PlayerOverlay from "../../_components/vid-actions/player-overlay"
import VideoMetaInfo from "../../_components/vid-meta-info/video-meta-info"
import UnderVideoStaBtns from "../../_components/under-vid-btns/under-video-sta-btns"

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies"

export default function WatchPage({ isOverlay = false }: { isOverlay?: boolean }) {
  const params = useParams()
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const type = search.get("t") || "full"
  const isPreview = type === "preview"

const [movie, setMovie] = useState<any>(() => {
  if (typeof window === "undefined") return null

  try {
    const cached = sessionStorage.getItem(
      `movie_preload_${params.id}`
    )

    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
})
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
  const [descExpanded, setDescExpanded] = useState(false)

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

  useEffect(() => {

  let cancelled = false

  fetch(API_URL, { cache: "no-store" })
    .then(r => r.json())
    .then(d => {

      if (cancelled) return

      setAllMovies(d)

      const found = d.find(
        (m: any) => String(m.id) === String(params.id)
      )

      if (found) {
        setMovie(found)

        try {
          sessionStorage.setItem(
            `movie_preload_${params.id}`,
            JSON.stringify(found)
          )
        } catch {}
      }

      const idx = d.findIndex(
        (m: any) => String(m.id) === String(params.id)
      )

      if (idx >= 0) {
        setReelIndex(idx)
      }
    })
    .catch(() => {})

  return () => {
    cancelled = true
  }

}, [params.id])


  useEffect(()=>{
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return ()=> window.removeEventListener('resize', check)
  },[])

   // KILL UNDERLYING GRID INSTANTLY - NO PANEL FLASH BEFORE SLIDE
  useEffect(()=>{
    if(!isOverlay) return
    const bg = document.querySelector('.movies-shell >.film-root:not(.yt-overlay-root)') as HTMLElement | null
    if(bg){
      bg.style.setProperty('display','none','important')
      bg.style.setProperty('visibility','hidden','important')
    }
    return ()=>{
      if(bg){
        bg.style.removeProperty('display')
        bg.style.removeProperty('visibility')
      }
    }
  },[isOverlay])


  useEffect(() => {
  if (!movie) return

  setMounted(true)

  const onFs = () => {
    const fs =
      !!document.fullscreenElement ||
      !!(document as any).webkitFullscreenElement

    setIsFullScreen(
      fs ||
      (
        window.innerWidth <= 768 &&
        document.body.style.overflow === 'hidden' &&
        isFullScreen
      )
    )

    if (!fs && window.innerWidth > 768) {
      setIsFullScreen(false)
    }
  }

  document.addEventListener("fullscreenchange", onFs)
  document.addEventListener(
    "webkitfullscreenchange",
    onFs as any
  )

  return () => {
    document.removeEventListener("fullscreenchange", onFs)
    document.removeEventListener(
      "webkitfullscreenchange",
      onFs as any
    )
  }

}, [movie, isFullScreen])


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
    if(!videoUrl ||!videoRef.current) return
    if(!activeEp) return
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
    }, 0)
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

if(!movie) return <div className={`film-root connect-root ${isOverlay ? 'yt-overlay-root' : ''}`} style={{background:"hsl(var(--bg))"}}><div className="film-giant inner-body" style={{display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",color:"hsl(var(--text))"}} /></div>

   if(!movie) {
    return <div ref={rootRef} className={`film-root connect-root ${isOverlay ? 'yt-overlay-root' : ''} ${isMobile? 'is-mobile-layout' : 'is-desktop-layout'}`} style={{background:"hsl(var(--bg))", minHeight:"100dvh"}} />
  }

  return (
    <>
      <div ref={rootRef} className={`film-root connect-root ${isOverlay ? 'yt-overlay-root' : ''} ${isFullScreen? 'is-shell-full' : ''} ${mounted? 'is-mounted' : 'is-entering'} ${isMobile? 'is-mobile-layout' : 'is-desktop-layout'}`}>

        <div className="film-giant connect-player inner-body" onMouseMove={()=> setShowControls(true)} onMouseLeave={()=> playing && setShowControls(false)} onTouchStart={()=> setShowControls(true)}>
          <div className="film-center">
            <div className="center-cover">
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
              <PlayerOverlay
                movie={movie}
                showControls={showControls}
                isLoading={isLoading}
                playing={playing}
                progress={progress}
                bufferedProgress={bufferedProgress}
                currentTime={currentTime}
                duration={duration}
                isFullScreen={isFullScreen}
                formatTime={formatTime}
                onSeek={(x: number, r: DOMRect) => seekTo(x, r)}
                onTogglePlay={togglePlay}
                onToggleFullscreen={toggleFullscreen}
                onBack={() => {
                  if(isOverlay) router.back()
                  else router.push("/movies")
                }}
              />
            </div>
          </div>
        </div>

        <div className="connect-under-section" style={{ display: isFullScreen? 'none' : 'flex' }}>
          <UnderVideoStaBtns movie={movie} paramsId={String(params.id)} isPreview={isPreview} />
          <VideoMetaInfo movie={movie} descExpanded={descExpanded} setDescExpanded={setDescExpanded} />
        </div>

        {detailsOpen && (
          <div className="details-panel under-player">
            <div className="dp-head"><h2>{movie.title}</h2><button className="dp-close" onClick={()=> setDetailsOpen(false)}>✕</button></div>
            <div className="dp-meta"><span className="c-pill">{movie.genre}</span><span className="c-pill muted">{movie.vj}</span><span className="c-pill muted">{movie.year || "2024"}</span></div>
            <p className="dp-desc">{movie.description}</p>
          </div>
        )}

        {!isFullScreen && movie?.seasons?.length > 0 && (
          <EpisodesRow movie={movie} activeEpId={epId} onSelect={(ep)=> router.push(`${pathname}?t=full&ep=${ep.id}`)} />
        )}

        <SimilarMovies current={movie} />
      </div>

      {isMobile && (
        <style>{`
          @media (max-width: 768px){
            header,.top-bar,.topbar,.dashboard-header { display:none!important; }
          }
        `}</style>
      )}
    </>
  )
}
