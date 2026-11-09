"use client"
import { useCallback, useEffect, useRef, useState } from "react"

/**
 * useWatchAnimateToLandscape — SINGLE SOURCE OF TRUTH — v4 FINAL
 * Replaces v1. v1 is the file you just pasted — it causes the disappear.
 *
 * v1 bugs that make video vanish:
 *  1. await lockLandscape() + 60ms wait — browser rotates BEFORE we measure, video already moved.
 *  2. FLIP with --wal-from-* + .wal-animating, but CSS animates left/top/width/height = layout = rebuild.
 *  3. After 520ms: root.requestFullscreen() / video.requestFullscreen() / webkitEnterFullscreen()
 *     = browser tears down video layer, re-parents it, re-decodes = BLACK + video disappears, then snaps back.
 *  4. fullscreenchange listener removes .wal-fullscreen instantly = exit snap.
 *  5. savedTime / wasPlaying restore = video seeks = flash.
 *
 * v4: NO lock, NO native fullscreen, NO requestFullscreen, NO seek, NO re-parent.
 * Same <video>, CSS-only .is-shell-full, PIN first (identical frame) then transform-only FLIP.
 */

type Opts = {
  videoRef: React.RefObject<HTMLVideoElement | null>
  rootRef: React.RefObject<HTMLDivElement | null>
  externalFs?: boolean
  onFsChange?: (v: boolean) => void
  getPortraitRect?: () => DOMRect | null
  onExitToPortrait?: () => void
}

export function useWatchAnimateToLandscape({ videoRef, rootRef, externalFs, onFsChange, getPortraitRect, onExitToPortrait }: Opts) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const animatingRef = useRef(false)
  const portraitRectRef = useRef<DOMRect | null>(null)
  const lastOrientation = useRef<"portrait" | "landscape">(
    typeof window !== "undefined" && window.innerWidth > window.innerHeight ? "landscape" : "portrait"
  )

  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)")
    const update = () => { setIsLandscape(mq.matches); lastOrientation.current = mq.matches ? "landscape" : "portrait" }
    update()
    mq.addEventListener?.("change", update)
    return () => mq.removeEventListener?.("change", update)
  }, [])

  // External is MIRROR only — never drives us, never fights.
  useEffect(() => { if (externalFs !== undefined) setIsFullscreen(externalFs) }, [externalFs])

  const clearVars = useCallback((root: HTMLElement) => {
    ["--wal-left","--wal-top","--wal-w","--wal-h","--wal-dx","--wal-dy","--wal-sx","--wal-sy","--wal-rot"].forEach(k => root.style.removeProperty(k))
  }, [])

  const enterFullscreen = useCallback(() => {
    const root = rootRef.current, video = videoRef.current
    if (!root || animatingRef.current) return
    animatingRef.current = true
    setIsAnimating(true)
    const rect = root.getBoundingClientRect()
    portraitRectRef.current = rect
    const wasPaused = video ? video.paused : true

    // STEP 1 — PIN: fixed at EXACT portrait rect, transform = none. ZERO visual change.
    root.classList.add("wal-root", "wal-animating")
    root.style.setProperty("--wal-left", `${rect.left}px`)
    root.style.setProperty("--wal-top", `${rect.top}px`)
    root.style.setProperty("--wal-w", `${rect.width}px`)
    root.style.setProperty("--wal-h", `${rect.height}px`)
    root.style.setProperty("--wal-dx", "0px"); root.style.setProperty("--wal-dy", "0px")
    root.style.setProperty("--wal-sx", "1"); root.style.setProperty("--wal-sy", "1")
    root.style.setProperty("--wal-rot", "0deg")
    void root.getBoundingClientRect() // force paint at pinned pose — stops the vanish

    // STEP 2 — ANIMATE: grow + rotate to fullscreen. Same video, never paused.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2
      const scx = window.innerWidth / 2, scy = window.innerHeight / 2
      root.classList.add("wal-to-full", "wal-fullscreen", "wal-landscape")
      root.style.setProperty("--wal-dx", `${scx - cx}px`)
      root.style.setProperty("--wal-dy", `${scy - cy}px`)
      root.style.setProperty("--wal-sx", `${window.innerWidth / rect.width}`)
      root.style.setProperty("--wal-sy", `${window.innerHeight / rect.height}`)
      root.style.setProperty("--wal-rot", `90deg`)
      if (video && !wasPaused) video.play().catch(() => {})
    }))

    // STEP 3 — LAND: only NOW .is-shell-full. Transform end == fullscreen pose, no jump.
    window.setTimeout(() => {
      root.classList.add("is-shell-full")
      root.classList.remove("wal-animating", "wal-to-full")
      root.classList.add("wal-animating-done")
      clearVars(root)
      animatingRef.current = false; setIsAnimating(false)
      setIsFullscreen(true); onFsChange?.(true)
      requestAnimationFrame(() => root.classList.remove("wal-animating-done"))
    }, 540)
  }, [videoRef, rootRef, clearVars, onFsChange])

  const exitFullscreen = useCallback(() => {
    const root = rootRef.current, video = videoRef.current
    if (!root || animatingRef.current) return
    animatingRef.current = true
    setIsAnimating(true)
    const wasPaused = video ? video.paused : true
    const target = getPortraitRect?.() ?? portraitRectRef.current
    if (!target) {
      root.classList.remove("is-shell-full", "wal-fullscreen", "wal-landscape")
      setIsFullscreen(false); onFsChange?.(false); onExitToPortrait?.()
      animatingRef.current = false; setIsAnimating(false); return
    }
    // STEP 1 — PIN at FULL, transform = none. No vanish. Keep .is-shell-full ON during exit.
    root.classList.add("wal-root", "wal-animating")
    root.classList.remove("wal-animating-done")
    root.style.setProperty("--wal-left", `0px`); root.style.setProperty("--wal-top", `0px`)
    root.style.setProperty("--wal-w", `${window.innerWidth}px`); root.style.setProperty("--wal-h", `${window.innerHeight}px`)
    root.style.setProperty("--wal-dx", "0px"); root.style.setProperty("--wal-dy", "0px")
    root.style.setProperty("--wal-sx", "1"); root.style.setProperty("--wal-sy", "1")
    root.style.setProperty("--wal-rot", "0deg")
    void root.getBoundingClientRect()

    // STEP 2 — ANIMATE back: shrink + rotate to portrait rect. Same 520ms, same curve.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2
      const tcx = target.left + target.width / 2, tcy = target.top + target.height / 2
      root.classList.add("wal-to-portrait")
      root.style.setProperty("--wal-dx", `${tcx - cx}px`)
      root.style.setProperty("--wal-dy", `${tcy - cy}px`)
      root.style.setProperty("--wal-sx", `${target.width / window.innerWidth}`)
      root.style.setProperty("--wal-sy", `${target.height / window.innerHeight}`)
      root.style.setProperty("--wal-rot", `-90deg`)
      if (video && !wasPaused) video.play().catch(() => {})
    }))

    // STEP 3 — LAND: only NOW drop .is-shell-full.
    window.setTimeout(() => {
      root.classList.remove("is-shell-full", "wal-fullscreen", "wal-landscape", "wal-animating", "wal-to-portrait")
      root.classList.add("wal-animating-done")
      clearVars(root)
      animatingRef.current = false; setIsAnimating(false)
      setIsFullscreen(false); onFsChange?.(false); onExitToPortrait?.()
      requestAnimationFrame(() => root.classList.remove("wal-animating-done"))
    }, 540)
  }, [rootRef, videoRef, getPortraitRect, clearVars, onFsChange, onExitToPortrait])

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) return exitFullscreen()
    return enterFullscreen()
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  // AUTO-ROTATE: gamma fires WHILE hand is still rotating (early), matchMedia is backup.
  useEffect(() => {
    let started = false
    const onGamma = (e: DeviceOrientationEvent) => {
      const g = (e as any).gamma ?? 0
      if (!started && Math.abs(g) > 45 && lastOrientation.current === "portrait" && !isFullscreen) {
        started = true; lastOrientation.current = "landscape"; enterFullscreen()
      }
      if (!started && Math.abs(g) < 20 && lastOrientation.current === "landscape" && isFullscreen) {
        started = true; lastOrientation.current = "portrait"; exitFullscreen()
      }
      if (Math.abs(g) < 10 || Math.abs(g) > 80) started = false
    }
    const mq = window.matchMedia("(orientation: landscape)")
    const onMq = () => {
      const now = mq.matches ? "landscape" : "portrait"
      if (now === lastOrientation.current) return
      lastOrientation.current = now
      if (now === "landscape" && !isFullscreen) enterFullscreen()
      if (now === "portrait" && isFullscreen) exitFullscreen()
    }
    window.addEventListener("deviceorientation", onGamma as any)
    mq.addEventListener?.("change", onMq)
    return () => {
      window.removeEventListener("deviceorientation", onGamma as any)
      mq.removeEventListener?.("change", onMq)
    }
  }, [enterFullscreen, exitFullscreen, isFullscreen])

  // NO fullscreenchange listener in v4 — there is no native fullscreen to listen to.
  // NO lockLandscape / unlockOrientation / Capacitor / screen.orientation.lock in v4.

  const rootClassName = [
    "wal-root",
    isFullscreen ? "wal-fullscreen" : "",
    isFullscreen && isLandscape ? "wal-landscape" : "",
    isFullscreen && !isLandscape ? "wal-portrait" : "",
    isAnimating ? "wal-animating" : "",
  ].filter(Boolean).join(" ")

  return {
    isFullscreen, isLandscape, isAnimating,
    toggleFullscreen, enterFullscreen, exitFullscreen,
    enterLandscape: enterFullscreen, exitLandscape: exitFullscreen,
    rootClassName,
  }
}

export default useWatchAnimateToLandscape

