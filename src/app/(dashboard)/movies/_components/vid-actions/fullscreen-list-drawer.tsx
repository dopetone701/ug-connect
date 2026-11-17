 "use client"

import { useEffect, useRef, useState } from "react"
import { useFullscreenListDrawer } from "@/stores/use-fullscreen-list-drawer"
import "./fullscreen-list-drawer.css"

export default function FullscreenListDrawer() {
  const { isOpen, close } = useFullscreenListDrawer()
  const [shouldRender, setShouldRender] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mount when store opens. Keep mounted while closing so slide-back can play.
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleClose = () => {
    if (isClosing) return
    setIsClosing(true)
    // Wait for slide-back (400ms in CSS) before unmounting.
    timeoutRef.current = setTimeout(() => {
      close()
      setIsClosing(false)
      setShouldRender(false)
      timeoutRef.current = null
    }, 400)
  }

  if (!shouldRender) return null

  return (
    <div
      className={`fullscreen-list-drawer ${isOpen && !isClosing ? "open" : ""} ${isClosing ? "closing" : ""}`}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="fullscreen-list-drawer-inner">
        <button
          type="button"
          className="fullscreen-list-drawer-close"
          aria-label="Close list"
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1L13 13M13 1L1 13" />
          </svg>
        </button>

        {/* EMPTY FOR NOW — content injected in Phase 2 */}
        <div className="fullscreen-list-drawer-empty" />
      </div>
    </div>
  )
}