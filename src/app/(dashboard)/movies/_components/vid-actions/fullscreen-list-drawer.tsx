"use client"

import { useEffect, useRef, useState } from "react"
import { useFullscreenListDrawer } from "@/stores/use-fullscreen-list-drawer"

export default function FullscreenListDrawer() {
  const { isOpen, close } = useFullscreenListDrawer()
  const [shouldRender, setShouldRender] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  // Open: mount first (off-screen), THEN flip to visible on next frame so transition runs.
  // External close (exit fullscreen): isOpen -> false, we animate out first, THEN unmount.
  useEffect(() => {
    if (isOpen) {
      clearTimers()
      setShouldRender(true)
      setIsVisible(false)
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setIsVisible(true))
      })
      return
    }
    // isOpen false + we are mounted = slide-back, then unmount
    if (shouldRender) {
      setIsVisible(false)
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false)
        timeoutRef.current = null
      }, 400)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => () => clearTimers(), [])

  const handleClose = () => {
    // Animate out, then tell store to close. Store close will trigger the
    // effect above, which already handles unmount — so we just flip visible.
    setIsVisible(false)
    timeoutRef.current = setTimeout(() => {
      close()
      timeoutRef.current = null
    }, 400)
  }

  if (!shouldRender) return null

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "58%",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        pointerEvents: isVisible ? "auto" : "none",
        transform: isVisible ? "translateX(0)" : "translateX(100%)",
        opacity: isVisible ? 1 : 0,
        transition: "transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease",
        background:
          "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.95) 100%)",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <button
          type="button"
          aria-label="Close list"
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            zIndex: 2,
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1L13 13M13 1L1 13" />
          </svg>
        </button>

        {/* EMPTY FOR NOW — content injected in Phase 2 */}
        <div style={{ flex: 1, width: "100%" }} />
      </div>
    </div>
  )
}