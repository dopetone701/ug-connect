"use client"
import { useMemo } from "react"
import { useGlobalSearch } from "@/stores/use-global-search"
import MovieRow from "../movie-row"

type ActorViewBodyProps = {
  actorId: string
  actor: { actorId?: string | null; name: string; photo: string | null }
  onClose?: () => void
}

const norm = (s: string) =>
  String(s || "").trim().toLowerCase().normalize("NFKD").replace(/\s+/g, " ").replace(/[^\p{L}\p{N}\s]/gu, "").trim()

// Same as VideoMetaInfo: R2 key -> https, https stays as-is
function resolvePhoto(photo: string | null) {
  if (!photo) return null
  if (photo.startsWith("http") || photo.startsWith("blob:") || photo.startsWith("data:")) return photo
  return `https://movie-server-api.connectu89.workers.dev/r2/${photo.replace(/^\/+/, "")}`
}

// Same as FadersTiles: actors is a comma string "Tom, Sarah"
// But also handle cast[] array form, like VideoMetaInfo does
function movieHasActor(movie: any, targetNorm: string) {
  if (Array.isArray(movie?.cast) && movie.cast.length > 0) {
    return movie.cast.some((c: any) => {
      const name = typeof c === "string" ? c : c?.name || c?.actor || c?.fullName || ""
      return norm(name) === targetNorm
    })
  }
  return String(movie?.actors || movie?.cast || "")
    .split(",")
    .some((a: string) => norm(a) === targetNorm)
}

export function ActorViewBody({ actorId, actor, onClose }: ActorViewBodyProps) {
  const { allMovies } = useGlobalSearch() as any

  const target = useMemo(() => norm(actor.name), [actor.name])

  // All movies available for him in R2 / allMovies — same filter as FadersTiles
  const movies = useMemo(() => {
    if (!Array.isArray(allMovies)) return []
    return allMovies.filter((m: any) => movieHasActor(m, target))
  }, [allMovies, target])

  const photo = resolvePhoto(actor.photo)
  const initial = actor.name.charAt(0).toUpperCase()

  return (
    <div className="actor-view-body">
      {/* 1. IMAGE — blends into bg */}
      <div className="actor-view-hero">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={actor.name} className="actor-view-hero-img" />
        ) : (
          <div className="actor-view-hero-fallback">{initial}</div>
        )}
        <div className="actor-view-hero-fade" />
        <div className="actor-view-hero-text">
          <div className="actor-view-hero-name">{actor.name}</div>
          <div className="actor-view-hero-count">
            {movies.length} {movies.length === 1 ? "movie" : "movies"} available
          </div>
        </div>
      </div>

      {/* 2. ROW BELOW — the app's own row + cards, not custom cards */}
      {movies.length > 0 ? (
        <div onClickCapture={() => onClose?.()}>
          <MovieRow title={`${actor.name} movies`} movies={movies} />
        </div>
      ) : (
        <p className="actor-view-empty">No movies found for {actor.name}.</p>
      )}
    </div>
  )
}

