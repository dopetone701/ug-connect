"use client"
import { useEffect } from "react"
import "./reels.css"

export function ReelsShell({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose?: () => void
}) {
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

  return (
    <div className="reel-root">
      <div className="reel-swiper">{children}</div>
    </div>
  )
}
