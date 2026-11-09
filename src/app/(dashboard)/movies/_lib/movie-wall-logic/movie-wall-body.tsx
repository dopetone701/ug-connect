"use client"
import { useRef, useId, useEffect } from "react"
import type { CSSProperties } from "react"
import type { BattleGroup } from "./movie-wall-groups"
import { getWallLayout } from "./movie-wall-shapes-logic"
import { useMovieWallQue } from "./movie-wall-que"
import { useMovieWallController } from "@/app/(dashboard)/control-center-page/components/movie-wall-controller/use-movie-wall-controller"

// FIX FOR ZIGZAG: 1 video element per card, clipped to shape logic rects.
// No per-tile videos, no captureStream, no slaves -> no drift, no zigzag.
// Gap is TRUE empty: video is clipped away there, you see real theme bg.
const GAP_X_PCT = 6 / 280 * 100
const GAP_Y_PCT = 6 / 168 * 100
const HALF_X = GAP_X_PCT / 2
const HALF_Y = GAP_Y_PCT / 2
function formatViews(n: number) { if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M"; if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K"; return String(n) }
export default function MovieWallBody({ group, activeVjId, activeMovie, isPreviewing, selectVj, isArmed, isMuted }: any) {
  const layout = getWallLayout(group.vjs.length)
  const movedRef = useRef(false); const startX = useRef(0); const startY = useRef(0)
  const clipId = useId().replace(/[^a-zA-Z0-9]/g, "")
  const videoSrc = activeMovie.preview?.[0] || activeMovie.preview_urls?.[0] || activeMovie.preview_url || activeMovie.trailer_url || activeMovie.video
  const { localUrl, ready } = useMovieWallQue(videoSrc, isArmed)
  const playSrc = localUrl || videoSrc

  // --- WALL CHOP — NO FALLBACK. Wall ALWAYS plays only the chopped clip. ---
  const clip = useMovieWallController((s) => s.clips[group.key])
  const clipRef = useRef({ start: 0, end: 35 })
  useEffect(() => {
    if (clip?.isApproved) clipRef.current = { start: clip.start, end: clip.end }
  }, [clip])

  const clipped = layout.map((r: any) => { const ix = r.x > 0.001 ? HALF_X : 0; const iy = r.y > 0.001 ? HALF_Y : 0; const rx = r.x + r.w < 99.999 ? HALF_X : 0; const ry = r.y + r.h < 99.999 ? HALF_Y : 0; return { x: r.x + ix, y: r.y + iy, w: r.w - ix - rx, h: r.h - iy - ry } })
  return (<div className="mw-square">
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true"><defs><clipPath id={clipId} clipPathUnits="objectBoundingBox">{clipped.map((r: any, i: number) => (<rect key={i} x={r.x / 100} y={r.y / 100} width={r.w / 100} height={r.h / 100} rx="0.015" ry="0.025" />))}</clipPath></defs></svg>
    {!isArmed ? (<img src={group.cover} alt="" loading="lazy" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", clipPath: `url(#${clipId})` } as CSSProperties} />) : null}
    {isArmed && ready && playSrc ? (<video className="mw-one-video" src={playSrc} autoPlay muted={isMuted} loop playsInline preload="metadata" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", clipPath: `url(#${clipId})` } as CSSProperties}
      onLoadedMetadata={(e) => {
        const v = e.currentTarget
        const d = v.duration || 0
        if (clip?.isApproved) {
          clipRef.current = { start: clip.start, end: clip.end }
        } else {
          // No approved clip yet — auto-chop here: 25% in, 35s. NEVER full movie.
          const autoStart = Math.floor(d * 0.25)
          const autoEnd = Math.min(d - 60, autoStart + 35)
          clipRef.current = { start: autoStart, end: Math.max(autoStart + 5, autoEnd) }
        }
        try { v.currentTime = clipRef.current.start } catch {}
      }}
      onTimeUpdate={(e) => {
        const v = e.currentTarget
        const { start, end } = clipRef.current
        if (v.currentTime >= end) { try { v.currentTime = start } catch {} }
        if (v.currentTime < start) { try { v.currentTime = start } catch {} }
      }}
    />) : null}
    {group.vjs.map((vj: any, i: number) => { const rect = layout[i]; if (!rect) return null; const ix = rect.x > 0.001 ? 3 : 0; const iy = rect.y > 0.001 ? 3 : 0; const rx = rect.x + rect.w < 99.999 ? 3 : 0; const ry = rect.y + rect.h < 99.999 ? 3 : 0; const isActive = String(vj.id) === String(activeVjId); const isMost = String(vj.id) === String(group.mostViewed.id); return (
      <button key={String(vj.id)} type="button" className={`mw-tile ${isActive ? "active" : ""} ${isMost ? "most" : ""} ${isArmed ? "armed" : "disarmed"}`} style={{ left: `calc(${rect.x}% + ${ix}px)`, top: `calc(${rect.y}% + ${iy}px)`, width: `calc(${rect.w}% - ${ix + rx}px)`, height: `calc(${rect.h}% - ${iy + ry}px)`, background: isArmed ? "transparent" : "transparent", borderTopLeftRadius: rect.x === 0 && rect.y === 0 ? "var(--mw-outer)" : "var(--mw-inner)", borderTopRightRadius: rect.x + rect.w >= 99.9 && rect.y === 0 ? "var(--mw-outer)" : "var(--mw-inner)", borderBottomLeftRadius: rect.x === 0 && rect.y + rect.h >= 99.9 ? "var(--mw-outer)" : "var(--mw-inner)", borderBottomRightRadius: rect.x + rect.w >= 99.9 && rect.y + rect.h >= 99.9 ? "var(--mw-outer)" : "var(--mw-inner)" }} onPointerDown={(e: any) => { movedRef.current = false; startX.current = e.clientX; startY.current = e.clientY }} onPointerMove={(e: any) => { if (Math.abs(e.clientX - startX.current) > 6 || Math.abs(e.clientY - startY.current) > 6) movedRef.current = true }} onClick={(e: any) => { if (movedRef.current) return; e.stopPropagation(); selectVj(String(vj.id)) }} aria-label={`Preview ${vj.vj}`}>
        <span className="mw-fade" />
        {isMost && <span className="mw-crown">👑 MOST VIEWED</span>}
        <span className="mw-vj">{vj.vj}</span>
        <span className="mw-views">{formatViews(vj.views || 0)} views</span>
        {isActive && isArmed && <span className="mw-flash" key={String(activeVjId)} />}
        {isActive && isArmed && <span className="mw-dot" />}
      </button>) }) }
  </div>) }

