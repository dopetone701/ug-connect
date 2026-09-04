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
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

export function useMovieStore() {
  const [favIds, setFavIds] = useState<number[]>([])
  const [recentIds, setRecentIds] = useState<number[]>([])
  const [lists, setLists] = useState<UserList[]>([])
  const [hydrated, setHydrated] = useState(false)

  // hydration - read once
  useEffect(() => {
    setFavIds(readLS<number[]>(LS_FAV, []))
    setRecentIds(readLS<number[]>(LS_RECENT, []))
    setLists(readLS<UserList[]>(LS_LISTS, []))
    setHydrated(true)
  }, [])

  // write only after hydration
  useEffect(() => { if(hydrated) localStorage.setItem(LS_FAV, JSON.stringify(favIds)) }, [favIds, hydrated])
  useEffect(() => { if(hydrated) localStorage.setItem(LS_RECENT, JSON.stringify(recentIds)) }, [recentIds, hydrated])
  useEffect(() => { if(hydrated) localStorage.setItem(LS_LISTS, JSON.stringify(lists)) }, [lists, hydrated])

  const toggleFav = useCallback((id: number) => 
    setFavIds(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]), [])

  const addRecent = useCallback((id: number) => 
    setRecentIds(p => [id, ...p.filter(x=>x!==id)].slice(0,12)), [])

  const createList = useCallback((name: string) => 
    setLists(p => [...p, { id: Date.now().toString(), name: name.toLowerCase(), movieIds: [] }]), [])

  return { favIds, recentIds, lists, toggleFav, addRecent, createList }
}
