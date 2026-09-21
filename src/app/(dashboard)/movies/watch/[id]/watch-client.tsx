"use client";

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation"
import "../../movies.css"
import "./connect-player.css"
import "./mobile-preview.css"
import SimilarMovies from "./similar-movies"
import EpisodesRow from "./episodes-row"

import PlayerOverlay from "../../_components/vid-actions/player-overlay"
import VideoMetaInfo from "../../_components/vid-meta-info/video-meta-info"
import UnderVideoStaBtns from "../../_components/under-vid-btns/under-video-sta-btns"
import { useWatchDrawer } from "@/stores/use-watch-drawer";


const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies"

export default function WatchPage({ isOverlay = false, id: propId, onClose, isMini = false }: { isOverlay?: boolean, id?: string, onClose?: () => void, isMini?: boolean }) {
  const params = useParams()
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const effectiveId = propId || (params.id as string)

   const storeType = useWatchDrawer((s) => s.playType);
  const type = search.get("t") || storeType || "full"
  const isPreview = type === "preview"

  const [movie, setMovie] = useState<any>(() => {
    if (typeof window === "undefined") return null
    try {
      const cached = sessionStorage.getItem(`movie_preload_${effectiveId}`)
      return cached ? JSON.parse(cached) : null
    } catch { return null }
  })
  const [allMovies, setAllMovies] = useState<any[]>([])
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
      try {
        if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        else if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: "hide" });
      } catch {}
    } else {
      setIsFullScreen(false);
      document.body.style.overflow = '';
      try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
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
        const found = d.find((m: any) => String(m.id) === String(effectiveId))
        if (found) {
          setMovie(found)
          try { sessionStorage.setItem(`movie_preload_${effectiveId}`, JSON.stringify(found)) } catch {}
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [effectiveId])

  useEffect(()=>{
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return ()=> window.removeEventListener('resize', check)
  },[])

  useEffect(() => {
    if (!movie) return
    setMounted(true)
    const onFs = () => {
      const fs = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement
      setIsFullScreen(fs)
    }
    document.addEventListener("fullscreenchange", onFs)
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [movie])

  useEffect(()=>{
    if(!playing) return
    const t = setTimeout(()=> setShowControls(false), 3200)
    return ()=> clearTimeout(t)
  },[playing, showControls])

  const epId = search.get("ep") || search.get("e")
  const allEps = movie?.seasons?.flatMap((s:any)=>s.episodes||[]) || []
  const activeEp = epId? allEps.find((ep:any)=> String(ep.id)===String(epId)) : null
  const epUrl = activeEp?.video_url || activeEp?.url

  const rawSources = movie? [
    { label: "Auto", value: "auto", url: epUrl || (isPreview? movie.preview_urls?.[0] : movie.video_url) },
    { label: "4K", value: "2160", url: movie.video_url_4k || movie.qualities?.["2160"] },
    { label: "1080p", value: "1080", url: movie.video_url_1080 || movie.qualities?.["1080"] },
    { label: "720p", value: "720", url: movie.video_url_720 || movie.qualities?.["720"] },
  ].filter(q=>!!q.url) : []

  const qualitySources = rawSources.filter((v,i,a)=> a.findIndex(x=>x.url===v.url)===i)
  const currentQualityObj = qualitySources.find(q=>q.value===quality) || qualitySources[0]
  const videoUrl = currentQualityObj?.url

  useEffect(()=>{
    if(!videoUrl ||!videoRef.current) return
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
      } catch { setIsLoading(false) }
    }, 0)
    return ()=> clearTimeout(autoPlayTimerRef.current)
  }, [videoUrl, activeEp?.id])

  if(!movie) return <div className={`film-root connect-root ${isOverlay ? 'yt-overlay-root' : ''}`} style={{background:"hsl(var(--bg))", minHeight:"60vh"}}><div className="film-giant inner-body" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>Loading...</div></div>

  return (
    <>
      <div ref={rootRef} className={`film-root connect-root ${isOverlay ? 'yt-overlay-root' : ''} ${isFullScreen? 'is-shell-full' : ''} ${isMobile? 'is-mobile-layout' : 'is-desktop-layout'}`}>
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
                }}
                onClick={togglePlay}
                playsInline
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
                  if(isOverlay && onClose) onClose()
                  else if(isOverlay) router.back()
                  else router.push("/movies")
                }}
              />
            </div>
          </div>
        </div>

               {!isMini && (
          <div className="connect-under-section" style={{ display: isFullScreen? 'none' : 'flex' }}>
            <UnderVideoStaBtns movie={movie} paramsId={String(effectiveId)} isPreview={isPreview} />
            <VideoMetaInfo movie={movie} descExpanded={descExpanded} setDescExpanded={setDescExpanded} />
          </div>
        )}

        {!isMini && !isFullScreen && movie?.seasons?.length > 0 && (
          <EpisodesRow movie={movie} activeEpId={epId} onSelect={(ep)=> router.push(`${pathname}?t=full&ep=${ep.id}`)} />
        )}
        {!isMini && <SimilarMovies current={movie} />}

      </div>
    </>
  )
}
