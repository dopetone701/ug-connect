import { Movie } from "./types"

export const filters = {
  action: (m: Movie[]) => m.filter(x => (x.genre||"").toLowerCase().includes('action')),
  scifi: (m: Movie[]) => m.filter(x => /sci|space|future/i.test(x.genre||"")),
  adventure: (m: Movie[]) => m.filter(x => /adventure/i.test(x.genre||"")),
  romantic: (m: Movie[]) => m.filter(x => /roman|love|rom-com/i.test(x.genre||"")),
  comedy: (m: Movie[]) => m.filter(x => /comedy/i.test(x.genre||"")),

  mostWatched: (m: Movie[]) => [...m].sort((a,b) => (b.views||0)-(a.views||0)).slice(0,12),
  mostLiked: (m: Movie[]) => [...m].sort((a,b) => (b.likes||0)-(a.likes||0)).slice(0,12),
  editorsPick: (m: Movie[]) => m.filter(x => x.isEditorsPick),
  recentAdded: (m: Movie[]) => [...m].sort((a,b) => new Date(b.createdAt||0).getTime() - new Date(a.createdAt||0).getTime()).slice(0,12),

  favourites: (m: Movie[], favIds: number[]) => m.filter(x => favIds.includes(x.id)),
  recentWatched: (m: Movie[], recentIds: number[]) => recentIds.map(id => m.find(v=>v.id===id)).filter(Boolean) as Movie[],
}
