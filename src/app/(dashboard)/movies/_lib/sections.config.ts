import { Movie, Section } from "./types"
import { filters } from "./filters"
import { GENRES } from "./genre-filter"

const GENRE_KEYWORDS: Record<string, string[]> = {
  action: ["action"],
  adventure: ["adventure"],
  animations: ["anim"],
  cartoon: ["cartoon"],
  comedy: ["comedy"],
  crime: ["crime"],
  drama: ["drama"],
  family: ["family"],
  fantasy: ["fantasy"],
  "high-school": ["high school", "high-school"],
  history: ["history"],
  horror: ["horror"],
  "love-story": ["love story", "love-story"],
  mystery: ["mystery"],
  detective: ["detective"],
  race: ["race", "racing"],
  romantic: ["roman", "love", "rom-com"],
  scifi: ["sci", "space", "future"],
  thriller: ["thrill"],
  "true-story": ["true story", "true-story", "based on"],
  war: ["war"],
}

export const getSections = (movies: Movie[], user: { favIds: any[]; recentIds: any[] }): Section[] => {
  const singles = movies.filter((m:any) => !m.type || m.type === "Single")
  const base = singles.length > 0 ? singles : movies

  // Fixed rows stay Singles-only so you don't duplicate series in Latest / Most Watched
  const fixed: Section[] = [
    { id:'latest', title:'latest movies', data: base.slice(0,12) },
    { id:'mostWatched', title:'most watched', data: filters.mostWatched(base) },
    { id:'mostLiked', title:'most liked', data: filters.mostLiked(base) },
    { id:'editors', title:"editor's pick", data: filters.editorsPick(base) },
  ]

  // GENRE ROWS: use `movies` (ALL) — Single + Full + Mini
  // This is the change: series now belong to their genre
  const genreSections: Section[] = GENRES
    .filter(g => g.id !== "all")
    .map(g => {
      const keywords = GENRE_KEYWORDS[g.id] || [g.id, g.label.toLowerCase()]
      const data = filters.byGenre(movies, ...keywords) // <-- was `base`, now `movies`
      return {
        id: g.id,
        title: g.id === "action" ? "action movies" : g.label.toLowerCase(),
        data,
      }
    })
    .filter(s => s.data.length > 0)

  const userSections: Section[] = [
    { id:'recent', title:'continue watching', data: filters.recentWatched(movies, user.recentIds), hidden: user.recentIds.length===0 },
    { id:'fav', title:'your favourites', data: filters.favourites(movies, user.favIds), hidden: user.favIds.length===0 },
  ]

  return [...fixed, ...genreSections, ...userSections]
}
