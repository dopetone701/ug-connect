"use client"
import { useEffect, useState } from "react"
import { useMovieStore } from "@/stores/use-movie-store"
import { useDotsPanel } from "@/stores/use-dots-panel"
import { IconBookmark } from "./icons-launcher"

type Props = { movieId: string; movie?: any; onClose?: () => void }

export function SaveMovieItem({ movieId, movie, onClose }: Props) {
  const { lists } = useMovieStore() as any
  const { close } = useDotsPanel()
  const [saved, setSaved] = useState(false)
  const mainList = lists?.[0]

  useEffect(() => {
    const ids = (mainList?.movieIds || []).map((x:any)=>String(x))
    setSaved(ids.includes(String(movieId)))
  }, [movieId, mainList])

  const handle = () => {
    const store = useMovieStore.getState() as any
    if (lists.length === 0 && store.createList) store.createList("my-list")
    const listId = lists[0]?.id || "my-list"
    if (saved) {
      if (store.removeMovieFromList) store.removeMovieFromList(listId, String(movieId))
      else if (store.removeFromList) store.removeFromList(listId, String(movieId))
      else if (store.toggleMovie) store.toggleMovie(String(movieId))
    } else {
      if (store.addMovieToList) store.addMovieToList(listId, String(movieId))
      else if (store.addToList) store.addToList(listId, String(movieId))
      else if (store.toggleMovie) store.toggleMovie(String(movieId))
    }
    setSaved(!saved)
    setTimeout(()=>{ onClose?.(); close() }, 250)
  }

  return (
    <button className="dots-item" onClick={handle}>
      <span className="dots-icon"><IconBookmark /></span>
      <span className="dots-text">
        <span className="dots-title">{saved ? "Remove from My List" : "Save to My List"}</span>
        <span className="dots-sub">{saved ? "Remove this movie from My List." : "Add this movie to My List."}</span>
      </span>
    </button>
  )
}
export default SaveMovieItem

