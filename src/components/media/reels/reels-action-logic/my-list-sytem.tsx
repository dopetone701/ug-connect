"use client"

import { useState, useEffect } from "react"
import { useMovieStore } from "../../../../stores/use-movie-store"

// Fixed to match UserListsRow - uses same store: lists[0].movieIds
// Same as hero + btn logic

type MyListBtnProps = {
  movieId: string
  movie?: any
  size?: number
  variant?: "reels" | "hero"
}

export function PlusIcon({ size = 22, color = "hsl(var(--text))" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function TickIcon({ size = 22, color = "hsl(var(--text))" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function MyListSystem({ movieId, size = 22, variant = "reels" }: MyListBtnProps) {
  const { lists, createList } = useMovieStore() as any
  const [isClient, setIsClient] = useState(false)

  useEffect(() => { setIsClient(true) }, [])

  // Same as UserListsRow - mainList is lists[0]
  const mainList = lists?.[0]
  const saved = isClient && mainList?.movieIds?.includes(String(movieId))

  useEffect(() => {
    if (lists.length === 0) {
      createList("my-list")
    }
  }, [lists.length, createList])

  const toggle = () => {
    const store = useMovieStore.getState() as any
    const currentLists = store.lists
    let currentMain = currentLists?.[0]

    // Ensure list exists - same as UserListsRow
    if (!currentMain) {
      store.createList("my-list")
      currentMain = useMovieStore.getState().lists[0]
    }

    const idStr = String(movieId)
    const already = currentMain?.movieIds?.includes(idStr) || currentMain?.movieIds?.includes(movieId)

    // Use store methods if they exist (try all common names)
    if (already) {
      if (store.removeMovieFromList) store.removeMovieFromList(currentMain.id, idStr)
      else if (store.removeFromList) store.removeFromList(currentMain.id, idStr)
      else if (store.removeMovie) store.removeMovie(idStr)
      else if (store.toggleMovie) store.toggleMovie(idStr)
      else {
        // Fallback: direct update - matches zustand persist structure
        const newLists = currentLists.map((l: any, i: number) => 
          i === 0 ? { ...l, movieIds: l.movieIds.filter((x: any) => String(x) !== idStr) } : l
        )
        store.setLists ? store.setLists(newLists) : (useMovieStore.setState as any)({ lists: newLists })
      }
    } else {
      if (store.addMovieToList) store.addMovieToList(currentMain.id, idStr)
      else if (store.addToList) store.addToList(currentMain.id, idStr)
      else if (store.addMovie) store.addMovie(idStr)
      else if (store.toggleMovie) store.toggleMovie(idStr)
      else {
        const newLists = currentLists.map((l: any, i: number) => 
          i === 0 ? { ...l, movieIds: [...(l.movieIds || []), idStr] } : l
        )
        store.setLists ? store.setLists(newLists) : (useMovieStore.setState as any)({ lists: newLists })
      }
    }
  }

  if (!isClient) {
    return (
      <button type="button" className="ra-btn" aria-label="My List">
        <span className="ra-icon-bg"><PlusIcon size={size} /></span>
        <span className="ra-label">My List</span>
      </button>
    )
  }

  if (variant === "reels") {
    return (
      <button type="button" className="ra-btn" onClick={toggle} aria-label={saved ? "In My List" : "Add to My List"}>
        <span className={`ra-icon-bg ${saved ? "saved" : ""}`}>
          {saved ? <TickIcon size={size} /> : <PlusIcon size={size} />}
        </span>
        <span className="ra-label">{saved ? "Saved" : "My List"}</span>
      </button>
    )
  }

  return (
    <button type="button" onClick={toggle} className={`hero-plus-btn ${saved ? "is-saved" : ""}`} aria-label={saved ? "In My List" : "Add to My List"}>
      {saved ? <TickIcon size={size} /> : <PlusIcon size={size} />}
    </button>
  )
}

export default MyListSystem

