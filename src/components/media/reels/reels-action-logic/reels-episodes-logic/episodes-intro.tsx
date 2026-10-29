"use client"

import { useEffect, useState } from "react"

const API_URL = "https://movie-creation-portal-api.connectu89.workers.dev/movies"

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
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : data.movies || []
        const found = list.find((m: any) => String(m.id) === id)
        if (found) {
          setFetched(found)
          try { sessionStorage.setItem(`movie_preload_${id}`, JSON.stringify(found)) } catch {}
        }
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [id, missing])

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
    return movie.cast.slice(0, 8).map((c: any) => {
      if (typeof c === "string") return { name: c, photo: null }
      return {
        name: c?.name || c?.actor || c?.fullName || String(c),
        photo: c?.photo || c?.image || c?.avatar || c?.profile_path || c?.headshot || null,
      }
    })
  }
  let rawActors = movie?.actors
  if (typeof rawActors === "string") {
    try {
      const parsed = JSON.parse(rawActors)
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 8).map((c: any) =>
          typeof c === "string" ? { name: c, photo: null } : { name: c?.name || String(c), photo: c?.photo || null }
        )
      }
    } catch {}
    return rawActors.split(",").map((a: string) => a.trim()).filter(Boolean).slice(0, 8).map((name) => ({ name, photo: null }))
  }
  return []
}

function getPreviewCount(movie: any): number {
  let previews: any = movie?.preview_urls
  if (typeof previews === "string") { try { previews = JSON.parse(previews) } catch { previews = [] } }
  let count = Array.isArray(previews) ? previews.length : 0
  let seasons: any = movie?.seasons
  if (typeof seasons === "string") { try { seasons = JSON.parse(seasons) } catch {} }
  if (Array.isArray(seasons)) {
    for (const s of seasons) {
      if (Array.isArray(s.episodes)) {
        for (const ep of s.episodes) {
          if (ep.preview_url) count++
        }
      }
    }
  }
  return count
}

export function EpisodesIntro({ movie: reelMovie, movieId }: { movie: any; movieId?: string }) {
  const movie = useFullMovie(reelMovie, movieId)
  const cast = parseCastFromMovie(movie)
  const previewCount = getPreviewCount(movie)
  const pills = [
    { text: movie?.genre, strong: true },
    { text: movie?.vj ? `VJ ${movie.vj}` : null },
    { text: movie?.year || "2024" },
    { text: movie?.type || "Single" },
    { text: previewCount ? `${previewCount} previews` : null },
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
          <div className="reps-cast-header">Cast ({cast.length})</div>
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
