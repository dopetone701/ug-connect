"use client"
import { useCallback, useRef } from "react"
import { formatTime } from "./use-movie-wall-controller"
import "./chopers.css"

// One draggable timeline: [start handle] ====== [end handle]
// Drag handles OR drag the middle bar to move the whole clip.
// All values in seconds. Parent owns state — this is pure UI.
export default function TimeLineChopers({
  duration, start, end, label, onChange, disabled,
}: {
  duration: number; start: number; end: number; label: string
  onChange: (start: number, end: number) => void; disabled?: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<"start" | "end" | "move" | null>(null)
  const moveOffsetRef = useRef(0)

  const pct = (v: number) => (duration > 0 ? (v / duration) * 100 : 0)
  const valueFromEvent = useCallback((e: React.PointerEvent) => {
    const el = trackRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    return Math.round(ratio * duration)
  }, [duration])

  const onPointerDown = (kind: "start" | "end" | "move") => (e: React.PointerEvent) => {
    if (disabled) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = kind
    if (kind === "move") moveOffsetRef.current = valueFromEvent(e) - start
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const kind = dragRef.current
    if (!kind) return
    const v = valueFromEvent(e)
    if (kind === "start") onChange(Math.max(0, Math.min(v, end - 1)), end)
    if (kind === "end") onChange(start, Math.max(start + 1, Math.min(duration, v)))
    if (kind === "move") {
      const len = end - start
      let ns = v - moveOffsetRef.current
      ns = Math.max(0, Math.min(duration - len, ns))
      onChange(ns, ns + len)
    }
  }
  const onPointerUp = () => { dragRef.current = null }

  return (
    <div className="mwcp-choper">
      <div className="mwcp-choper-label"><span>{label}</span><span>{formatTime(start)} → {formatTime(end)} • {formatTime(end - start)} long</span></div>
      <div ref={trackRef} className="mwcp-track" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        <div className="mwcp-track-bg" />
        <div className="mwcp-selected" style={{ left: `${pct(start)}%`, width: `${pct(end - start)}%` }}
          onPointerDown={onPointerDown("move")} title="Drag to move whole clip" />
        <button type="button" className="mwcp-handle mwcp-handle-start" style={{ left: `${pct(start)}%` }}
          onPointerDown={onPointerDown("start")} aria-label="Chop start">◀ {formatTime(start)}</button>
        <button type="button" className="mwcp-handle mwcp-handle-end" style={{ left: `${pct(end)}%` }}
          onPointerDown={onPointerDown("end")} aria-label="Chop end">{formatTime(end)} ▶</button>
      </div>
      
    </div>
  )
}

