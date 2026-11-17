"use client"

import { useEffect, useMemo, useState } from "react"
import { isGuestUser, openSignInModal } from "../../../../auth-system/movie-locker-if-guest"

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies"
const RANGE_SIZE = 50

/**
 * fullscreen-list-eps-grid.tsx - SMALL TILES ONLY, own buttons, REAL MOVIE FETCH.
 * WHY IT WAS BROKEN:
 *  - Drawer passes a preload / similar-card object: no seasons in it.
 *  - getEpisodeInfo (from reels) on that preload -> isSeries false / wrong total.
 *  - allEps = [] -> tile N mapped to undefined -> ?ep=N -> nothing plays.
 * FIX: fetch the REAL movie by id from the same API similar uses,
 * then use REAL movie.seasons. Do NOT trust the passed preload for seasons.
 * ACTIVE FIX: isActive compares currentEpisode to real ep.id AND ep.episode_number AND tile number n.
 * So whether parent passes id (8421) or position (3), the right tile lights up and updates on every goToEp.
 * DNA COLOR: uses theme vars only — hsl(var(--primary)) / --primary-text for active tile + active range,
 * hsl(var(--surface)) / --text / --border for inactive, hsl(var(--text-muted)) for subtitle.
 * No hardcoded #fff / #000 / rgba(22,22,24). Follows Dark / Light / Dark-Green / Light-Green / Dark-Red.
 * Do NOT use getEpisodeInfo from reels for movies - it was built for reels.
 */
export default function FullscreenListEpsGrid({ movie, currentEpisode, onSelectEpisode }: {
  movie: any
  currentEpisode?: number | string | null
  onSelectEpisode?: (movieId: string, episode: string | number) => void
}) {
  const [range, setRange] = useState(0)
  const [realMovie, setRealMovie] = useState<any>(null)
  useEffect(() => { setRange(0); setRealMovie(null) }, [movie?.id])

  // FETCH REAL MOVIE - same API as similar. Tapped to real movie, not preload.
  useEffect(() => {
    const id = String(movie?.id || "")
    if (!id) return
    let cancelled = false
    fetch(API_URL, { cache: "no-store" })
      .then((r) => r.json())
      .then((all: any[]) => {
        if (cancelled) return
        const found = (all || []).find((m: any) => String(m.id) === id)
        if (found) setRealMovie(found)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [movie?.id])

  // REAL movie wins, preload is only a fallback while fetching.
  const full = realMovie || movie

  const allEps = useMemo(() => {
    const seasons = full?.seasons || []
    return seasons.flatMap((s: any, sIdx: number) => {
      const eps = s.episodes || []
      return eps.map((ep: any) => ({ ...ep, _seasonName: s.name || `Season ${sIdx + 1}` }))
    })
  }, [full])

  // IS SERIES? From REAL movie, not reels helper: has seasons with episodes.
  const totalFromSeasons = allEps.length
  const totalFromMovie = Number(full?.totalEpisodes || full?.episodeCount || full?.episodes?.length || 0)
  const total = totalFromSeasons > 0 ? totalFromSeasons : totalFromMovie
  const isSeries = totalFromSeasons > 1 || totalFromMovie > 1 || (full?.seasons?.length || 0) > 0
  if (!isSeries) return null

  const rangeCount = Math.max(1, Math.ceil(total / RANGE_SIZE))
  const ranges = Array.from({ length: rangeCount }, (_, i) => {
    const start = i * RANGE_SIZE + 1
    const end = Math.min(total, (i + 1) * RANGE_SIZE)
    return { start, end, label: `${start}-${end}` }
  })
  const active = ranges[Math.min(range, ranges.length - 1)]
  const movieName = full?.title || full?.name || ""
  const seasonLabel = allEps.length > 0
    ? (allEps[Math.max(0, active.start - 1)]?._seasonName || `Season 1`)
    : ((full?.seasons?.length || 0) > 1 ? `Season 1 - Season ${full.seasons.length}` : "Season 1")

  // TILE N -> EXACT EPISODE from REAL movie. Plain button onClick, always fires.
  const playExactEpisode = (n: number) => {
    if (isGuestUser()) { openSignInModal(); return }
    const real = allEps[n - 1]
    const exact = real ? (real.id ?? real.episode_number ?? n) : n
    onSelectEpisode?.(String(full?.id), exact)
  }

  const tiles: number[] = []
  for (let n = active.start; n <= active.end; n++) tiles.push(n)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "2px 2px 2px 2px" }}>
        <div style={{ color: "hsl(var(--text))", fontSize: 16, fontWeight: 800, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{movieName}</div>
        <div style={{ color: "hsl(var(--text-muted))", fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{seasonLabel} - {total} Episodes</div>
      </div>
      {ranges.length > 1 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ranges.map((r, i) => (
            <button key={r.label} type="button" onClick={() => setRange(i)}
              style={{ padding: "7px 14px", borderRadius: 999, cursor: "pointer", background: i === range ? "hsl(var(--primary))" : "hsl(var(--surface))", color: i === range ? "hsl(var(--primary-text))" : "hsl(var(--text))", border: i === range ? "1px solid hsl(var(--primary))" : "1px solid hsl(var(--border))", fontSize: 12, fontWeight: 700, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: i === range ? "0 2px 10px rgba(0,0,0,0.45)" : "0 2px 8px rgba(0,0,0,0.35)" }}>
              {r.label}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, width: "100%" }}>
        {tiles.map((n) => {
          const _ep = allEps[n - 1]
          const isActive = currentEpisode != null && _ep != null && (String(currentEpisode) === String((_ep as any).id) || String(currentEpisode) === String((_ep as any).episode_number) || Number(currentEpisode) === Number(n))
          return (
            <button key={n} type="button" onClick={() => playExactEpisode(n)}
              style={{ width: 44, height: 44, minWidth: 44, borderRadius: 10, cursor: "pointer", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700, background: isActive ? "hsl(var(--primary))" : "hsl(var(--surface))", color: isActive ? "hsl(var(--primary-text))" : "hsl(var(--text))", border: isActive ? "1px solid hsl(var(--primary))" : "1px solid hsl(var(--border))", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
              {n}
            </button>
          )
        })}
      </div>
    </div>
  )
}

