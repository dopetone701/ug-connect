import { Movie, Section } from "./types"
import { filters } from "./filters"

export const getSections = (movies: Movie[], user: { favIds: number[]; recentIds: number[] }): Section[] => [
  { id:'latest', title:'latest movies', data: movies.slice(0,12) },
  { id:'action', title:'action movies', data: filters.action(movies) },
  { id:'scifi', title:'sci-fi', data: filters.scifi(movies) },
  { id:'adventure', title:'adventure', data: filters.adventure(movies) },
  { id:'romantic', title:'romantic', data: filters.romantic(movies) },
  { id:'mostWatched', title:'most watched', data: filters.mostWatched(movies) },
  { id:'mostLiked', title:'most liked', data: filters.mostLiked(movies) },
  { id:'editors', title:"editor's pick", data: filters.editorsPick(movies) },
  // conditional - auto hidden if empty
  { id:'recent', title:'continue watching', data: filters.recentWatched(movies, user.recentIds), hidden: user.recentIds.length===0 },
  { id:'fav', title:'your favourites', data: filters.favourites(movies, user.favIds), hidden: user.favIds.length===0 },
]
