"use client"
import { useEffect, useRef } from "react"
import { useMovieWallController, formatTime } from "./use-movie-wall-controller"
import "./chopers.css"
// Small auto card. Fires INSTANTLY on first open if no clip yet.
// Never fires again after manual adjust: manual sets isAuto=false, we only auto when !clip.
export default function AutoTimeLineChoper({ battleKey, title, duration }: { battleKey: string; title: string; duration: number }) {
  const clip = useMovieWallController((s) => s.clips[battleKey])
  const autoGenerate = useMovieWallController((s) => s.autoGenerate)
  const firedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!duration || duration <= 0) return
    if (clip) return // manual or already auto — never fire again
    const key = `${battleKey}:${Math.floor(duration)}`
    if (firedRef.current === key) return
    firedRef.current = key
    autoGenerate(battleKey, duration, title)
  }, [battleKey, duration, title, clip, autoGenerate])
  if (!clip) return <div className="mwcp-auto"><span>Auto…</span></div>
  return (
    <div className="mwcp-auto">
      <span className="mwcp-auto-label">{clip.isAuto ? "Auto" : "Manual"} • {formatTime(clip.start)} → {formatTime(clip.end)}</span>
      <div className="mwcp-auto-actions">
        <button type="button" onClick={() => autoGenerate(battleKey, duration, title)}>↻ Auto</button>
      </div>
    </div>
  )
}

