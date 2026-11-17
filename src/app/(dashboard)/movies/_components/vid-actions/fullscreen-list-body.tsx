"use client"

import { useEffect, useMemo, useState } from "react"
import FullscreenListCard from "./fullscreen-list-card"
import FullscreenListSkeleton from "./fullscreen-list-skeleton"
import FullscreenListEpsGrid from "./fullscreen-list-eps-grid"
import type { Movie } from "../../_lib/types"
import { getEpisodeInfo } from "../../../../../components/media/reels/reels-action-logic/reels-episodes-logic/episodes-info"

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies"

// DATA-ARRIVED = ON POINT. No card-rendered wait, no 500ms fade, no flicker.
// Skeleton and real cards swap in the SAME React commit:
// setMovies(list) + setIsLoading(false) are batched, so skeleton unmounts
// and real cards mount in the same frame. No fade in/out moment, no second loading.

// EPS INJECTION — does NOT damage similar system:
// - Similar fetch / filter / skeleton / render below is UNTOUCHED, byte-for-byte your version.
// - Only addition: if isSeries, we SKIP the similar fetch and render EpsGrid instead.
// - If movie, EpsGrid unmounts (not rendered at all), similar runs exactly as before.

export default function FullscreenListBody({ current, onSelect, onSelectEpisode, currentEpisode }: {
  current: Movie
  onSelect?: (m: Movie) => void
  onSelectEpisode?: (movieId: string, episode: string | number) => void
  currentEpisode?: number
}) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // SIMILAR IN SERIES IS INTENTIONAL — not auto. Default: eps only. Button below flips it.
  const [showSimilar, setShowSimilar] = useState(false)

  useEffect(() => { setShowSimilar(false) }, [current?.id])

  // EPS CHECK ONLY — no similar logic here.
  const info = useMemo(() => getEpisodeInfo(current as any), [current])
  const isSeries = !!info.isSeries

  useEffect(() => {
    if (!current?.id) return
    // SERIES + NOT intentional: skip similar fetch. Similar unmounts, EpsGrid mounts.
    // SERIES + INTENTIONAL (button tapped): fetch similar — EpsGrid unmounts, similar mounts.
    if (isSeries && !showSimilar) {
      setMovies([])
      setIsLoading(false)
      return
    }
    // ===== SIMILAR SYSTEM — UNTOUCHED, YOUR EXACT CODE =====
    setIsLoading(true)
    setMovies([])
    fetch(API_URL, { cache: "no-store" })
      .then((r) => r.json())
      .then((all: Movie[]) => {
        const others = all.filter((m) => String(m.id) !== String(current.id))
        let list = others.filter((m) => m.genre?.toLowerCase().trim() === current.genre?.toLowerCase().trim())
        if (list.length < 8 && (current as any).vj) {
          const byVj = others.filter((m) => m.vj?.toLowerCase().trim() === (current as any).vj?.toLowerCase().trim())
          const seen = new Set(list.map((x) => String(x.id)))
          list = [...list, ...byVj.filter((x) => !seen.has(String(x.id)))]
        }
        if (list.length < 8) {
          const seen = new Set(list.map((x) => String(x.id)))
          list = [...list, ...others.filter((x) => !seen.has(String(x.id)))].slice(0, 12)
        }
        // SAME COMMIT: skeleton out, cards in. No overlay, no fade.
        setMovies(list.slice(0, 12))
        setIsLoading(false)
      })
      .catch(() => { setIsLoading(false) })
    // ===== END SIMILAR SYSTEM =====
  }, [current, isSeries, showSimilar])

  const showSkeleton = isLoading || movies.length === 0

  return (
    <div
      style={{
        position: "relative",
        flexGrow: 0, flexShrink: 0, flexBasis: "auto", width: "100%", height: "auto",
        overflow: "visible",
        display: "flex", flexDirection: "column", gap: 14,
        padding: "16px 12px 24px 34%", boxSizing: "border-box",
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* SERIES + EPS: EpsGrid ONLY + button below. Similar NOT rendered -> unmounted. */}
      {isSeries && !showSimilar ? (
        <>
          <FullscreenListEpsGrid
            key={`eps-${String(current.id)}`}
            movie={current}
            currentEpisode={currentEpisode}
            onSelectEpisode={onSelectEpisode}
          />
          <button type="button" onClick={() => setShowSimilar(true)}
            style={{ marginTop: 6, width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.38)", background: "rgba(22,22,24,0.82)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>
            Explore similar movies
          </button>
        </>
      ) : isSeries && showSimilar ? (
        <>
          {showSkeleton ? (
            <FullscreenListSkeleton count={10} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
              {movies.map((m) => (
                <FullscreenListCard key={String(m.id)} m={m} onSelect={onSelect} />
              ))}
            </div>
          )}
          <button type="button" onClick={() => setShowSimilar(false)}
            style={{ marginTop: 6, width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.38)", background: "rgba(22,22,24,0.82)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>
            Back to episodes
          </button>
        </>
      ) : showSkeleton ? (
        // MOVIE + LOADING: skeleton — same container, same padding, same gap, same YT geometry.
        <FullscreenListSkeleton count={10} />
      ) : (
        // MOVIE + LOADED: similar — opacity 1, no fade. Appears the exact frame data arrives.
        // EpsGrid is NOT rendered here -> unmounted.
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
          {movies.map((m) => (
            <FullscreenListCard key={String(m.id)} m={m} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

