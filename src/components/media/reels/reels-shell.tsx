"use client"
import { useEffect, useLayoutEffect, useRef } from "react"
import "./reels.css"
import "./reels-keyboard.css"
import { useKeyboardViewport } from "@/stores/use-keyboard-viewport"
import { useCommentPanel } from "@/stores/use-comment-panel"
import { ReelsCommentPanel } from "./reels-comment-panel"
import { ReelsEpisodesPanel } from "./reels-episodes-panel"
import { DotsPanel } from "./reels-action-logic/dots-menu-logic/dots-panel"

// useLayoutEffect warns during server render, so fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export function ReelsShell({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose?: () => void
}) {
  const { isOpen } = useCommentPanel()
  useKeyboardViewport(isOpen) // keep layout inside the visible area when the keyboard is up
  const rootRef = useRef<HTMLDivElement>(null)
  const savedScrollRef = useRef(0)
  const wasOpenRef = useRef(false)

  const getScroller = () =>
    rootRef.current?.querySelector(".reels-tiktok-container") as HTMLElement | null

  // Remember the feed's scroll position while comments are CLOSED.
  // When comments open, the other reels get display:none, the feed collapses and
  // the browser resets scrollTop to 0. We must not record that reset.
  useEffect(() => {
    const scroller = getScroller()
    if (!scroller) return
    const onScroll = () => {
      if (rootRef.current?.classList.contains("reels-has-comments")) return
      savedScrollRef.current = scroller.scrollTop
    }
    scroller.addEventListener("scroll", onScroll, { passive: true })
    return () => scroller.removeEventListener("scroll", onScroll)
  }, [])

  // When comments close, put the feed back exactly where it was.
  useIsoLayoutEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      const scroller = getScroller()
      if (scroller) {
        const top = savedScrollRef.current
        scroller.style.scrollSnapType = "none" // stop snap from re-snapping mid-restore
        scroller.scrollTop = top
        requestAnimationFrame(() => {
          scroller.scrollTop = top
          requestAnimationFrame(() => { scroller.style.scrollSnapType = "" })
        })
      }
    }
    wasOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    const silentClose = () => { if (onClose) onClose() }
    ;(window as any).__UG_CLOSE_REELS_SILENT__ = silentClose
    return () => {
      if ((window as any).__UG_CLOSE_REELS_SILENT__ === silentClose) {
        delete (window as any).__UG_CLOSE_REELS_SILENT__
      }
    }
  }, [onClose])

  useEffect(() => {
    ;(window as any).__UG_REELS_READY_FOR_DESKTOP__ = true
    return () => { delete (window as any).__UG_REELS_READY_FOR_DESKTOP__ }
  }, [])

  useEffect(() => {
    document.body.classList.add("reels-open")
    return () => document.body.classList.remove("reels-open")
  }, [])

  return (
    <div ref={rootRef} className={`reel-root ${isOpen ? "reels-has-comments" : ""}`}>
      <div className="reel-swiper">{children}</div>
      <ReelsCommentPanel />
      <ReelsEpisodesPanel />
      <DotsPanel />
    </div>
  )
}

