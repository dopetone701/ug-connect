
"use client"

import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"

export default function MovieWallVideo({
  src,
  muted,
  previewStart = 0,
  style,
}: {
  src?: string
  muted: boolean
  previewStart?: number
  style?: CSSProperties
}) {
  const ref = useRef<HTMLVideoElement>(null)

  // Controlled mute — set through the property after user interaction.
  useEffect(() => {
    const v = ref.current
    if (!v) return

    v.muted = muted

    if (!muted) {
      v.play().catch(() => {})
    }
  }, [muted, src])

  useEffect(() => {
    const v = ref.current
    if (!v) return

    const onMeta = () => {
      try {
        v.currentTime = previewStart
      } catch {}
    }

    v.addEventListener("loadedmetadata", onMeta)

    return () => {
      v.removeEventListener("loadedmetadata", onMeta)
    }
  }, [src, previewStart])

  if (!src) return null

  return (
    <video
      ref={ref}
      className="mw-one-video"
      src={src}
      autoPlay
      muted={muted}
      loop
      playsInline
      preload="auto"
      style={style}
    />
  )
}
