"use client";

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation"

import "../../movies.css"
import "./connect-player.css"
import "./mobile-preview.css"
import "./video-pro-logic/wach-animate-to-landscape.css"
import { useZoomToCover } from "./zoom-to-cover"
import { useWatchAnimateToLandscape } from "./video-pro-logic/watch-animate-to-landscape"

import SimilarMovies from "./similar-movies"
import EpisodesRow from "./episodes-row"
import WatchCommentPanel from "./watch-comment-panel"

import PlayerOverlay from "../../_components/vid-actions/player-overlay"
import VideoMetaInfo from "../../_components/vid-meta-info/video-meta-info"
import UnderVideoStaBtns from "../../_components/under-vid-btns/under-video-sta-btns"

import { useWatchDrawer } from "@/stores/use-watch-drawer"
import { useReelsDrawer } from "@/stores/use-reels-drawer"
import { useVideoSettingsDrawer } from "@/stores/use-video-settings-drawer";
import { useMiniPlayerFloating } from "../../_components/vid-actions/mini-player-floating-logic";
import { useMovieStore } from "@/stores/use-movie-store";
import Padlock from "../../../../../modal-generator/svg-icons/padlock-icon";
import {
  useIsGuest,
  isGuestUser,
  openSignInModal,
} from "../../../../auth-system/movie-locker-if-guest";

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

  // GUEST GATE — BULLETPROOF: guests can NEVER play FULL, only PREVIEW.
  const isGuest = useIsGuest()
  const isBlocked = isGuest && !isPreview
  const blockedModalShownRef = useRef(false)

  useEffect(() => {
    if (isBlocked && !blockedModalShownRef.current) {
      blockedModalShownRef.current = true
      openSignInModal()
    }
    if (!isBlocked) blockedModalShownRef.current = false
  }, [isBlocked])

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
  // REMOVED: old const [isFullScreen, setIsFullScreen] + old toggleFullscreen + old fullscreenchange listener.
  // REPLACED BY: single source of truth — useWatchAnimateToLandscape owns:
  // orientation lock, FLIP animate, native fullscreen, exit, sync, portrait->landscape.
  // videoFit / zoom-to-cover UNTOUCHED — it still owns object-fit (cover vs contain).
  const [quality, setQuality] = useState("auto")
  const { videoFit, setVideoFit, toggleZoom } = useZoomToCover(videoRef)
  const [bufferedProgress, setBufferedProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [descExpanded, setDescExpanded] = useState(false)
  const maximize = useWatchDrawer((s) => s.maximize)
  const drawerState = useWatchDrawer() as any
  const settingsOpen = useVideoSettingsDrawer((s) => s.isOpen);
  const closeVideoSettings = useVideoSettingsDrawer((s) => s.close);

  // === FULLSCREEN / LANDSCAPE ANIMATION — SINGLE SOURCE OF TRUTH ===
  const { isFullscreen: isFullScreen, toggleFullscreen, rootClassName: walClassName } =
    useWatchAnimateToLandscape({ videoRef, rootRef, externalFs, onFsChange })

  const [overlayEpId, setOverlayEpId] = useState<string | null>(() => {
    try {
      const cached = typeof window !== "undefined" ? sessionStorage.getItem(`movie_preload_${effectiveId}`) : null
      const parsed = cached ? JSON.parse(cached) : null
      return parsed?.ep || null
    } catch { return null }
  })

  const handleBack = useCallback(() => {
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
        if (!effectiveId || !movie) return
        try {
          if (videoRef.current) {
            sessionStorage.setItem(`continue_${effectiveId}`, JSON.stringify({
              time: videoRef.current.currentTime, playing: !videoRef.current.paused, type: isPreview ? "preview" : "full",
            }))
          }
        } catch {}
        if (isPreview) {
          closeDrawer?.()
          const p = movie?.preview_urls?.[0] || movie?.preview_url || movie?.trailer_url || movie?.video_preview_url || movie?.preview
          const single = [{ ...movie, id: String(movie.id), cover: movie.cover || movie.cover_url, cover_url: movie.cover || movie.cover_url, video: movie.video || movie.video_url, video_url: movie.video || movie.video_url, preview_url: p, preview_urls: movie.preview_urls || (p ? [p] : []), trailer_url: movie.trailer_url || p, }]
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
    if (isGuestUser() && !isPreview) { openSignInModal(); return }
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + sec))
  }, [duration, isPreview])

  const updateBufferedProgress = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.duration || !video.buffered.length) return
    let bufferedEnd = 0
    for (let i = 0; i < video.buffered.length; i++) {
      if (video.currentTime >= video.buffered.start(i) && video.currentTime <= video.buffered.end(i)) { bufferedEnd = video.buffered.end(i); break }
    }
    if (!bufferedEnd) bufferedEnd = video.buffered.end(video.buffered.length - 1)
    setBufferedProgress(Math.min(100, (bufferedEnd / video.duration) * 100))
  }, [])

  const seekTo = useCallback((clientX: number, rect: DOMRect) => {
    if (isGuestUser() && !isPreview) { openSignInModal(); return }
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    if (videoRef.current && duration) {
      videoRef.current.currentTime = pct * duration
      setProgress(pct * 100)
    }
  }, [duration, isPreview])

  const togglePlay = useCallback(() => {
    if (isGuestUser() && !isPreview) { openSignInModal(); return }
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.muted = false
      videoRef.current.play().then(() => { setPlaying(true); setHasStarted(true) }).catch(() => { })
    } else { videoRef.current.pause(); setPlaying(false) }
  }, [isPreview])

  // NOTE: toggleFullscreen is NOT defined here anymore.
  // It comes from useWatchAnimateToLandscape above (single source of truth).
  // It still has the same guest-gate behaviour: hook is only called from
  // PlayerOverlay, and PlayerOverlay already gates via onToggleFullscreen.
  // To keep the guest gate 100% identical, we wrap it:
  const toggleFullscreenGated = useCallback(() => {
    if (isGuestUser() && !isPreview) { openSignInModal(); return }
    toggleFullscreen()
  }, [toggleFullscreen, isPreview])

  const formatTime = useCallback((sec: number) => {
    if (!sec || isNaN(sec)) return "0:00"
    const h = Math.floor(sec / 3600); const m = Math.floor((sec % 3600) / 60); const s = Math.floor(sec % 60)
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(API_URL, { cache: "no-store" }).then(r => r.json()).then(d => {
      if (cancelled) return; setAllMovies(d)
      const found = d.find((m: any) => String(m.id) === String(effectiveId))
      if (found) { setMovie(found); try { sessionStorage.setItem(`movie_preload_${effectiveId}`, JSON.stringify(found)) } catch { } }
    }).catch(() => { })
    return () => { cancelled = true }
  }, [effectiveId])

  useEffect(() => {
    const check = () => setIsMobile(detectMobileDevice())
    check(); window.addEventListener("resize", check); window.addEventListener("orientationchange", check)
    return () => { window.removeEventListener("resize", check); window.removeEventListener("orientationchange", check) }
  }, [])

  useEffect(() => {
    if (!movie) return; setMounted(true)
    // REMOVED: old fullscreenchange listener that setIsFullScreen.
    // Hook owns fullscreenchange now — this effect only sets mounted.
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

  const keepControlsVisible = useCallback(() => {
    setShowControls(true);
    cancelControlsTimer();
    if (!document.body.hasAttribute("data-pc-cast-open")) {
      scheduleControlsHide();
    }
  }, [cancelControlsTimer, scheduleControlsHide]);

  const startControlsInteraction = useCallback(() => {
    interactingRef.current = true;
    setShowControls(true);
    cancelControlsTimer();
  }, [cancelControlsTimer]);

  const endControlsInteraction = useCallback(() => {
    interactingRef.current = false;
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  useEffect(() => {
    const onPcCastClosed = () => {
      interactingRef.current = false;
      scheduleControlsHide();
    };
    const onKeepVisible = () => {
      if (document.body.hasAttribute("data-pc-cast-open")) {
        setShowControls(true);
      }
    };
    window.addEventListener("pcCastClosed", onPcCastClosed as any);
    window.addEventListener("keepControlsVisible", onKeepVisible as any);
    return () => {
      window.removeEventListener("pcCastClosed", onPcCastClosed as any);
      window.removeEventListener("keepControlsVisible", onKeepVisible as any);
    };
  }, [scheduleControlsHide]);

  const handleFilmClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isGuestUser() && !isPreview) { openSignInModal(); return }
    const t = e.target as HTMLElement;
    const isControl = !!t.closest('button, .cc-icon, .apple-full, .center-skip-btn, .play-apple, .starz-progress, .quality-settings, [data-control], .bubble-expand, .bubble-close, .back-btn-timeout, [data-no-drag], .pc-cast-panel, .pc-cast-wrapper, .pc-cast-backdrop');
    if (isControl) {
      setShowControls(true);
      scheduleControlsHide();
      return;
    }
    if (!showControls) {
      setShowControls(true);
      scheduleControlsHide();
    } else {
      setShowControls(false);
      cancelControlsTimer();
    }
  }, [showControls, scheduleControlsHide, cancelControlsTimer, isPreview]);

  useEffect(() => { scheduleControlsHide(); return () => { cancelControlsTimer(); }; }, [scheduleControlsHide, cancelControlsTimer]);
  useEffect(() => { return () => { interactingRef.current = false; cancelControlsTimer(); }; }, [cancelControlsTimer]);

  useEffect(() => {
    if (!showControls) return;
    const hideNow = () => {
      setShowControls(false);
      cancelControlsTimer();
    };
    const handleOutsidePointer = (e: Event) => {
      const target = e.target as HTMLElement;
      const insideVideo = target.closest('.film-giant, .connect-player, .center-cover, .center-controls-layer, .connect-controls, .center-top, .back-btn-timeout, .connect-loader');
      if (insideVideo) return;
      const outsideArea = target.closest('.connect-under-section, .episodes-row, .similar-movies, .film-meta, footer, .footer-free');
      if (outsideArea || !insideVideo) {
        hideNow();
      }
    };
    const handleScroll = () => {
      if (window.scrollY > 10) hideNow();
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
  const epId = isOverlay ? overlayEpId || searchEpId : searchEpId
  const allEps = movie?.seasons?.flatMap((s: any) => s.episodes || []) || []
  const activeEp = epId ? allEps.find((ep: any) => String(ep.id) === String(epId)) : null
  const epUrl = activeEp?.video_url || activeEp?.url

  const isSeries = (movie?.seasons?.length > 0 && allEps.length > 1) || false
  const currentEpisodeIndex = epId ? allEps.findIndex((ep: any) => String(ep.id) === String(epId)) : 0
  const [autoPlayOn, setAutoPlayOn] = useState(true)

  const goToEp = (ep: any) => {
    if (isGuestUser()) { openSignInModal(); return }
    if (isOverlay) { setOverlayEpId(String(ep.id)) } else { router.push(`${pathname}?t=full&ep=${ep.id}`) }
  }

  const handleEnded = () => {
    if (isGuestUser() && !isPreview) return
    try {
      const v = videoRef.current
      if (v && v.duration > 5) {
        useMovieStore.getState().saveProgress(effectiveId, v.duration, v.duration)
      }
    } catch { }
    if (!autoPlayOn) return; if (!isSeries) return;
    const next = allEps[currentEpisodeIndex + 1]; if (next) goToEp(next);
  };

  const onNextEpisode = () => {
    if (isGuestUser()) { openSignInModal(); return }
    const next = allEps[currentEpisodeIndex + 1]; if (next) goToEp(next)
  }
  const onPrevEpisode = () => {
    if (isGuestUser()) { openSignInModal(); return }
    const prev = allEps[currentEpisodeIndex - 1]; if (prev) goToEp(prev)
  }

  const previewUrl = movie?.preview_urls?.[0] || (movie as any)?.preview_url || (movie as any)?.trailer_url || (movie as any)?.preview || (movie as any)?.video_preview_url

  const rawSources = movie ? isPreview
    ? [{ label: "Preview", value: "preview", url: previewUrl || movie.video_url }]
    : [
      { label: "Auto", value: "auto", url: epUrl || movie.video_url },
      { label: "4K", value: "2160", url: movie.video_url_4k || movie.qualities?.["2160"] },
      { label: "1080p", value: "1080", url: movie.video_url_1080 || movie.qualities?.["1080"] },
      { label: "720p", value: "720", url: movie.video_url_720 || movie.qualities?.["720"] },
    ].filter(q => !!q.url) : []

  const normalize = (x: any) => {
    const preview = x?.preview_urls?.[0] || x?.preview_url || x?.trailer_url || x?.video_preview_url || x?.preview
    return { ...x, id: String(x.id), preview_url: preview, preview_urls: x.preview_urls || (preview ? [preview] : []), trailer_url: x.trailer_url || preview }
  }

  const handlePreviewReels = () => {
    const rawList = allMovies && allMovies.length ? allMovies : [movie]
    const list = rawList.map(normalize)
    const idx = rawList.findIndex((m: any) => String(m.id) === String(effectiveId))
    if (isOverlay) closeDrawer?.()
    setTimeout(() => openReels(list, idx >= 0 ? idx : 0), isOverlay ? 150 : 0)
  }

  const qualitySources = rawSources.filter((v, i, a) => a.findIndex(x => x.url === v.url) === i)
  const currentQualityObj = qualitySources.find(q => q.value === quality) || qualitySources[0]
  const videoUrl = isBlocked ? undefined : currentQualityObj?.url

  const setSharedQualityOptions = useVideoSettingsDrawer((s) => s.setQualityOptions);
  const setSharedQualityHandler = useVideoSettingsDrawer((s) => s.setQualityHandler);
  const setSharedSelectedQuality = useVideoSettingsDrawer((s) => s.setSelectedQuality);

  useEffect(() => {
    setSharedQualityOptions(qualitySources.map(({ label, value }) => ({ label, value })));
    setSharedQualityHandler(() => setQuality);
    return () => { setSharedQualityHandler(null); setSharedQualityOptions([]); };
  }, [movie?.id, isPreview, activeEp?.id, setSharedQualityOptions, setSharedQualityHandler]);

  useEffect(() => { setSharedSelectedQuality(quality); }, [quality, setSharedSelectedQuality]);

  useEffect(() => {
    if (isBlocked) {
      try { videoRef.current?.pause() } catch {}
      setIsLoading(false)
      return
    }
    if (!videoUrl || !videoRef.current) return
    setIsLoading(true)
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current)
    autoPlayTimerRef.current = setTimeout(async () => {
      const v = videoRef.current; if (!v) return
      try {
        let savedTime = 0; let wasPlaying = false
        try {
          const saved = sessionStorage.getItem(`continue_${effectiveId}`)
          if (saved) { const parsed = JSON.parse(saved); const sameType = !parsed?.type || parsed.type === type; if (sameType) { savedTime = parsed.time || 0; wasPlaying = !!parsed.playing; if (savedTime > 1) v.currentTime = savedTime } }
        } catch {}
        if (!savedTime && lastTimeRef.current) v.currentTime = lastTimeRef.current
        v.muted = wasPlaying ? false : true; v.volume = volume; await v.play(); setPlaying(true); setHasStarted(true); setIsLoading(false)
        if (v.muted) { setTimeout(() => { if (v) { v.muted = false; v.volume = volume } }, 400) }
      } catch { setIsLoading(false) }
    }, 0)
    return () => clearTimeout(autoPlayTimerRef.current)
  }, [videoUrl, activeEp?.id, effectiveId, volume, type, isBlocked])

  if (!movie) return <div className={`film-root connect-root ${isOverlay ? 'yt-overlay-root' : ''}`} style={{ background: "hsl(var(--bg))", minHeight: "60vh" }}><div className="film-giant inner-body" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div></div>

  return (
    <>
      <div ref={rootRef} className={`film-root connect-root ${isOverlay ? 'yt-overlay-root' : ''} ${isFullScreen ? 'is-shell-full' : ''} ${isMobile ? 'is-mobile-layout' : 'is-desktop-layout'} ${walClassName}`}>

        <div className="film-giant connect-player inner-body" onClick={handleFilmClick} onMouseMove={() => { if (!isMobile) { setShowControls(true); scheduleControlsHide(); } }} onMouseLeave={() => playing && !isMobile && setShowControls(false)} onTouchStart={() => setShowControls(true)}>

          <div className="film-center"><div className="center-cover wal-video-box">
            {isBlocked ? (
              <div style={{ width: "100%", height: "100%", minHeight: 320, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", overflow: "hidden" }}>
                {movie?.cover || movie?.cover_url ? (
                  <img src={movie.cover || movie.cover_url} alt={movie.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }} draggable={false} />
                ) : null}
                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: 24, textAlign: "center" }}>
                  <span style={{ display: "inline-flex", width: 56, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 999, background: "rgba(0,0,0,0.65)" }}>
                    <Padlock size={28} color="#fff" />
                  </span>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Sign in to watch full movie</div>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Guests can only watch the preview.</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); openSignInModal() }} style={{ padding: "12px 20px", borderRadius: 999, border: "none", background: "hsl(var(--primary))", color: "hsl(var(--primary-text))", fontWeight: 800, cursor: "pointer" }}>Sign In</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); if (isOverlay) { setOverlayEpId(null) } router.push(`${pathname}?t=preview`) }} style={{ padding: "12px 20px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.5)", background: "transparent", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Watch Preview</button>
                  </div>
                </div>
              </div>
            ) : (
              <video
                key={`${movie.id}-${quality}-${activeEp?.id || 'default'}`}
                ref={videoRef} src={videoUrl} className={`connect-video ${videoFit}`}
                style={{ objectFit: videoFit as any, width: '100%', height: '100%', background: '#000' }}
                onLoadStart={() => setIsLoading(true)} onWaiting={() => setIsLoading(true)} onCanPlay={() => setIsLoading(false)}
                onPlaying={() => { setIsLoading(false); setPlaying(true); setHasStarted(true) }}
                onPause={() => setPlaying(false)}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget; setCurrentTime(v.currentTime); lastTimeRef.current = v.currentTime
                  if (v.duration) {
                    const pct = (v.currentTime / v.duration) * 100
                    setProgress(pct); setDuration(v.duration)
                    if (v.currentTime > 2 && v.duration > 5) {
                      try { useMovieStore.getState().saveProgress(effectiveId, v.currentTime, v.duration) } catch {}
                    }
                  }
                  updateBufferedProgress()
                  try {
                    const pct = v.duration ? (v.currentTime / v.duration) * 100 : 0
                    sessionStorage.setItem(`continue_${effectiveId}`, JSON.stringify({ time: v.currentTime, duration: v.duration, percent: pct, playing: !v.paused, type: isPreview ? "preview" : "full" }))
                  } catch {}
                }}
                onProgress={updateBufferedProgress}
                onLoadedMetadata={(e) => {
                  const vid = e.target as HTMLVideoElement; setDuration(vid.duration)
                  try {
                    const st = useMovieStore.getState() as any
                    const savedP = st.watchProgress?.[String(effectiveId)] || st.getProgress?.(String(effectiveId))
                    if (savedP && savedP.percent < 95 && savedP.time > 2 && savedP.time < vid.duration - 1) {
                      vid.currentTime = savedP.time; lastTimeRef.current = savedP.time; return
                    }
                    const saved = sessionStorage.getItem(`continue_${effectiveId}`)
                    if (saved) {
                      const parsed = JSON.parse(saved);
                      const sameType = !parsed?.type || parsed.type === type;
                      const time = parsed?.time;
                      const pct = parsed?.percent || 0
                      if (pct < 95 && sameType && time && time > 1 && time < vid.duration - 1) { vid.currentTime = time; lastTimeRef.current = time; return }
                    }
                  } catch {}
                  if (lastTimeRef.current) vid.currentTime = lastTimeRef.current
                }}
                onClick={(e) => { e.stopPropagation(); (handleFilmClick as any)(e); }}
                onDoubleClick={toggleZoom}
                playsInline loop={isPreview} preload="auto" muted
                onEnded={handleEnded}
                autoPlay={autoPlayOn}
              />
            )}
            {!isBlocked && (
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
                onToggleFullscreen={toggleFullscreenGated}
                onBack={handleBack}
                isMini={isMini}
                onClose={onClose || closeDrawer}
                onExpand={maximize}
                onShowControls={keepControlsVisible}
                onInteractionStart={startControlsInteraction}
                onInteractionEnd={endControlsInteraction}
                isSeries={isSeries}
                currentEpisodeIndex={currentEpisodeIndex >= 0 ? currentEpisodeIndex : 0}
                episodes={allEps}
                autoPlayOn={autoPlayOn}
                onNextEpisode={onNextEpisode}
                onPrevEpisode={onPrevEpisode}
                setAutoPlayOn={setAutoPlayOn}
                videoFit={videoFit}
                setVideoFit={setVideoFit}
              />
            )}

          </div></div>
        </div>

        {!isMini && (
          <div className="connect-actions-slot" style={{ display: isFullScreen ? 'none' : 'flex' }}>
            <UnderVideoStaBtns movie={movie} paramsId={String(effectiveId)} isPreview={isPreview} onPreview={handlePreviewReels} />
          </div>
        )}

        <div className="connect-scroll-area">
          {!isMini && (
            <div className="connect-under-section" style={{ display: isFullScreen ? 'none' : 'flex' }}>
              <VideoMetaInfo movie={movie} descExpanded={descExpanded} setDescExpanded={setDescExpanded} />
            </div>
          )}
          {!isMini && !isFullScreen && movie?.seasons?.length > 0 && (
            <EpisodesRow movie={movie} activeEpId={epId} onSelect={(ep: any) => { if (isGuestUser()) { openSignInModal(); return } if (isOverlay) { setOverlayEpId(String(ep.id)) } else { router.push(`${pathname}?t=full&ep=${ep.id}`) } }} />
          )}

          {!isMini && !isFullScreen && <SimilarMovies current={movie} />}

          {!isMini && !isFullScreen && (
            <WatchCommentPanel movieId={String(movie.id)} movie={movie} />
          )}

        </div>
      </div>
    </>
  )
}

