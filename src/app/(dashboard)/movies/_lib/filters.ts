import { Movie } from "./types"

// Handles: "Thriller" | "Action, Thriller" | "action / thriller" | "Thrillers"
const hasGenre = (m: Movie, ...keywords: string[]) => {
  const g = (m.genre || "").toLowerCase()
  return keywords.some(k => g.includes(k))
}

export const filters = {
  // Generic - use this for ALL genres now
  byGenre: (m: Movie[], ...keywords: string[]) =>
    m.filter(x => hasGenre(x, ...keywords)),

  // Keep old ones so nothing else breaks
  action: (m: Movie[]) => m.filter(x => hasGenre(x, "action")),
  scifi: (m: Movie[]) => m.filter(x => /sci|space|future/i.test(x.genre || "")),
  adventure: (m: Movie[]) => m.filter(x => hasGenre(x, "adventure")),
  romantic: (m: Movie[]) => m.filter(x => /roman|love|rom-com/i.test(x.genre || "")),
  comedy: (m: Movie[]) => m.filter(x => hasGenre(x, "comedy")),
  thriller: (m: Movie[]) => m.filter(x => hasGenre(x, "thrill")),
  horror: (m: Movie[]) => m.filter(x => hasGenre(x, "horror")),
  drama: (m: Movie[]) => m.filter(x => hasGenre(x, "drama")),
  crime: (m: Movie[]) => m.filter(x => hasGenre(x, "crime")),
  mystery: (m: Movie[]) => m.filter(x => hasGenre(x, "mystery")),
  fantasy: (m: Movie[]) => m.filter(x => hasGenre(x, "fantasy")),
  family: (m: Movie[]) => m.filter(x => hasGenre(x, "family")),
  history: (m: Movie[]) => m.filter(x => hasGenre(x, "history")),
  war: (m: Movie[]) => m.filter(x => hasGenre(x, "war")),

  mostWatched: (m: Movie[]) => [...m].sort((a,b) => (b.views||0)-(a.views||0)).slice(0,12),
  mostLiked: (m: Movie[]) => [...m].sort((a,b) => (b.likes||0)-(a.likes||0)).slice(0,12),
  editorsPick: (m: Movie[]) => m.filter(x => x.isEditorsPick),
  recentAdded: (m: Movie[]) => [...m].sort((a,b) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()).slice(0,12),

  favourites: (m: Movie[], favIds: any[]) => m.filter(x => favIds.map(String).includes(String(x.id))),
  recentWatched: (m: Movie[], recentIds: any[]) => recentIds.map(id => m.find(v=>String(v.id)===String(id))).filter(Boolean) as Movie[],
}
