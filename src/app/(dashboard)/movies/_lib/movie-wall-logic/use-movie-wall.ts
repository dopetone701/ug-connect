"use client"
import { useMemo, useState, useCallback } from "react"
import type { BattleGroup } from "./movie-wall-groups"

export function useMovieWall(group: BattleGroup) {
  // Default active = most viewed — matches your MovieCard sort
  const [activeVjId, setActiveVjId] = useState<string>(() => String(group.mostViewed.id))
  const [isPreviewing, setIsPreviewing] = useState(false)

  const activeMovie = useMemo(
    () => group.vjs.find((v) => String(v.id) === activeVjId) || group.mostViewed,
    [group, activeVjId]
  )

  const selectVj = useCallback((id: string) => {
    setActiveVjId(String(id))
    setIsPreviewing(true)
  }, [])

  const clearPreview = useCallback(() => setIsPreviewing(false), [])

  return { activeVjId, activeMovie, isPreviewing, selectVj, clearPreview }
}