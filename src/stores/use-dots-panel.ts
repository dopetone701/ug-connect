"use client"
import { create } from "zustand"
import type { ReelMovie } from "@/components/media/reels/reels-types"

type DotsPanelState = {
  isOpen: boolean
  movieId: string | null
  movie: ReelMovie | any | null
  open: (movieId: string, movie?: ReelMovie | any | null) => void
  close: () => void
}

export const useDotsPanel = create<DotsPanelState>((set) => ({
  isOpen: false,
  movieId: null,
  movie: null,
  open: (movieId, movie) => set({ isOpen: true, movieId, movie: movie || null }),
  close: () => set({ isOpen: false, movieId: null, movie: null }),
}))

