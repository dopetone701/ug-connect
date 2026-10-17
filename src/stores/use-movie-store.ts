"use client"
import { create } from "zustand"

export type UserList = {
  id: string
  name: string
  movieIds: any[]
}

export type WatchProgress = {
  time: number
  duration: number
  percent: number
  updatedAt: number
}

type MovieStore = {
  favIds: any[]
  recentIds: any[]
  lists: UserList[]
  watchProgress: Record<string, WatchProgress>
  hydrated: boolean
  currentUserId: string
  _hydrate: () => void
  toggleFav: (id: any) => void
  addRecent: (id: any) => void
  createList: (name: string) => void
  deleteList: (id: string) => void
  addMovieToList: (listId: string, movieId: any) => void
  toggleListMovie: (listId: string, movieId: any) => void
  addToMyList: (movieId: any) => void
  removeFromMyList: (movieId: any) => void
  saveProgress: (movieId: any, time: number, duration: number) => void
  getProgress: (movieId: any) => WatchProgress | null
  clearProgress: (movieId: any) => void
  clearOnLogout: () => void
  mergeGuestIntoUser: (realUserId: string) => void
}

const BASE_FAV = "ug-fav-ids"
const BASE_RECENT = "ug-recent-ids"
const BASE_LISTS = "ug-lists"
const BASE_PROGRESS = "ug-watch-progress"

function getUserId(): string {
  try{
    const raw = localStorage.getItem("ug_user")
    if(!raw) return "guest"
    const u = JSON.parse(raw)
    return u?.id || "guest"
  }catch{ return "guest" }
}

function lsKey(base: string, uid?: string){
  const id = uid || getUserId()
  return `${base}__${id}`
}

function readLS<T>(key: string, fallback: T): T {
  if(typeof window==="undefined") return fallback
  try{
    const raw = localStorage.getItem(key)
    return raw? JSON.parse(raw) : fallback
  }catch{ return fallback }
}

function writeLS(key: string, val: any){
  if(typeof window==="undefined") return
  localStorage.setItem(key, JSON.stringify(val))
}

export const useMovieStore = create<MovieStore>((set, get) => ({
  favIds: [],
  recentIds: [],
  lists: [{ id: "my-list", name: "My List", movieIds: [] }],
  watchProgress: {},
  hydrated: false,
  currentUserId: "guest",

  _hydrate: () => {
    const uid = getUserId()
    const fav = readLS<any[]>(lsKey(BASE_FAV, uid), [])
    const recent = readLS<any[]>(lsKey(BASE_RECENT, uid), [])
    let lists = readLS<UserList[]>(lsKey(BASE_LISTS, uid), [])
    const progress = readLS<Record<string, WatchProgress>>(lsKey(BASE_PROGRESS, uid), {})

    if(uid!=="guest"){
      const gFav = readLS<any[]>(lsKey(BASE_FAV, "guest"), [])
      const gRecent = readLS<any[]>(lsKey(BASE_RECENT, "guest"), [])
      const gLists = readLS<UserList[]>(lsKey(BASE_LISTS, "guest"), [])
      const gProgress = readLS<Record<string, WatchProgress>>(lsKey(BASE_PROGRESS, "guest"), {})

      const mergedFav = [...new Set([...fav, ...gFav])]
      const mergedRecent = [...new Set([...gRecent, ...recent])].slice(0,20)
      const mergedProgress = {...gProgress, ...progress}
      let mergedLists = lists
      if(lists.length===0 && gLists.length>0){
        mergedLists = gLists
      } else if(gLists.length>0){
        const my = lists.find(l=>l.id==="my-list")
        const gMy = gLists.find(l=>l.id==="my-list")
        if(my && gMy){
          mergedLists = lists.map(l=> l.id==="my-list"? {...l, movieIds:[...new Set([...gMy.movieIds, ...l.movieIds])]} : l)
          gLists.filter(l=>l.id!=="my-list").forEach(gl=>{
            if(!mergedLists.find(x=>x.name===gl.name)) mergedLists.push(gl)
          })
        }
      }
      if(mergedLists.length===0) mergedLists=[{id:"my-list", name:"My List", movieIds:[]}]

      set({ favIds: mergedFav, recentIds: mergedRecent, lists: mergedLists, watchProgress: mergedProgress, hydrated:true, currentUserId:uid })
      writeLS(lsKey(BASE_FAV, uid), mergedFav)
      writeLS(lsKey(BASE_RECENT, uid), mergedRecent)
      writeLS(lsKey(BASE_LISTS, uid), mergedLists)
      writeLS(lsKey(BASE_PROGRESS, uid), mergedProgress)
      localStorage.removeItem(lsKey(BASE_FAV, "guest"))
      localStorage.removeItem(lsKey(BASE_RECENT, "guest"))
      localStorage.removeItem(lsKey(BASE_LISTS, "guest"))
      localStorage.removeItem(lsKey(BASE_PROGRESS, "guest"))
      return
    }

    if(lists.length===0) lists=[{id:"my-list", name:"My List", movieIds:[]}]
    set({ favIds: fav, recentIds: recent, lists, watchProgress: progress, hydrated:true, currentUserId:uid })
  },

  toggleFav: (id) => set((s)=>{
    const uid = getUserId()
    const next = s.favIds.includes(id)? s.favIds.filter(x=>x!==id && String(x)!==String(id)) : [...s.favIds, id]
    writeLS(lsKey(BASE_FAV, uid), next)
    return { favIds: next, currentUserId:uid }
  }),

  addRecent: (id) => set((s)=>{
    const uid = getUserId()
    const next = [id, ...s.recentIds.filter(x=>String(x)!==String(id))].slice(0,20)
    writeLS(lsKey(BASE_RECENT, uid), next)
    return { recentIds: next, currentUserId:uid }
  }),

  saveProgress: (movieId, time, duration) => set((s)=>{
    const uid = getUserId()
    const id = String(movieId)
    if(!time || time < 2) return s
    if(!duration || duration < 5) return s
    const percent = Math.min(100, (time / duration) * 100)
    if(percent < 1) return s

    // If fully watched >95% → keep 100% but will be treated as completed
    const finalPercent = percent >= 95 ? 100 : percent

    const next = {
      ...s.watchProgress,
      [id]: { time, duration, percent: finalPercent, updatedAt: Date.now() }
    }
    writeLS(lsKey(BASE_PROGRESS, uid), next)

    // Keep in recent for ordering
    const nextRecent = [id, ...s.recentIds.filter(x=>String(x)!==String(id))].slice(0,20)
    writeLS(lsKey(BASE_RECENT, uid), nextRecent)

    return { watchProgress: next, recentIds: nextRecent, currentUserId:uid }
  }),

  getProgress: (movieId) => {
    const s = get()
    return s.watchProgress[String(movieId)] || null
  },

  clearProgress: (movieId) => set((s)=>{
    const uid = getUserId()
    const id = String(movieId)
    const next = {...s.watchProgress}
    delete next[id]
    writeLS(lsKey(BASE_PROGRESS, uid), next)
    // Keep in recent but progress cleared
    return { watchProgress: next, currentUserId:uid }
  }),

  createList: (name) => set((s)=>{
    const uid = getUserId()
    if(!name?.trim()) return s
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g,"-")+"-"+Date.now()
    const next = [...s.lists, { id, name:name.trim(), movieIds:[] }]
    writeLS(lsKey(BASE_LISTS, uid), next)
    return { lists: next }
  }),

  deleteList: (id) => set((s)=>{
    const uid = getUserId()
    if(id==="my-list") return s
    const next = s.lists.filter(x=>x.id!==id)
    writeLS(lsKey(BASE_LISTS, uid), next)
    return { lists: next }
  }),

  addMovieToList: (listId, movieId) => set((s)=>{
    const uid = getUserId()
    const next = s.lists.map(l=>{
      if(l.id!==listId) return l
      if(l.movieIds.includes(movieId) || l.movieIds.includes(String(movieId))) return l
      return {...l, movieIds:[movieId, ...l.movieIds]}
    })
    writeLS(lsKey(BASE_LISTS, uid), next)
    return { lists: next }
  }),

  toggleListMovie: (listId, movieId) => set((s)=>{
    const uid = getUserId()
    const next = s.lists.map(l=>{
      if(l.id!==listId) return l
      const has = l.movieIds.includes(movieId) || l.movieIds.includes(String(movieId))
      return {...l, movieIds: has? l.movieIds.filter(x=>String(x)!==String(movieId)) : [movieId, ...l.movieIds]}
    })
    writeLS(lsKey(BASE_LISTS, uid), next)
    return { lists: next }
  }),

  addToMyList: (movieId) => get().addMovieToList("my-list", movieId),
  removeFromMyList: (movieId) => set((s)=>{
    const uid = getUserId()
    const next = s.lists.map(l=> l.id==="my-list"? {...l, movieIds:l.movieIds.filter(x=>String(x)!==String(movieId))} : l)
    writeLS(lsKey(BASE_LISTS, uid), next)
    return { lists: next }
  }),

  clearOnLogout: () => set((s)=>{
    const uid = getUserId()
    localStorage.removeItem(lsKey(BASE_FAV, uid))
    localStorage.removeItem(lsKey(BASE_RECENT, uid))
    localStorage.removeItem(lsKey(BASE_LISTS, uid))
    localStorage.removeItem(lsKey(BASE_PROGRESS, uid))
    localStorage.removeItem(lsKey(BASE_FAV, "guest"))
    localStorage.removeItem(lsKey(BASE_RECENT, "guest"))
    localStorage.removeItem(lsKey(BASE_LISTS, "guest"))
    localStorage.removeItem(lsKey(BASE_PROGRESS, "guest"))
    localStorage.removeItem("ug-all-movies")
    return { favIds:[], recentIds:[], lists:[{id:"my-list", name:"My List", movieIds:[]}], watchProgress:{}, hydrated:true, currentUserId:"guest" }
  }),

  mergeGuestIntoUser: (realUserId) => { get()._hydrate() }
}))

if(typeof window!=="undefined"){
  setTimeout(()=>{ const s=useMovieStore.getState(); if(!s.hydrated) s._hydrate() }, 0)
  window.addEventListener("ug-auth-changed", ()=> useMovieStore.getState()._hydrate())
}

