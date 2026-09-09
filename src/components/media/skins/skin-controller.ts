// src/components/media/skins/skin-controller.tsx
"use client"
import { useEffect } from "react"

export function useSkinViewport(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  skinId: string,
  activeSkin: string,
  isMini: boolean
) {
  useEffect(() => {
    const video = videoRef.current
    const viewport = document.getElementById(`skin-viewport-${skinId}`)
    if (!video || !viewport) return
    if (isMini) return
    if (activeSkin !== skinId) return

    // defer to next frame - kills insertBefore in Next 15
    const raf = requestAnimationFrame(() => {
      if (viewport.contains(video)) return
      // reset styles that hidden holder added
      video.style.display = "block"
      video.style.width = "100%"
      video.style.height = "100%"
      video.style.objectFit = "contain"
      viewport.appendChild(video)
    })

    return () => {
      cancelAnimationFrame(raf)
      // don't move it back here - let next viewport take it
      // moving back causes the crash you see in screenshot
    }
  }, [skinId, activeSkin, isMini, videoRef])
}
