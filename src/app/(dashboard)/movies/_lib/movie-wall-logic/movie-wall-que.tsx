"use client"
import { useEffect, useRef, useState } from "react"
import { getWallLayout } from "./movie-wall-shapes-logic"
import type { BattleGroup } from "./movie-wall-groups"

// ============================================================
// MOVIE-WALL-QUE — the cheat
// Download video FULLY once -> Blob -> local object URL
// Play from local, not from network. Tiles never lag,
// even with no internet after download.
// Keeps nearest 5, deletes the rest when you switch.
// NEVER hardcodes tile count — always asks shape logic first.
// ============================================================
const MAX_KEEP = 5
type QueEntry = { url: string; lastUsed: number }
const queCache = new Map<string, QueEntry>()
const quePending = new Map<string, Promise<string | null>>()
const queControllers = new Map<string, AbortController>()

function queEvict() {
  if (queCache.size <= MAX_KEEP) return
  const sorted = [...queCache.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed)
  for (const [key, e] of sorted.slice(0, queCache.size - MAX_KEEP)) {
    try { URL.revokeObjectURL(e.url) } catch {}
    queCache.delete(key)
  }
}

export function queGetSize() { return queCache.size }
export function queHas(src: string) { return queCache.has(src) }

export async function queGetVideoUrl(src: string): Promise<string | null> {
  if (!src) return null
  const hit = queCache.get(src)
  if (hit) { hit.lastUsed = Date.now(); return hit.url }
  const pending = quePending.get(src)
  if (pending) return pending
  const ctrl = new AbortController()
  queControllers.set(src, ctrl)
  const job = (async () => {
    try {
      const res = await fetch(src, { signal: ctrl.signal })
      if (!res.ok) return null
      const blob = await res.blob()
      if (ctrl.signal.aborted) return null
      const url = URL.createObjectURL(blob)
      queCache.set(src, { url, lastUsed: Date.now() })
      queEvict()
      return url
    } catch { return null }
    finally { quePending.delete(src); queControllers.delete(src) }
  })()
  quePending.set(src, job)
  return job
}

// Buffer the nearest 5 — call from Shell when armedKey changes
export function quePrefetch(srcs: string[]) {
  for (const s of srcs) { if (!s) continue; if (queCache.has(s) || quePending.has(s)) continue; queGetVideoUrl(s).catch(() => {}) }
}

// Delete everything except the keep-list — call on switch
export function queKeepOnly(srcs: string[]) {
  const keep = new Set(srcs)
  for (const [key, e] of [...queCache.entries()]) { if (!keep.has(key)) { try { URL.revokeObjectURL(e.url) } catch {}; queCache.delete(key) } }
  for (const [key, c] of [...queControllers.entries()]) { if (!keep.has(key)) { try { c.abort() } catch {}; queControllers.delete(key); quePending.delete(key) } }
}

export function queClear() { for (const [, e] of queCache) { try { URL.revokeObjectURL(e.url) } catch {} } ; queCache.clear(); for (const [, c] of queControllers) { try { c.abort() } catch {} }; queControllers.clear(); quePending.clear() }

// Shape logic FIRST — how many tiles, what rects. No guard, any n works.
export function queGetLayout(group: BattleGroup) { return getWallLayout(group.vjs.length) }

// Hook for Body: download fully, then feed ONE local stream to all tiles.
// Body still slices with getTileMediaStyle(rect) from YOUR Body file —
// que only swaps the src from remote -> local blob URL.
export function useMovieWallQue(src: string | undefined, enabled: boolean) {
  const [localUrl, setLocalUrl] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const alive = useRef(true)
  useEffect(() => { alive.current = true; return () => { alive.current = false } }, [])
  useEffect(() => {
    if (!enabled || !src) { setLocalUrl(null); setReady(false); return }
    setReady(false)
    let cancelled = false
    queGetVideoUrl(src).then((url) => { if (!cancelled && alive.current && url) { setLocalUrl(url); setReady(true) } })
    return () => { cancelled = true }
  }, [src, enabled])
  return { localUrl, ready }
}