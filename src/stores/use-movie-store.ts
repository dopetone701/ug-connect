"use client"
import { create } from "zustand"

export type UserList = {
  id: string
  name: string
  movieIds: any[]
}

type MovieStore = {
  favIds: any[]
  recentIds: any[]
  lists: UserList[]
  hydrated: boolean
  toggleFav: (id: any) => void
  addRecent: (id: any) => void
  createList: (name: string) => void
  deleteList: (id: string) => void
  addMovieToList: (listId: string, movieId: any) => void
  addToList: (listId: string, movieId: any) => void
  toggleListMovie: (listId: string, movieId: any) => void
  addToMyList: (movieId: any) => void
  removeFromMyList: (movieId: any) => void
  _hydrate: () => void
}

const LS_FAV = "ug-fav-ids"
const LS_RECENT = "ug-recent-ids"
const LS_LISTS = "ug-lists"

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw? JSON.parse(raw) : fallback
  } catch { return fallback }
}

export const useMovieStore = create<MovieStore>((set, get) => ({
  favIds: [],
  recentIds: [],
  lists: [{ id: "my-list", name: "My List", movieIds: [] }],
  hydrated: false,

  _hydrate: () => {
    const fav = readLS<any[]>(LS_FAV, [])
    const recent = readLS<any[]>(LS_RECENT, [])
    let l = readLS<UserList[]>(LS_LISTS, [{ id: "my-list", name: "My List", movieIds: [] }])
    if (!l.find(x=>x.id==="my-list")) {
      l = [{ id: "my-list", name: "My List", movieIds: [] },...l]
    }
    set({ favIds: fav, recentIds: recent, lists: l, hydrated: true })
  },

  toggleFav: (id) => set((s) => {
    const next = s.favIds.includes(id)? s.favIds.filter(x=>x!==id) : [...s.favIds, id]
    if (s.hydrated) localStorage.setItem(LS_FAV, JSON.stringify(next))
    return { favIds: next }
  }),

  addRecent: (id) => set((s) => {
    const next = [id,...s.recentIds.filter(x=>x!==id)].slice(0, 20) // 20 as you wanted
    if (s.hydrated) localStorage.setItem(LS_RECENT, JSON.stringify(next))
    return { recentIds: next }
  }),

  createList: (name) => set((s) => {
    if (!name?.trim()) return s
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g,"-") + "-" + Date.now()
    const next = [...s.lists, { id, name: name.trim(), movieIds: [] }]
    if (s.hydrated) localStorage.setItem(LS_LISTS, JSON.stringify(next))
    return { lists: next }
  }),

  deleteList: (id) => set((s) => {
    if (id==="my-list") return s
    const next = s.lists.filter(x=>x.id!==id)
    if (s.hydrated) localStorage.setItem(LS_LISTS, JSON.stringify(next))
    return { lists: next }
  }),

  addMovieToList: (listId, movieId) => set((s) => {
    const next = s.lists.map(l => {
      if (l.id!==listId) return l
      if (l.movieIds.includes(movieId) || l.movieIds.includes(String(movieId))) return l
      return {...l, movieIds: [movieId,...l.movieIds] }
    })
    if (s.hydrated) localStorage.setItem(LS_LISTS, JSON.stringify(next))
    return { lists: next }
  }),

  addToList: (listId, movieId) => get().addMovieToList(listId, movieId),
  toggleListMovie: (listId, movieId) => set((s) => {
    const next = s.lists.map(l => {
      if (l.id!==listId) return l
      const has = l.movieIds.includes(movieId) || l.movieIds.includes(String(movieId))
      return {...l, movieIds: has? l.movieIds.filter(x=>x!==movieId && x!==String(movieId)) : [movieId,...l.movieIds] }
    })
    if (s.hydrated) localStorage.setItem(LS_LISTS, JSON.stringify(next))
    return { lists: next }
  }),
  addToMyList: (movieId) => get().addMovieToList("my-list", movieId),
  removeFromMyList: (movieId) => set((s) => {
    const next = s.lists.map(l=> l.id==="my-list"? {...l, movieIds: l.movieIds.filter(x=>x!==movieId && x!==String(movieId))} : l)
    if (s.hydrated) localStorage.setItem(LS_LISTS, JSON.stringify(next))
    return { lists: next }
  }),
}))

if (typeof window!== "undefined") {
  setTimeout(() => {
    const s = useMovieStore.getState()
    if (!s.hydrated) s._hydrate()
  }, 0)
}