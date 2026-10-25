"use client"

import { useEffect, useState } from "react"

/**
 * Introduction tab for the episodes panel.
 * Same data and layout as VideoMetaInfo on the watch page: pills, description, cast.
 * Styles live in ../../reels-episodes-panel.css (reps-intro-*).
 *
 * Data source: the watch page gets `movie` from this API list (found by id) and
 * reads movie.description / genre / vj / cast straight off it. If the reels movie
 * object is missing those fields, we load the same record the same way:
 * sessionStorage `movie_preload_<id>` first, then the API list.
 */

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies"

function useFullMovie(movie: any, movieId?: string) {
  const [fetched, setFetched] = useState<any>(null)
  const id = String(movieId ?? movie?.id ?? "")
  const missing = !movie?.description

  useEffect(() => {
    setFetched(null)
    if (!id || !missing) return
    let cancelled = false

    try {
      const cached = sessionStorage.getItem(`movie_preload_${id}`)
      const parsed = cached ? JSON.parse(cached) : null
      if (parsed?.description) {
        setFetched(parsed)
        return
      }
    } catch {}

    fetch(API_URL, { cache: "no-store" })
      .then((r) => r.json())
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return
        const found = list.find((m: any) => String(m.id) === id)
        if (found) {
          setFetched(found)
          try { sessionStorage.setItem(`movie_preload_${id}`, JSON.stringify(found)) } catch {}
        }
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [id, missing])

  // reels data wins, fetched record only fills the gaps
  return fetched ? { ...fetched, ...stripEmpty(movie) } : movie
}

function stripEmpty(obj: any) {
  const out: any = {}
  for (const k of Object.keys(obj || {})) {
    const v = obj[k]
    if (v !== undefined && v !== null && v !== "") out[k] = v
  }
  return out
}

export function parseCastFromMovie(movie: any): { name: string; photo: string | null }[] {
  if (Array.isArray(movie?.cast) && movie.cast.length > 0) {
    return movie.cast.slice(0, 4).map((c: any) => {
      if (typeof c === "string") return { name: c, photo: null }
      return {
        name: c?.name || c?.actor || c?.fullName || String(c),
        photo: c?.photo || c?.image || c?.avatar || c?.profile_path || c?.headshot || null,
      }
    })
  }
  const rawActors = String(movie?.actors || movie?.cast || "").trim()
  if (!rawActors) return []
  try {
    const parsed = JSON.parse(rawActors)
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 4).map((c: any) =>
        typeof c === "string"
          ? { name: c, photo: null }
          : { name: c?.name || String(c), photo: c?.photo || null }
      )
    }
  } catch {}
  return rawActors
    .split(",")
    .map((a: string) => a.trim())
    .filter(Boolean)
    .slice(0, 4)
    .map((name) => ({ name, photo: null }))
}

export function EpisodesIntro({ movie: reelMovie, movieId }: { movie: any; movieId?: string }) {
  const movie = useFullMovie(reelMovie, movieId)
  const cast = parseCastFromMovie(movie)
  const pills = [
    { text: movie?.genre, strong: true },
    { text: movie?.vj },
    { text: movie?.year || "2024" },
    { text: movie?.rating || "HD" },
  ].filter((p) => !!p.text)

  return (
    <div className="reps-intro-wrap">
      {pills.length > 0 && (
        <div className="reps-intro-pills">
          {pills.map((p, i) => (
            <span key={i} className={`reps-intro-pill ${p.strong ? "" : "muted"}`}>
              {p.text}
            </span>
          ))}
        </div>
      )}

      <p className="reps-intro">{movie?.description || "No description available."}</p>

      {cast.length > 0 && (
        <div className="reps-cast">
          <div className="reps-cast-header">Cast</div>
          <div className="reps-cast-list">
            {cast.map((m, i) => (
              <div key={`${m.name}-${i}`} className="reps-cast-item" title={m.name}>
                <div className="reps-cast-avatar">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={m.name} className="reps-cast-img" />
                  ) : (
                    <span className="reps-cast-fallback">{m.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="reps-cast-name">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EpisodesIntro

