/**
 * Series detection + episode data for the reels episodes panel.
 *
 * Detection mirrors the watch page exactly:
 *   allEps   = movie.seasons.flatMap(s => s.episodes || [])
 *   isSeries = movie.seasons.length > 0 && allEps.length > 1
 *
 * DUMB MODE: the reels movie has no episode count yet, so the panel shows
 * placeholder numbers. Flip these flags when real data is available.
 */

// Show the panel for every movie (ignore series detection). Handy for testing.
export const FORCE_SHOW = false
// Placeholder count used when the movie has no real episodes.
export const DUMB_TOTAL_EPISODES = 65
// Episodes up to this number are free; the rest show the VIP badge.
// 5 = episodes 1-5 free, VIP banner from episode 6 onward.
export const DUMB_FREE_EPISODES = 5

export type EpisodeInfo = {
  isSeries: boolean
  title: string
  poster: string
  overview: string
  totalEpisodes: number
  freeEpisodes: number
}

export function getAllEpisodes(movie: any): any[] {
  return movie?.seasons?.flatMap((s: any) => s.episodes || []) || []
}

// Fields that may hold "TV Series" / "Mini Series" on a movie. Edit to match your data.
const TYPE_FIELDS = ["type", "category", "kind", "media_type", "content_type", "format"]

function hasSeriesType(movie: any): boolean {
  return TYPE_FIELDS.some((f) => {
    const v = movie?.[f]
    return typeof v === "string" && /series/i.test(v.replace(/[_-]/g, " "))
  })
}

// The create-movie modal saves type as "Single" | "Mini" (Mini-Series) | "Full" (TV Series).
function hasSeriesTypeValue(movie: any): boolean {
  const t = String(movie?.type ?? "").trim().toLowerCase()
  return t === "mini" || t === "full"
}

export function isSeriesMovie(movie: any): boolean {
  if (!movie) return false
  const allEps = getAllEpisodes(movie)
  const hasEpisodes = movie?.seasons?.length > 0 && allEps.length > 1
  return hasEpisodes || hasSeriesTypeValue(movie) || hasSeriesType(movie)
}

export function getEpisodeInfo(movie: any): EpisodeInfo {
  const realEps = getAllEpisodes(movie)

  return {
    isSeries: FORCE_SHOW || isSeriesMovie(movie),
    title: movie?.title ?? movie?.name ?? "",
    poster: movie?.cover ?? movie?.cover_url ?? movie?.poster ?? movie?.poster_url ?? movie?.thumbnail ?? "",
    overview: movie?.description ?? movie?.overview ?? movie?.synopsis ?? "",
    totalEpisodes: realEps.length > 0 ? realEps.length : DUMB_TOTAL_EPISODES,
    freeEpisodes: DUMB_FREE_EPISODES,
  }
}

