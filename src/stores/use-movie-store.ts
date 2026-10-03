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
  clearOnLogout: () => void
  mergeGuestIntoUser: (realUserId: string) => void
}

const BASE_FAV = "ug-fav-ids"
const BASE_RECENT = "ug-recent-ids"
const BASE_LISTS = "ug-lists"

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
  hydrated: false,
  currentUserId: "guest",

  _hydrate: () => {
    const uid = getUserId()
    const fav = readLS<any[]>(lsKey(BASE_FAV, uid), [])
    const recent = readLS<any[]>(lsKey(BASE_RECENT, uid), [])
    let lists = readLS<UserList[]>(lsKey(BASE_LISTS, uid), [])

    // If new user and we have guest data, merge guest into him
    if(uid!=="guest"){
      const gFav = readLS<any[]>(lsKey(BASE_FAV, "guest"), [])
      const gRecent = readLS<any[]>(lsKey(BASE_RECENT, "guest"), [])
      const gLists = readLS<UserList[]>(lsKey(BASE_LISTS, "guest"), [])

      // merge favs
      const mergedFav = [...new Set([...fav, ...gFav])]
      // merge recent - guest recent first
      const mergedRecent = [...new Set([...gRecent, ...recent])].slice(0,20)
      // merge lists
      let mergedLists = lists
      if(lists.length===0 && gLists.length>0){
        mergedLists = gLists
      } else if(gLists.length>0){
        // merge movieIds into my-list
        const my = lists.find(l=>l.id==="my-list")
        const gMy = gLists.find(l=>l.id==="my-list")
        if(my && gMy){
          mergedLists = lists.map(l=> l.id==="my-list"? {...l, movieIds:[...new Set([...gMy.movieIds, ...l.movieIds])]} : l)
          // add custom guest lists that don't exist
          gLists.filter(l=>l.id!=="my-list").forEach(gl=>{
            if(!mergedLists.find(x=>x.name===gl.name)) mergedLists.push(gl)
          })
        }
      }
      if(mergedLists.length===0) mergedLists=[{id:"my-list", name:"My List", movieIds:[]}]

      set({ favIds: mergedFav, recentIds: mergedRecent, lists: mergedLists, hydrated:true, currentUserId:uid })
      // save merged back to real user keys and clear guest
      writeLS(lsKey(BASE_FAV, uid), mergedFav)
      writeLS(lsKey(BASE_RECENT, uid), mergedRecent)
      writeLS(lsKey(BASE_LISTS, uid), mergedLists)
      // clear guest after merge
      localStorage.removeItem(lsKey(BASE_FAV, "guest"))
      localStorage.removeItem(lsKey(BASE_RECENT, "guest"))
      localStorage.removeItem(lsKey(BASE_LISTS, "guest"))
      return
    }

    if(lists.length===0) lists=[{id:"my-list", name:"My List", movieIds:[]}]
    set({ favIds: fav, recentIds: recent, lists, hydrated:true, currentUserId:uid })
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
    // clear current user storage instantly
    localStorage.removeItem(lsKey(BASE_FAV, uid))
    localStorage.removeItem(lsKey(BASE_RECENT, uid))
    localStorage.removeItem(lsKey(BASE_LISTS, uid))
    // also clear guest
    localStorage.removeItem(lsKey(BASE_FAV, "guest"))
    localStorage.removeItem(lsKey(BASE_RECENT, "guest"))
    localStorage.removeItem(lsKey(BASE_LISTS, "guest"))
    localStorage.removeItem("ug-all-movies")
    return { favIds:[], recentIds:[], lists:[{id:"my-list", name:"My List", movieIds:[]}], hydrated:true, currentUserId:"guest" }
  }),

  mergeGuestIntoUser: (realUserId) => {
    get()._hydrate() // will auto merge
  }
}))

if(typeof window!=="undefined"){
  setTimeout(()=>{ const s=useMovieStore.getState(); if(!s.hydrated) s._hydrate() }, 0)
  window.addEventListener("ug-auth-changed", ()=> useMovieStore.getState()._hydrate())
}