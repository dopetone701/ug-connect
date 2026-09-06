"use client"
import { useEffect, useState, useCallback } from "react"
import { UserList } from "./types"

const LS_FAV = "ug-fav-ids"
const LS_RECENT = "ug-recent-ids"
const LS_LISTS = "ug-lists"

function readLS<T>(key: string, fallback: T): T {
  if(typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw? JSON.parse(raw) : fallback
  } catch { return fallback }
}

export function useMovieStore() {
  const [favIds, setFavIds] = useState<number[]>([])
  const [recentIds, setRecentIds] = useState<number[]>([])
  const [lists, setLists] = useState<UserList[]>([])
  const [hydrated, setHydrated] = useState(false)

  // hydration - read once
  useEffect(() => {
    const fav = readLS<number[]>(LS_FAV, [])
    const recent = readLS<number[]>(LS_RECENT, [])
    let l = readLS<UserList[]>(LS_LISTS, [])

    // FORCE SINGLE LIST SYSTEM - my-list only
    if (l.length === 0) {
      l = [{ id: "my-list", name: "my-list", movieIds: [] }]
    } else {
      // migrate all old lists into one my-list if needed
      const allIds = [...new Set(l.flatMap(x => x.movieIds))]
      l = [{ id: "my-list", name: "my-list", movieIds: allIds }]
    }

    setFavIds(fav)
    setRecentIds(recent)
    setLists(l)
    setHydrated(true)
  }, [])

  // write only after hydration
  useEffect(() => { if(hydrated) localStorage.setItem(LS_FAV, JSON.stringify(favIds)) }, [favIds, hydrated])
  useEffect(() => { if(hydrated) localStorage.setItem(LS_RECENT, JSON.stringify(recentIds)) }, [recentIds, hydrated])
  useEffect(() => { if(hydrated) localStorage.setItem(LS_LISTS, JSON.stringify(lists)) }, [lists, hydrated])

  const toggleFav = useCallback((id: number) =>
    setFavIds(p => p.includes(id)? p.filter(x=>x!==id) : [...p, id]), [])

  const addRecent = useCallback((id: number) =>
    setRecentIds(p => [id,...p.filter(x=>x!==id)].slice(0,12)), [])

  const createList = useCallback((name: string) => {
    setLists(p => {
      if (p.find(x => x.id === "my-list")) return p
      return [{ id: "my-list", name: "my-list", movieIds: [] },...p]
    })
  }, [])

  // --- THIS WAS MISSING - NOW ADDS ACTIVE MOVIE ---
  const addMovieToList = useCallback((listId: string, movieId: number) => {
    setLists(p => {
      const targetId = "my-list"
      const exists = p.find(l => l.id === targetId)
      if (!exists) return [{ id: targetId, name: targetId, movieIds: [movieId] }]
      return p.map(l => {
        if (l.id!== targetId) return l
        if (l.movieIds.includes(movieId)) return l // already saved
        return {...l, movieIds: [movieId,...l.movieIds] }
      })
    })
  }, [])

  // aliases so your old page.tsx calls work
  const addToList = addMovieToList
  const toggleListMovie = useCallback((listId: string, movieId: number) => {
    setLists(p => {
      const targetId = "my-list"
      const list = p.find(l => l.id === targetId)
      if (!list) return [{ id: targetId, name: targetId, movieIds: [movieId] }]
      const has = list.movieIds.includes(movieId)
      return p.map(l => {
        if (l.id!== targetId) return l
        return {...l, movieIds: has? l.movieIds.filter(x => x!== movieId) : [movieId,...l.movieIds] }
      })
    })
  }, [])

  const addToMyList = useCallback((movieId: number) => {
    addMovieToList("my-list", movieId)
  }, [addMovieToList])

  const removeFromMyList = useCallback((movieId: number) => {
    setLists(p => p.map(l => l.id === "my-list"? {...l, movieIds: l.movieIds.filter(x => x!== movieId)} : l))
  }, [])

  return {
    favIds, recentIds, lists,
    toggleFav, addRecent, createList,
    addMovieToList, addToList, toggleListMovie, addToMyList, removeFromMyList
  }
}
