"use client"

import { useEffect, useState } from "react"
import type { Movie } from "../../_lib/types"
import { useMovieStore } from "@/stores/use-movie-store"

// REAL CARD, LIST VERSION — INLINE ONLY, NO CSS FILE.
// latest-movies.css kept beating the .css file, so every size/layout here is inline style.
// Inline beats stylesheet, so thumb can never go back to 184px PC size.

function formatTime(v: any) {
  if (v === undefined || v === null || v === "" || Number.isNaN(Number(v))) return ""
  const s = Math.max(0, Math.floor(Number(v)))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  return `${m}:${String(sec).padStart(2, "0")}`
}

// Small as mobile portrait, even in landscape. JS, not media query:
// landscape phone is 844px wide so max-width:768px never hit -> PC 184px. JS checks real shape.
function useThumbWidth() {
  const [w, setW] = useState(118)
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isLandscape = vw > vh
      const isPhone = Math.min(vw, vh) <= 430 // phone short side, portrait or landscape
      if (isPhone && isLandscape) setW(160)
      else if (isPhone) setW(150)
      else if (vw <= 768) setW(150)
      else setW(168)
    }
    calc()
    window.addEventListener("resize", calc)
    window.addEventListener("orientationchange", calc)
    return () => {
      window.removeEventListener("resize", calc)
      window.removeEventListener("orientationchange", calc)
    }
  }, [])
  return w
}

export default function FullscreenListCard({ m, onSelect }: { m: Movie; onSelect?: (m: Movie) => void }) {
  const thumbW = useThumbWidth()
  let progress: any = null
  try {
    const state = useMovieStore.getState() as any
    const id = String((m as any).id)
    progress = state.watchProgress?.[id] || state.getProgress?.(id)
  } catch {}
  const time = formatTime(progress?.time)
  const duration = formatTime(progress?.duration || (m as any).duration)
  const watching = time && duration ? `${time} / ${duration}` : time || duration || ""

  return (
    <div
      onClick={() => onSelect?.(m)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onSelect?.(m) }}
      style={{
        display: "flex", flexDirection: "row", alignItems: "flex-start",
        gap: 12, width: "100%", flexShrink: 0, cursor: "pointer",
        background: "transparent", border: "none", padding: 0, textAlign: "left",
        boxSizing: "border-box",
      }}
    >
      {/* LEFT — REUSED CARD, EXACT CLASSES, SIZE INLINE (beats latest-movies.css 184px) */}
      <div className="latest-card" style={{ width: thumbW, minWidth: thumbW, maxWidth: thumbW, flexGrow: 0, flexShrink: 0, flexBasis: thumbW, boxSizing: "border-box" }}>
        <div className="l-card-cover" style={{ width: "100%", aspectRatio: "16 / 9", height: Math.round(thumbW * 9 / 16), borderRadius: 10, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={(m as any).cover || (m as any).cover_url} alt={m.title} loading="lazy" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          <div className="l-card-fade" style={{ display: "none" }} />
          <div className="l-card-vj-on" style={{ display: "none" }}>{(m as any).vj}</div>
          {/* PLAY + PRE — kept in DOM, hidden INLINE (beats CSS, no .css file needed) */}
          <div className="l-card-actions" style={{ display: "none" }}>
            <button type="button" className="l-a-btn play on" tabIndex={-1} onClick={(e) => e.stopPropagation()}>PLAY</button>
            <button type="button" className="l-a-btn prev on" tabIndex={-1} onClick={(e) => e.stopPropagation()}>PRE</button>
          </div>
        </div>
      </div>

      {/* RIGHT — YouTube info, MUST be flex:1 so it sits on right */}
      <div style={{ flexGrow: 1, flexShrink: 1, flexBasis: "auto", minWidth: 0, width: 0, paddingTop: 2, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", wordBreak: "break-word" }}>{m.title}</div>
        {(m as any).vj ? <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 12, lineHeight: 1.4, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(m as any).vj}</div> : null}
        {watching ? <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 12, lineHeight: 1.4, marginTop: 1 }}>{watching}</div> : null}
      </div>
    </div>
  )
}

