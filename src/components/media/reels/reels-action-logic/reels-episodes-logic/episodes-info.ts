/**
 * Series detection + episode data for the reels episodes panel.
 */

export const FORCE_SHOW = false
export const DUMB_TOTAL_EPISODES = 65
export const DUMB_FREE_EPISODES = 5

export type EpisodeInfo = {
  isSeries: boolean
  title: string
  poster: string
  overview: string
  totalEpisodes: number
  freeEpisodes: number
}

function parseSeasons(movie: any): any[] {
  let seasons: any = movie?.seasons
  if (typeof seasons === "string") {
    try { seasons = JSON.parse(seasons) } catch { seasons = [] }
  }
  return Array.isArray(seasons) ? seasons : []
}

export function getAllEpisodes(movie: any): any[] {
  const seasons = parseSeasons(movie)
  return seasons.flatMap((s: any) => s.episodes || []) || []
}

const TYPE_FIELDS = ["type", "category", "kind", "media_type", "content_type", "format"]

function hasSeriesType(movie: any): boolean {
  return TYPE_FIELDS.some((f) => {
    const v = movie?.[f]
    return typeof v === "string" && /series/i.test(v.replace(/[_-]/g, " "))
  })
}

function hasSeriesTypeValue(movie: any): boolean {
  const t = String(movie?.type ?? "").trim().toLowerCase()
  return t === "mini" || t === "full"
}

export function isSeriesMovie(movie: any): boolean {
  if (!movie) return false
  const allEps = getAllEpisodes(movie)
  const seasons = parseSeasons(movie)
  const hasEpisodes = seasons.length > 0 && allEps.length > 1
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
