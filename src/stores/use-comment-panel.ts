"use client"
import { create } from "zustand"

type CommentPanelState = {
  isOpen: boolean
  movieId: string | null
  open: (movieId: string) => void
  close: () => void
}

export const useCommentPanel = create<CommentPanelState>((set) => ({
  isOpen: false,
  movieId: null,
  open: (movieId) => set({ isOpen: true, movieId }),
  close: () => set({ isOpen: false, movieId: null }),
}))

