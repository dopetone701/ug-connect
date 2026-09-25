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

import { useWatchDrawer } from "@/stores/use-watch-drawer"
import { useReelsDrawer } from "@/stores/use-reels-drawer"

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies"

export default function WatchPage({
  isOverlay = false,
  id: propId,
  onClose,
  onExpand,
  isMini = false,
  isFullscreen: externalFs,
  onFsChange,
}: any) {
  const params = useParams()
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const effectiveId = propId || (params.id as string)
  const storeType = useWatchDrawer((s) => s.playType)
  const { closeDrawer, openDrawer } = useWatchDrawer() as any
  const { openReels, closeReels } = useReelsDrawer() as any

  const type = search.get("t") || storeType || "full"
  const isPreview = type === "preview"

  const [movie, setMovie] = useState<any>(() => {
    if (typeof window === "undefined") return null
    try {
      const cached = sessionStorage.getItem(`movie_preload_${effectiveId}`)
      return cached? JSON.parse(cached) : null
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
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [quality, setQuality] = useState("auto")
  const [bufferedProgress, setBufferedProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [descExpanded, setDescExpanded] = useState(false)
  const maximize = useWatchDrawer((s) => s.maximize)

  useEffect(() => { if (externalFs!== undefined) setIsFullScreen(externalFs) }, [externalFs])

  const [overlayEpId, setOverlayEpId] = useState<string | null>(() => {
    try {
      const cached = typeof window!== "undefined"? sessionStorage.getItem(`movie_preload_${effectiveId}`) : null
      const parsed = cached? JSON.parse(cached) : null
      return parsed?.ep || null
    } catch { return null }
  })

  // === FIXED HANDOFF: PREVIEW -> REELS ONLY, FULL -> WATCH ONLY ===
  useEffect(() => {
    if (isOverlay) return
    const onResize = () => {
      if (window.innerWidth > 768) return
      if (!effectiveId ||!movie) return

      try {
        if (videoRef.current) {
          sessionStorage.setItem(`continue_${effectiveId}`, JSON.stringify({
            time: videoRef.current.currentTime,
            playing:!videoRef.current.paused,
            type: isPreview? "preview" : "full",
          }))
        }
      } catch {}

      if (isPreview) {
        // SAME PREVIEW, NO WATCH DRAWER
        closeDrawer?.()
        const p = movie?.preview_urls?.[0] || movie?.preview_url || movie?.trailer_url || movie?.video_preview_url || movie?.preview
        const single = [{
       ...movie,
          id: String(movie.id),
          cover: movie.cover || movie.cover_url,
          cover_url: movie.cover || movie.cover_url,
          video: movie.video || movie.video_url,
          video_url: movie.video || movie.video_url,
          preview_url: p,
          preview_urls: movie.preview_urls || (p? [p] : []),
          trailer_url: movie.trailer_url || p,
        }]
        openReels(single, 0)
        router.replace("/movies")
      } else {
        // FULL MOVIE
        closeReels?.()
        openDrawer(effectiveId, "full")
        router.replace("/movies")
      }
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [effectiveId, isPreview, isOverlay, movie, openDrawer, openReels, closeDrawer, closeReels, router])

  const skip = useCallback((sec: number) => {
    if(!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + sec))
  }, [duration])

  const updateBufferedProgress = useCallback(() => {
    const video = videoRef.current
    if (!video ||!video.duration ||!video.buffered.length) return
    let bufferedEnd = 0
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.currentTime >= video.buffered.start(i) && video.currentTime <= video.buffered.end(i)) { bufferedEnd = video.buffered.end(i); break }
    }
    if (!bufferedEnd) bufferedEnd = video.buffered.end(video.buffered.length - 1)
    setBufferedProgress(Math.min(100, (bufferedEnd / video.duration) * 100))
  }, [])

  const seekTo = useCallback((clientX: number, rect: DOMRect) => {
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    if (videoRef.current && duration) {
      videoRef.current.currentTime = pct * duration
      setProgress(pct * 100)
    }
  }, [duration])

  const togglePlay = useCallback(() => {
    if(!videoRef.current) return
    if(videoRef.current.paused){
      videoRef.current.muted = false
      videoRef.current.play().then(()=>{ setPlaying(true); setHasStarted(true)}).catch(()=>{})
    }else{ videoRef.current.pause(); setPlaying(false) }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const video = videoRef.current as any; const root = rootRef.current as any
    if (!video ||!root) return
    if (!isFullScreen) {
      setIsFullScreen(true); onFsChange?.(true); document.body.style.overflow = 'hidden'
      try { if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); else if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: "hide" }) } catch {}
    } else {
      setIsFullScreen(false); onFsChange?.(false); document.body.style.overflow = ''
      try { if (document.fullscreenElement) await document.exitFullscreen() } catch {}
    }
  }, [isFullScreen, onFsChange])

  const formatTime = useCallback((sec: number) => {
    if(!sec || isNaN(sec)) return "0:00"
    const h = Math.floor(sec / 3600); const m = Math.floor((sec % 3600) / 60); const s = Math.floor(sec % 60)
    if(h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    return `${m}:${String(s).padStart(2,'0')}`
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(API_URL, { cache: "no-store" }).then(r=>r.json()).then(d=>{
      if(cancelled) return; setAllMovies(d)
      const found = d.find((m:any)=>String(m.id)===String(effectiveId))
      if(found){ setMovie(found); try{ sessionStorage.setItem(`movie_preload_${effectiveId}`, JSON.stringify(found)) }catch{} }
    }).catch(()=>{})
    return ()=>{ cancelled = true }
  }, [effectiveId])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check(); window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if(!movie) return; setMounted(true)
    const onFs = () => { const fs =!!document.fullscreenElement ||!!(document as any).webkitFullscreenElement; setIsFullScreen(fs) }
    document.addEventListener("fullscreenchange", onFs)
    return () => document.removeEventListener("fullscreenchange", onFs)
  }, [movie])

  useEffect(()=>{ if(!playing) return; const t=setTimeout(()=>setShowControls(false),3200); return()=>clearTimeout(t) },[playing, showControls])

  const searchEpId = search.get("ep") || search.get("e")
  const epId = isOverlay? overlayEpId || searchEpId : searchEpId
  const allEps = movie?.seasons?.flatMap((s:any)=>s.episodes||[]) || []
  const activeEp = epId? allEps.find((ep:any)=> String(ep.id)===String(epId)) : null
  const epUrl = activeEp?.video_url || activeEp?.url
  const previewUrl = movie?.preview_urls?.[0] || (movie as any)?.preview_url || (movie as any)?.trailer_url || (movie as any)?.preview || (movie as any)?.video_preview_url

  const rawSources = movie? isPreview
   ? [{ label:"Preview", value:"preview", url: previewUrl || movie.video_url }]
   : [
       { label:"Auto", value:"auto", url: epUrl || movie.video_url },
       { label:"4K", value:"2160", url: movie.video_url_4k || movie.qualities?.["2160"] },
       { label:"1080p", value:"1080", url: movie.video_url_1080 || movie.qualities?.["1080"] },
       { label:"720p", value:"720", url: movie.video_url_720 || movie.qualities?.["720"] },
     ].filter(q=>!!q.url) : []

  const normalize = (x:any) => {
    const preview = x?.preview_urls?.[0] || x?.preview_url || x?.trailer_url || x?.video_preview_url || x?.preview
    return {...x, id:String(x.id), preview_url:preview, preview_urls:x.preview_urls || (preview?[preview]:[]), trailer_url:x.trailer_url || preview}
  }

  const handlePreviewReels = () => {
    const rawList = allMovies && allMovies.length? allMovies : [movie]
    const list = rawList.map(normalize)
    const idx = rawList.findIndex((m:any)=> String(m.id)===String(effectiveId))
    if(isOverlay) closeDrawer?.()
    setTimeout(()=> openReels(list, idx>=0? idx:0), isOverlay?150:0)
  }

  const qualitySources = rawSources.filter((v,i,a)=> a.findIndex(x=>x.url===v.url)===i)
  const currentQualityObj = qualitySources.find(q=>q.value===quality) || qualitySources[0]
  const videoUrl = currentQualityObj?.url

  useEffect(()=>{
    if(!videoUrl ||!videoRef.current) return
    setIsLoading(true)
    if(autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
    autoPlayTimerRef.current = setTimeout(async ()=>{
      const v = videoRef.current; if(!v) return
      try{
        let savedTime=0; let wasPlaying=false
        try{
          const saved = sessionStorage.getItem(`continue_${effectiveId}`)
          if(saved){ const parsed=JSON.parse(saved); const sameType=!parsed?.type || parsed.type===type; if(sameType){ savedTime=parsed.time||0; wasPlaying=!!parsed.playing; if(savedTime>1) v.currentTime=savedTime } }
        }catch{}
        if(!savedTime && lastTimeRef.current) v.currentTime=lastTimeRef.current
        v.muted = wasPlaying? false : true; v.volume=volume; await v.play(); setPlaying(true); setHasStarted(true); setIsLoading(false)
        if(v.muted){ setTimeout(()=>{ if(v){ v.muted=false; v.volume=volume } },400) }
      }catch{ setIsLoading(false) }
    },0)
    return ()=> clearTimeout(autoPlayTimerRef.current)
  },[videoUrl, activeEp?.id, effectiveId, volume, type])

  if(!movie) return <div className={`film-root connect-root ${isOverlay?'yt-overlay-root':''}`} style={{background:"hsl(var(--bg))", minHeight:"60vh"}}><div className="film-giant inner-body" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>Loading...</div></div>

  return (
    <>
      <div ref={rootRef} className={`film-root connect-root ${isOverlay?'yt-overlay-root':''} ${isFullScreen?'is-shell-full':''} ${isMobile?'is-mobile-layout':'is-desktop-layout'}`}>
        <div className="film-giant connect-player inner-body" onMouseMove={()=>setShowControls(true)} onMouseLeave={()=>playing && setShowControls(false)} onTouchStart={()=>setShowControls(true)}>
          <div className="film-center"><div className="center-cover">
            <video
              key={`${movie.id}-${quality}-${activeEp?.id || 'default'}`}
              ref={videoRef} src={videoUrl} className="connect-video"
              onLoadStart={()=>setIsLoading(true)} onWaiting={()=>setIsLoading(true)} onCanPlay={()=>setIsLoading(false)}
              onPlaying={()=>{ setIsLoading(false); setPlaying(true); setHasStarted(true) }}
              onPause={()=>setPlaying(false)}
              onTimeUpdate={(e)=>{
                const v=e.currentTarget; setCurrentTime(v.currentTime); lastTimeRef.current=v.currentTime
                if(v.duration){ setProgress((v.currentTime/v.duration)*100); setDuration(v.duration) }
                updateBufferedProgress()
                try{ sessionStorage.setItem(`continue_${effectiveId}`, JSON.stringify({ time:v.currentTime, playing:!v.paused, type:isPreview?"preview":"full" })) }catch{}
              }}
              onProgress={updateBufferedProgress}
              onLoadedMetadata={(e)=>{
                const vid=e.target as HTMLVideoElement; setDuration(vid.duration)
                try{
                  const saved=sessionStorage.getItem(`continue_${effectiveId}`)
                  if(saved){ const parsed=JSON.parse(saved); const sameType=!parsed?.type || parsed.type===type; const time=parsed?.time; if(sameType && time && time>1 && time<vid.duration-1){ vid.currentTime=time; lastTimeRef.current=time; return } }
                }catch{}
                if(lastTimeRef.current) vid.currentTime=lastTimeRef.current
              }}
              onClick={togglePlay} playsInline loop={isPreview} preload="auto" muted
            />
            <PlayerOverlay movie={movie} showControls={showControls} isLoading={isLoading} playing={playing} progress={progress} bufferedProgress={bufferedProgress} currentTime={currentTime} duration={duration} isFullScreen={isFullScreen} formatTime={formatTime} onSeek={(x: number, r: DOMRect)=>seekTo(x, r)} onTogglePlay={togglePlay} onToggleFullscreen={toggleFullscreen} onBack={()=>{ if(isOverlay){ if(onClose) onClose(); else closeDrawer() }else{ router.push("/movies") } }} isMini={isMini} onClose={onClose} onExpand={maximize} />
          </div></div>
        </div>

        {!isMini && (
          <div className="connect-under-section" style={{display:isFullScreen?'none':'flex'}}>
            <UnderVideoStaBtns movie={movie} paramsId={String(effectiveId)} isPreview={isPreview} onPreview={handlePreviewReels} />
            <VideoMetaInfo movie={movie} descExpanded={descExpanded} setDescExpanded={setDescExpanded} />
          </div>
        )}
        {!isMini &&!isFullScreen && movie?.seasons?.length>0 && (
          <EpisodesRow movie={movie} activeEpId={epId} onSelect={(ep:any)=>{ if(isOverlay){ setOverlayEpId(String(ep.id)) }else{ router.push(`${pathname}?t=full&ep=${ep.id}`) } }} />
        )}
        {!isMini && <SimilarMovies current={movie} />}
      </div>
    </>
  )
}
