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
import FooterFree from "@/components/layout/curvy-pro-room/get-started-email/footer/footer"
import { useVideoSettingsDrawer } from "@/stores/use-video-settings-drawer";
import { useMiniPlayerFloating } from "../../_components/vid-actions/mini-player-floating-logic";
import { useMovieStore } from "@/stores/use-movie-store";

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies"

function detectMobileDevice() {
  if (typeof window === "undefined") return true;
  const ua = navigator.userAgent || "";
  const isPhoneUA = /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua);
  const isTouchDevice = navigator.maxTouchPoints > 0;
  if (isPhoneUA) return true;
  if (isTouchDevice && window.innerWidth <= 1024) return true;
  return false;
}

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
  const floating = useMiniPlayerFloating(rootRef, isMini);

  const lastTimeRef = useRef(0)
  const autoPlayTimerRef = useRef<any>(null)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactingRef = useRef(false);

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
  const [videoFit, setVideoFit] = useState<'contain'|'cover'>('contain')
  const [zoomScale, setZoomScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [bufferedProgress, setBufferedProgress] = useState(0)

  // --- PRO ZOOM REFS (no re-render lag) ---
  const zoomRef = useRef({ scale: 1, x: 0, y: 0, startDist: 0, startScale: 1, startX: 0, startY: 0, lastTouchX: 0, lastTouchY: 0, lastTap: 0 })

  const [isMobile, setIsMobile] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const isZoomable = isMobile && isFullScreen && !isMini

  // reset when exit fullscreen
  useEffect(() => {
    if (!isFullScreen) {
      setZoomScale(1)
      setPan({ x: 0, y: 0 })
      zoomRef.current.scale = 1
      zoomRef.current.x = 0
      zoomRef.current.y = 0
      zoomRef.current.startDist = 0
      setVideoFit('contain')
    }
  }, [isFullScreen])

  const [descExpanded, setDescExpanded] = useState(false)
  const maximize = useWatchDrawer((s) => s.maximize)
  const drawerState = useWatchDrawer() as any
  const settingsOpen = useVideoSettingsDrawer((s) => s.isOpen);
  const closeVideoSettings = useVideoSettingsDrawer((s) => s.close);

  useEffect(() => { if (externalFs!== undefined) setIsFullScreen(externalFs) }, [externalFs])

  const [overlayEpId, setOverlayEpId] = useState<string | null>(() => {
    try {
      const cached = typeof window!== "undefined"? sessionStorage.getItem(`movie_preload_${effectiveId}`) : null
      const parsed = cached? JSON.parse(cached) : null
      return parsed?.ep || null
    } catch { return null }
  })

const handleBack = useCallback(() => {
  // MINI PLAYER X = CLOSE MINI
  if (isMini) {
    try {
      const v = videoRef.current;
      if (v) { v.pause(); }
    } catch {}
    if (onClose) { onClose(); }
    else { closeDrawer?.(); }
    return;
  }

  if (isFullScreen) return;
  const store = useWatchDrawer.getState();

  if (isMobile && isOverlay) {
    const video = videoRef.current;
    const wasPlaying = video ? !video.paused : playing;
    const savedTime = video?.currentTime ?? currentTime;
    store.minimize();
    requestAnimationFrame(() => {
      const currentVideo = videoRef.current;
      if (currentVideo && wasPlaying && currentVideo.paused) {
        if (Number.isFinite(savedTime)) {
          try { currentVideo.currentTime = savedTime; } catch {}
        }
        currentVideo.play().catch(() => {});
      }
    });
    return;
  }

  if (isMobile) {
    const video = videoRef.current;
       try {
      if (video && effectiveId) {
        const t = video.currentTime
        const d = video.duration || 0
        const pct = d ? (t / d) * 100 : 0
        // per-user true progress
        if (t > 2 && d > 5) {
          try { useMovieStore.getState().saveProgress(effectiveId, t, d) } catch {}
        }
        sessionStorage.setItem(`continue_${effectiveId}`, JSON.stringify({
          time: t, duration: d, percent: pct, playing: !video.paused, type: isPreview ? "preview" : "full",
        }))
      }
    } catch {}

    if (effectiveId) {
      store.openDrawer(String(effectiveId), isPreview ? "preview" : "full");
      store.minimize();
    }
    router.replace("/movies");
    return;
  }

  if (isOverlay) {
    if (onClose) { onClose(); } else { closeDrawer(); }
  } else {
    router.push("/movies");
  }
}, [isFullScreen, isMobile, isOverlay, isMini, playing, currentTime, effectiveId, isPreview, onClose, closeDrawer, router]);

  useEffect(() => {
    if (isOverlay) return
    let lastWidth = typeof window !== "undefined" ? window.innerWidth : 768
    let timeout: any = null
    const onResize = () => {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement || isFullScreen) return
      if (rootRef.current === document.fullscreenElement) return
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        const curWidth = window.innerWidth
        const crossedToMobile = lastWidth > 768 && curWidth <= 768
        lastWidth = curWidth
        if (!crossedToMobile) return
        if (!effectiveId ||!movie) return
        try {
          if (videoRef.current) {
            sessionStorage.setItem(`continue_${effectiveId}`, JSON.stringify({
              time: videoRef.current.currentTime, playing:!videoRef.current.paused, type: isPreview? "preview" : "full",
            }))
          }
        } catch {}
        if (isPreview) {
          closeDrawer?.()
          const p = movie?.preview_urls?.[0] || movie?.preview_url || movie?.trailer_url || movie?.video_preview_url || movie?.preview
          const single = [{...movie, id: String(movie.id), cover: movie.cover || movie.cover_url, cover_url: movie.cover || movie.cover_url, video: movie.video || movie.video_url, video_url: movie.video || movie.video_url, preview_url: p, preview_urls: movie.preview_urls || (p? [p] : []), trailer_url: movie.trailer_url || p, }]
          openReels(single, 0)
          router.replace("/movies")
        } else {
          closeReels?.()
          openDrawer(effectiveId, "full")
          router.replace("/movies")
        }
      }, 200)
    }
    window.addEventListener("resize", onResize)
    return () => { window.removeEventListener("resize", onResize); clearTimeout(timeout) }
  }, [effectiveId, isPreview, isOverlay, movie, isFullScreen, openDrawer, openReels, closeDrawer, closeReels, router])

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

// handleFilmClick moved below to fix TDZ

const toggleFullscreen = useCallback(async () => {
  const video = videoRef.current as any
  const root = rootRef.current as any
  if (!video || !root) return

  const savedTime = video.currentTime
  const wasPlaying = !video.paused

  // Detect environment
  const isNative = (window as any).Capacitor?.isNativePlatform?.() ? (window as any).Capacitor.isNativePlatform() : false
  const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
  const isAndroid = /Android/i.test(navigator.userAgent)
  const shouldUseConnectPlayer = isNative || isStandalonePWA || isAndroid

  let CapOrientation: any = null
  if (isNative) {
    try {
      const mod = await import('@capacitor/screen-orientation');
      CapOrientation = mod.ScreenOrientation
    } catch {}
  }

  try {
    if (!isFullScreen) {
      if (!shouldUseConnectPlayer) {
        // BROWSER ONLY: native player
        if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen()
        } else if (video.requestFullscreen) {
          await video.requestFullscreen()
        } else if (root.requestFullscreen) {
          await root.requestFullscreen({ navigationUI: "hide" } as any)
        }
      } else {
        // PWA / ANDROID / APP: connect player fullscreen
        try { if (isNative) await CapOrientation?.unlock?.() } catch {}
        try { await (screen.orientation as any)?.unlock?.() } catch {}
        try {
          if (root.requestFullscreen) {
            await root.requestFullscreen({ navigationUI: "hide" } as any)
          } else if ((root as any).webkitRequestFullscreen) {
            await (root as any).webkitRequestFullscreen()
          }
        } catch {}
        try { if (isNative) await CapOrientation?.lock?.({ orientation: 'landscape' }) } catch {}
        try { if (screen.orientation && (screen.orientation as any).lock) { await (screen.orientation as any).lock('landscape') } } catch {}
      }
      setIsFullScreen(true)
      onFsChange?.(true)
      document.documentElement.classList.add('is-fullscreen-active')
      document.body.style.overflow = 'hidden'
      if (Math.abs(video.currentTime - savedTime) > 0.5) video.currentTime = savedTime
      if (wasPlaying) video.play().catch(()=>{})
    } else {
      try { if (document.fullscreenElement) await document.exitFullscreen() } catch {}
      try { if ((document as any).webkitFullscreenElement) await (document as any).webkitExitFullscreen?.() } catch {}
      try { if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen?.() } catch {}
      setIsFullScreen(false)
      onFsChange?.(false)
      document.documentElement.classList.remove('is-fullscreen-active')
      document.body.style.overflow = ''
      try { if (isNative) await CapOrientation?.lock?.({ orientation: 'portrait' }) } catch {}
      try { if (screen.orientation && (screen.orientation as any).lock) { await (screen.orientation as any).lock('portrait') } } catch {}
    }
  } catch {
    setIsFullScreen(v=>!v)
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
    const check = () => setIsMobile(detectMobileDevice())
    check(); window.addEventListener("resize", check); window.addEventListener("orientationchange", check)
    return () => { window.removeEventListener("resize", check); window.removeEventListener("orientationchange", check) }
  }, [])

  useEffect(() => {
    if(!movie) return; setMounted(true)
    const onFs = () => {
      const fs =!!document.fullscreenElement ||!!(document as any).webkitFullscreenElement;
      setIsFullScreen(fs); if(!fs) document.body.style.overflow = ''
      if (!fs) document.documentElement.classList.remove('is-fullscreen-active')
    }
    document.addEventListener("fullscreenchange", onFs); document.addEventListener("webkitfullscreenchange", onFs as any)
    return () => { document.removeEventListener("fullscreenchange", onFs); document.removeEventListener("webkitfullscreenchange", onFs as any) }
  }, [movie])

const cancelControlsTimer = useCallback(() => {
  if (controlsTimerRef.current) { clearTimeout(controlsTimerRef.current); controlsTimerRef.current = null; }
}, []);

const scheduleControlsHide = useCallback(() => {
  cancelControlsTimer();
  if (!playing || interactingRef.current) return;
  controlsTimerRef.current = setTimeout(() => {
    if (!interactingRef.current) { setShowControls(false); }
    controlsTimerRef.current = null;
  }, 3200);
}, [playing, cancelControlsTimer]);

const keepControlsVisible = useCallback(() => { setShowControls(true); cancelControlsTimer(); }, [cancelControlsTimer]);
const startControlsInteraction = useCallback(() => { interactingRef.current = true; setShowControls(true); cancelControlsTimer(); }, [cancelControlsTimer]);
const endControlsInteraction = useCallback(() => { interactingRef.current = false; scheduleControlsHide(); }, [scheduleControlsHide]);

const handleFilmClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
  const t = e.target as HTMLElement;

  // PRO: in fullscreen mobile, don't toggle controls on double-tap or when zoomed
  if (isZoomable) {
    const now = Date.now()
    if (now - zoomRef.current.lastTap < 350) {
      return
    }
    if (zoomRef.current.scale > 1.1) {
      return
    }
  }

  // if tap is on a control button/progress - just keep visible and reset timer
  const isControl = !!t.closest('button, .cc-icon, .apple-full, .center-skip-btn, .play-apple, .starz-progress, .quality-settings, [data-control], .bubble-expand, .bubble-close, .back-btn-timeout, [data-no-drag]');
  if (isControl) {
    setShowControls(true);
    scheduleControlsHide();
    return;
  }
  // tap anywhere else on video - toggle
  if (!showControls) {
    setShowControls(true);
    scheduleControlsHide();
  } else {
    setShowControls(false);
    cancelControlsTimer();
  }
}, [showControls, scheduleControlsHide, cancelControlsTimer, isZoomable]);

useEffect(() => { scheduleControlsHide(); return () => { cancelControlsTimer(); }; }, [scheduleControlsHide, cancelControlsTimer]);
useEffect(() => { return () => { interactingRef.current = false; cancelControlsTimer(); }; }, [cancelControlsTimer]);

// NEW: Hide overlays instantly when user interacts outside video
useEffect(() => {
  if (!showControls) return;
  const hideNow = () => {
    setShowControls(false);
    cancelControlsTimer();
  };
  const handleOutsidePointer = (e: Event) => {
    const target = e.target as HTMLElement;
    // if click is inside video player, let handleFilmClick handle it
    const insideVideo = target.closest('.film-giant, .connect-player, .center-cover, .center-controls-layer, .connect-controls, .center-top, .back-btn-timeout, .connect-loader');
    if (insideVideo) return;
    // if click is on under-video area, episodes, similar, footer, etc -> hide instantly
    const outsideArea = target.closest('.connect-under-section, .episodes-row, .similar-movies, .film-meta, footer, .footer-free');
    if (outsideArea || !insideVideo) {
      hideNow();
    }
  };
  const handleScroll = () => {
    // hide on any scroll outside video
    if (window.scrollY > 10) hideNow();
  };
  const handleKeyOutside = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return;
    const target = e.target as HTMLElement;
    if (!target.closest('.film-giant')) hideNow();
  };

  window.addEventListener('pointerdown', handleOutsidePointer, { capture: true } as any);
  window.addEventListener('touchstart', handleOutsidePointer, { capture: true } as any);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('wheel', handleScroll, { passive: true } as any);

  return () => {
    window.removeEventListener('pointerdown', handleOutsidePointer, { capture: true } as any);
    window.removeEventListener('touchstart', handleOutsidePointer, { capture: true } as any);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('wheel', handleScroll as any);
  };
}, [showControls, cancelControlsTimer]);

  const searchEpId = search.get("ep") || search.get("e")
  const epId = isOverlay? overlayEpId || searchEpId : searchEpId
  const allEps = movie?.seasons?.flatMap((s:any)=>s.episodes||[]) || []
  const activeEp = epId? allEps.find((ep:any)=> String(ep.id)===String(epId)) : null
  const epUrl = activeEp?.video_url || activeEp?.url

const isSeries = (movie?.seasons?.length > 0 && allEps.length > 1) || false
const currentEpisodeIndex = epId ? allEps.findIndex((ep:any)=> String(ep.id)===String(epId)) : 0
const [autoPlayOn, setAutoPlayOn] = useState(true)

const goToEp = (ep:any) => { if(isOverlay){ setOverlayEpId(String(ep.id)) } else{ router.push(`${pathname}?t=full&ep=${ep.id}`) } }

const handleEnded = () => {
  try{
    const v = videoRef.current
    if(v && v.duration > 5){
      useMovieStore.getState().saveProgress(effectiveId, v.duration, v.duration) // 100% for replay icon
    }
  }catch{}
  if (!autoPlayOn) return; if (!isSeries) return;
  const next = allEps[currentEpisodeIndex + 1]; if (next) goToEp(next);
};


const onNextEpisode = () => { const next = allEps[currentEpisodeIndex + 1]; if(next) goToEp(next) }
const onPrevEpisode = () => { const prev = allEps[currentEpisodeIndex - 1]; if(prev) goToEp(prev) }

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

  const setSharedQualityOptions = useVideoSettingsDrawer((s) => s.setQualityOptions);
  const setSharedQualityHandler = useVideoSettingsDrawer((s) => s.setQualityHandler);
  const setSharedSelectedQuality = useVideoSettingsDrawer((s) => s.setSelectedQuality);

useEffect(() => {
  setSharedQualityOptions(qualitySources.map(({ label, value }) => ({ label, value })));
  setSharedQualityHandler(() => setQuality);
  return () => { setSharedQualityHandler(null); setSharedQualityOptions([]); };
}, [movie?.id, isPreview, activeEp?.id, setSharedQualityOptions, setSharedQualityHandler]);

useEffect(() => { setSharedSelectedQuality(quality); }, [quality, setSharedSelectedQuality]);

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

        <div className="film-giant connect-player inner-body" 
          onClick={handleFilmClick} 
          onMouseMove={()=> { if(!isMobile) { setShowControls(true); scheduleControlsHide(); } }} 
          onMouseLeave={()=> playing &&!isMobile && setShowControls(false)}
          onTouchStart={(e)=>{
            if(isZoomable && e.touches.length >= 1 && (e.touches.length === 2 || zoomRef.current.scale > 1)){
              return
            }
            setShowControls(true)
          }}
          style={{ touchAction: isZoomable ? 'none' : 'auto' } as any}
        >

          <div className="film-center"><div className="center-cover"
            onTouchStart={(e) => {
              if (!isZoomable) return
              const t = e.touches
              if (t.length === 2) {
                const dx = t[0].clientX - t[1].clientX
                const dy = t[0].clientY - t[1].clientY
                zoomRef.current.startDist = Math.hypot(dx, dy)
                zoomRef.current.startScale = zoomRef.current.scale
              } else if (t.length === 1) {
                zoomRef.current.lastTouchX = t[0].clientX
                zoomRef.current.lastTouchY = t[0].clientY
                zoomRef.current.startX = zoomRef.current.x
                zoomRef.current.startY = zoomRef.current.y
                const now = Date.now()
                if (now - zoomRef.current.lastTap < 300) {
                  e.preventDefault()
                  const nextFit = videoFit === 'contain' ? 'cover' : 'contain'
                  setVideoFit(nextFit)
                  if (nextFit === 'contain') {
                    zoomRef.current.scale = 1; zoomRef.current.x = 0; zoomRef.current.y = 0
                    setZoomScale(1); setPan({ x: 0, y: 0 })
                  }
                }
                zoomRef.current.lastTap = now
              }
            }}
            onTouchMove={(e) => {
              if (!isZoomable) return
              const t = e.touches
              if (t.length === 2) {
                e.preventDefault()
                const dx = t[0].clientX - t[1].clientX
                const dy = t[0].clientY - t[1].clientY
                const dist = Math.hypot(dx, dy)
                if (zoomRef.current.startDist > 0) {
                  let newScale = zoomRef.current.startScale * (dist / zoomRef.current.startDist)
                  newScale = Math.max(1, Math.min(3, newScale))
                  if (videoFit === 'contain' && newScale > 1.05) setVideoFit('cover')
                  zoomRef.current.scale = newScale
                  setZoomScale(newScale)
                }
              } else if (t.length === 1 && zoomRef.current.scale > 1) {
                e.preventDefault()
                const deltaX = t[0].clientX - zoomRef.current.lastTouchX
                const deltaY = t[0].clientY - zoomRef.current.lastTouchY
                const maxPan = (zoomRef.current.scale - 1) * 120
                let nx = zoomRef.current.startX + deltaX
                let ny = zoomRef.current.startY + deltaY
                nx = Math.max(-maxPan, Math.min(maxPan, nx))
                ny = Math.max(-maxPan, Math.min(maxPan, ny))
                zoomRef.current.x = nx; zoomRef.current.y = ny
                setPan({ x: nx, y: ny })
              }
            }}
            onTouchEnd={(e) => {
              zoomRef.current.startDist = 0
              if (e.touches.length === 0 && zoomRef.current.scale < 1.05) {
                zoomRef.current.scale = 1; zoomRef.current.x = 0; zoomRef.current.y = 0
                setZoomScale(1); setPan({ x: 0, y: 0 })
              }
            }}
          >
            <video
              key={`${movie.id}-${quality}-${activeEp?.id || 'default'}`}
              ref={videoRef} src={videoUrl} className={`connect-video ${videoFit}`}
              style={{
                objectFit: videoFit as any,
                width:'100%',
                height:'100%',
                background:'#000',
                transform: isZoomable ? `scale(${zoomScale}) translate(${pan.x / zoomScale}px, ${pan.y / zoomScale}px)` : 'none',
                transformOrigin: 'center center',
                transition: zoomRef.current.startDist ? 'none' : 'transform 0.22s cubic-bezier(0.32,0.72,0,1)'
              }}
              onLoadStart={()=>setIsLoading(true)} onWaiting={()=>setIsLoading(true)} onCanPlay={()=>setIsLoading(false)}
              onPlaying={()=>{ setIsLoading(false); setPlaying(true); setHasStarted(true) }}
              onPause={()=>setPlaying(false)}
              onTimeUpdate={(e)=>{
                const v=e.currentTarget; setCurrentTime(v.currentTime); lastTimeRef.current=v.currentTime
                if(v.duration){
                  const pct = (v.currentTime/v.duration)*100
                  setProgress(pct); setDuration(v.duration)
                  // CLEAN: save per-user with duration for true bar dynamics
                  if(v.currentTime > 2 && v.duration > 5){
                    try { useMovieStore.getState().saveProgress(effectiveId, v.currentTime, v.duration) } catch {}
                  }
                }
                updateBufferedProgress()
                try{
                  const pct = v.duration ? (v.currentTime / v.duration) * 100 : 0
                  sessionStorage.setItem(`continue_${effectiveId}`, JSON.stringify({ time:v.currentTime, duration:v.duration, percent:pct, playing:!v.paused, type:isPreview?"preview":"full" }))
                }catch{}
              }}

              onProgress={updateBufferedProgress}
              onLoadedMetadata={(e)=>{
                const vid=e.target as HTMLVideoElement; setDuration(vid.duration)
                try{
                  // 1st source: per-user true progress
                  const st = useMovieStore.getState() as any
                  const savedP = st.watchProgress?.[String(effectiveId)] || st.getProgress?.(String(effectiveId))
                  if(savedP && savedP.percent < 95 && savedP.time > 2 && savedP.time < vid.duration-1){
                    vid.currentTime=savedP.time; lastTimeRef.current=savedP.time; return
                  }
                  // 2nd fallback: sessionStorage
                  const saved=sessionStorage.getItem(`continue_${effectiveId}`)
                  if(saved){
                    const parsed=JSON.parse(saved);
                    const sameType=!parsed?.type || parsed.type===type;
                    const time=parsed?.time;
                    const pct = parsed?.percent || 0
                    if(pct < 95 && sameType && time && time>1 && time<vid.duration-1){ vid.currentTime=time; lastTimeRef.current=time; return }
                  }
                }catch{}
                if(lastTimeRef.current) vid.currentTime=lastTimeRef.current
              }}

              onClick={(e)=> { e.stopPropagation(); (handleFilmClick as any)(e); }}
              playsInline loop={isPreview} preload="auto" muted
              onEnded={handleEnded}
              autoPlay={autoPlayOn}
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
              isMobile={isMobile}
              formatTime={formatTime}
              onSeek={(x: number, r: DOMRect) => seekTo(x, r)}
              onTogglePlay={togglePlay}
              onSkip={skip}
              onToggleFullscreen={toggleFullscreen}
              onBack={handleBack}
              isMini={isMini}
              onClose={onClose || closeDrawer}
              onExpand={maximize}

              onShowControls={keepControlsVisible}
              onInteractionStart={startControlsInteraction}
              onInteractionEnd={endControlsInteraction}
              isSeries={isSeries}
              currentEpisodeIndex={currentEpisodeIndex >=0 ? currentEpisodeIndex : 0}
              episodes={allEps}
              autoPlayOn={autoPlayOn}
              onNextEpisode={onNextEpisode}
              onPrevEpisode={onPrevEpisode}
              setAutoPlayOn={setAutoPlayOn}
              videoFit={videoFit}
              setVideoFit={setVideoFit}
            />

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
        {!isMini && !isFullScreen && <SimilarMovies current={movie} />}
      </div>

      {/* FOOTER OUTSIDE connect-root = breathing space, no black line */}
      {!isMini && !isFullScreen && <FooterFree />}
    </>
  )
}

