"use client"
import { useCallback, useEffect, useRef, useState } from "react"

/**
 * useWatchAnimateToLandscape — SINGLE SOURCE OF TRUTH
 * Replaces the animation logic that was scattered across:
 *
 * 1. WatchClient toggleFullscreen()
 *    - Capacitor ScreenOrientation.lock('landscape')
 *    - screen.orientation.lock('landscape')
 *    - 50ms setTimeout, then video.webkitEnterFullscreen / video.requestFullscreen / root.requestFullscreen
 *    - setIsFullScreen(true), onFsChange(true), documentElement.is-fullscreen-active, body overflow hidden
 *    - savedTime / wasPlaying restore, unlock on exit
 * 2. WatchClient fullscreenchange listener
 *    - setIsFullScreen(!!document.fullscreenElement || !!webkitFullscreenElement)
 * 3. WatchDrawer triggerFsBtn()
 *    - querySelector(".cc-icon.apple-full")?.click() — indirect, fragile
 * 4. WatchDrawer handleSmoothExpand()
 *    - FLIP: getBoundingClientRect() -> lock left/top/width/height -> transition 520ms -> 100vw/100dvh
 *    - inline style mess, cleared manually on finish
 * 5. WatchDrawer isPortrait matchMedia + fixedLayout
 *    - portrait -> fixed video layout, landscape -> free layout
 *
 * NEW RULE: Nothing else animates. Nothing else locks orientation.
 * WatchClient + WatchDrawer only call this hook and apply its classNames.
 */

type Opts = {
  videoRef: React.RefObject<HTMLVideoElement | null>
  rootRef: React.RefObject<HTMLDivElement | null>
  externalFs?: boolean
  onFsChange?: (v: boolean) => void
}

export function useWatchAnimateToLandscape({ videoRef, rootRef, externalFs, onFsChange }: Opts) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false) // device orientation, not video
  const [isAnimating, setIsAnimating] = useState(false)
  const animTimer = useRef<any>(null)
  const savedRef = useRef({ time: 0, playing: false })

  // --- 1. Device orientation = single listener ---
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)")
    const update = () => setIsLandscape(mq.matches)
    update()
    mq.addEventListener?.("change", update)
    return () => mq.removeEventListener?.("change", update)
  }, [])

  // --- 2. External fullscreen (WatchDrawer) syncs in, never fights ---
  useEffect(() => {
    if (externalFs !== undefined) setIsFullscreen(externalFs)
  }, [externalFs])

  const setFs = useCallback((v: boolean) => {
    setIsFullscreen(v)
    onFsChange?.(v)
    document.documentElement.classList.toggle("is-fullscreen-active", v)
    document.body.style.overflow = v ? "hidden" : ""
  }, [onFsChange])

  const lockLandscape = useCallback(async () => {
    try {
      const isNative = (window as any).Capacitor?.isNativePlatform?.() ? (window as any).Capacitor.isNativePlatform() : false
      if (isNative) {
        try {
          const mod = await import("@capacitor/screen-orientation")
          await mod.ScreenOrientation.lock({ orientation: "landscape" })
        } catch {}
      }
    } catch {}
    try { await (screen.orientation as any)?.lock?.("landscape") } catch {}
  }, [])

  const unlockOrientation = useCallback(async () => {
    try {
      const isNative = (window as any).Capacitor?.isNativePlatform?.() ? (window as any).Capacitor.isNativePlatform() : false
      if (isNative) {
        try {
          const mod = await import("@capacitor/screen-orientation")
          await mod.ScreenOrientation.unlock()
        } catch {}
      }
    } catch {}
    try { (screen.orientation as any)?.unlock?.() } catch {}
  }, [])

  // --- 3. ENTER: FLIP animate from current rect -> fullscreen, THEN native fullscreen ---
  const enterFullscreen = useCallback(async () => {
    const video = videoRef.current as any
    const root = rootRef.current as any
    if (!video || !root || isFullscreen) return
    savedRef.current = { time: video.currentTime || 0, playing: !video.paused }

    // a) Lock orientation FIRST — so the browser rotates before we measure
    await lockLandscape()
    await new Promise((r) => setTimeout(r, 60))

    // b) FLIP: capture where we are now
    const rect = root.getBoundingClientRect()
    root.style.setProperty("--wal-from-left", `${rect.left}px`)
    root.style.setProperty("--wal-from-top", `${rect.top}px`)
    root.style.setProperty("--wal-from-w", `${rect.width}px`)
    root.style.setProperty("--wal-from-h", `${rect.height}px`)
    root.classList.add("wal-animating")
    setIsAnimating(true)

    // c) Next frame: apply fullscreen class — CSS transitions left/top/width/height/border-radius
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.add("wal-fullscreen")
        setFs(true)
      })
    })

    // d) After CSS animation finishes, hand over to native fullscreen (no jump, same rect)
    clearTimeout(animTimer.current)
    animTimer.current = setTimeout(async () => {
      root.classList.remove("wal-animating")
      setIsAnimating(false)
      try {
        const isNative = (window as any).Capacitor?.isNativePlatform?.() ? (window as any).Capacitor.isNativePlatform() : false
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
        const isAndroid = /Android/i.test(navigator.userAgent)
        const useRoot = isNative || isStandalone || isAndroid
        if (!useRoot && video.webkitEnterFullscreen) video.webkitEnterFullscreen()
        else if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: "hide" } as any)
        else if (video.requestFullscreen) await video.requestFullscreen()
        else if ((root as any).webkitRequestFullscreen) await (root as any).webkitRequestFullscreen()
      } catch {}
      // e) Restore time / playing — fullscreen can reset it
      try {
        if (Math.abs(video.currentTime - savedRef.current.time) > 0.5) video.currentTime = savedRef.current.time
        if (savedRef.current.playing) video.play().catch(() => {})
      } catch {}
    }, 520) // = CSS transition time, keep in sync with .css
  }, [videoRef, rootRef, isFullscreen, lockLandscape, setFs])

  // --- 4. EXIT: reverse — exit native, then FLIP back, then unlock ---
  const exitFullscreen = useCallback(async () => {
    const root = rootRef.current as any
    if (!root) return
    try { if (document.fullscreenElement) await document.exitFullscreen() } catch {}
    try { if ((document as any).webkitFullscreenElement) await (document as any).webkitExitFullscreen?.() } catch {}
    setFs(false)
    root.classList.remove("wal-fullscreen")
    // Let CSS animate back, then clean vars
    setTimeout(() => {
      root.classList.remove("wal-animating")
      ;["--wal-from-left", "--wal-from-top", "--wal-from-w", "--wal-from-h"].forEach((k) => root.style.removeProperty(k))
      setIsAnimating(false)
    }, 420)
    await unlockOrientation()
  }, [rootRef, setFs, unlockOrientation])

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) return exitFullscreen()
    return enterFullscreen()
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  // --- 5. Browser / OS exited fullscreen (swipe, back gesture) — stay in sync ---
  useEffect(() => {
    const onFs = () => {
      const fs = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement
      if (!fs && isFullscreen) {
        setFs(false)
        rootRef.current?.classList.remove("wal-fullscreen", "wal-animating")
        setIsAnimating(false)
        unlockOrientation()
      }
      if (fs && !isFullscreen) setFs(true)
    }
    document.addEventListener("fullscreenchange", onFs)
    document.addEventListener("webkitfullscreenchange", onFs as any)
    return () => {
      document.removeEventListener("fullscreenchange", onFs)
      document.removeEventListener("webkitfullscreenchange", onFs as any)
      clearTimeout(animTimer.current)
    }
  }, [isFullscreen, setFs, unlockOrientation, rootRef])

  // --- 6. Already fullscreen + portrait -> rotate to landscape ---
  // No JS animation here. CSS does it: .wal-fullscreen .wal-video-box
  // transitions width/height when viewport swaps. This hook only exposes
  // isLandscape so the className flips and CSS animates it.
  const rootClassName = [
    "wal-root",
    isFullscreen ? "wal-fullscreen" : "",
    isFullscreen && isLandscape ? "wal-landscape" : "",
    isFullscreen && !isLandscape ? "wal-portrait" : "",
    isAnimating ? "wal-animating" : "",
  ].filter(Boolean).join(" ")

  return { isFullscreen, isLandscape, isAnimating, toggleFullscreen, enterFullscreen, exitFullscreen, rootClassName }
}

export default useWatchAnimateToLandscape

