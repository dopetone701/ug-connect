import { Movie, Section } from "./types"
import { filters } from "./filters"

export const getSections = (movies: Movie[], user: { favIds: any[]; recentIds: any[] }): Section[] => {
  // Keep normal rows as Single only, so Full/Mini don't duplicate
  const singles = movies.filter((m:any) => !m.type || m.type === "Single")
  const base = singles.length > 0 ? singles : movies

  return [
    { id:'latest', title:'latest movies', data: base.slice(0,12) },
    { id:'action', title:'action movies', data: filters.action(base) },
    { id:'scifi', title:'sci-fi', data: filters.scifi(base) },
    { id:'adventure', title:'adventure', data: filters.adventure(base) },
    { id:'romantic', title:'romantic', data: filters.romantic(base) },
    { id:'mostWatched', title:'most watched', data: filters.mostWatched(base) },
    { id:'mostLiked', title:'most liked', data: filters.mostLiked(base) },
    { id:'editors', title:"editor's pick", data: filters.editorsPick(base) },
    { id:'recent', title:'continue watching', data: filters.recentWatched(movies, user.recentIds), hidden: user.recentIds.length===0 },
    { id:'fav', title:'your favourites', data: filters.favourites(movies, user.favIds), hidden: user.favIds.length===0 },
  ]
}
