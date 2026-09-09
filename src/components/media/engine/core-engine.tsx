// src/components/media/engine/core-engine.tsx
"use client"
import { useEffect } from "react"
import { useEngine } from "./use-engine"

export function CoreEngine() {
  const { videoRef } = useEngine()

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    // create hidden holder if not exists
    let holder = document.getElementById("core-engine-hidden-holder")
    if (!holder) {
      holder = document.createElement("div")
      holder.id = "core-engine-hidden-holder"
      holder.style.display = "none"
      document.body.appendChild(holder)
      holder.appendChild(v)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      playsInline
      preload="auto"
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  )
}
