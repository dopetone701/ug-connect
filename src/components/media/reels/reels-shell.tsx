"use client"
import { useEffect } from "react"
import "./reels.css"
import { useCommentPanel } from "@/stores/use-comment-panel"
import { ReelsCommentPanel } from "./reels-comment-panel"

export function ReelsShell({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose?: () => void
}) {
  const { isOpen } = useCommentPanel()

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
    <div className={`reel-root ${isOpen ? "reels-has-comments" : ""}`}>
      <div className="reel-swiper">{children}</div>
      <ReelsCommentPanel />
    </div>
  )
}

