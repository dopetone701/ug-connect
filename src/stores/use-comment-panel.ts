"use client"
import { create } from "zustand"
import type { ReelMovie } from "@/components/media/reels/reels-types"

type CommentPanelState = {
  isOpen: boolean
  movieId: string | null
  movie: ReelMovie | null
  open: (movieId: string, movie?: ReelMovie | null) => void
  close: () => void
}

export const useCommentPanel = create<CommentPanelState>((set) => ({
  isOpen: false,
  movieId: null,
  movie: null,
  open: (movieId, movie) => set({ isOpen: true, movieId, movie: movie || null }),
  close: () => set({ isOpen: false, movieId: null, movie: null }),
}))
