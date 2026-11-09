"use client"
import { useEffect, useRef, useState } from "react"
import { useMovieWallQue, queGetLayout } from "@/app/(dashboard)/movies/_lib/movie-wall-logic/movie-wall-que"
import { formatTime } from "./use-movie-wall-controller"
import "./preview-video.css"
export default function MovieVideoPreview({ src, title, vjName, start, end, muted: mutedProp = true, onDuration, group }: { src?: string; title: string; vjName: string; start: number; end: number; muted?: boolean; onDuration?: (d: number) => void; group?: any }) {
  const ref = useRef<HTMLVideoElement>(null)
  const { localUrl, ready } = useMovieWallQue(src, true)
  const [isMuted, setIsMuted] = useState(mutedProp)
  const [current, setCurrent] = useState(start)
  const [duration, setDuration] = useState(0)
  const layout = group ? queGetLayout(group) : null
  useEffect(() => { const v = ref.current; if (v) { v.muted = isMuted; if (v && localUrl) { try { v.currentTime = start } catch {} } } }, [isMuted, start, localUrl])
  const onTimeUpdate = () => {
    const v = ref.current; if (!v) return
    setCurrent(v.currentTime)
    if (v.currentTime >= end) { try { v.currentTime = start; v.play().catch(() => {}) } catch {} }
    if (v.currentTime < start) { try { v.currentTime = start } catch {} }
  }
  return (
    <div className="mwcp-preview">
      <div className="mwcp-video-box">
        {localUrl && ready ? (
          <video ref={ref} className="mwcp-preview-video" src={localUrl} autoPlay muted={isMuted} playsInline preload="metadata"
            onLoadedMetadata={(e) => { const d = e.currentTarget.duration; setDuration(d); onDuration?.(d); try { e.currentTarget.currentTime = start } catch {} }}
            onTimeUpdate={onTimeUpdate} />
        ) : (<div className="mwcp-preview-loading">Loading from que…</div>)}
        <button type="button" className="mwcp-sound-btn" onClick={() => { setIsMuted((m) => !m); const v = ref.current; if (v) { try { v.muted = !isMuted; v.play().catch(() => {}) } catch {} } }} aria-label={isMuted ? "Unmute — hear what you are adjusting" : "Mute"}>
          {isMuted ? "🔇 Sound Off — tap to hear" : "🔊 Sound On"}
        </button>
        {/* TIME ON VIDEO */}
        <div className="mwcp-video-time"><span>{formatTime(current)}</span><span>{formatTime(start)} → {formatTime(end)}</span><span>{formatTime(duration || 0)}</span></div>
        <div className="mwcp-video-progress"><div style={{ width: duration ? `${(current / duration) * 100}%` : "0%" }} /></div>
      </div>
    </div>
  )
}

