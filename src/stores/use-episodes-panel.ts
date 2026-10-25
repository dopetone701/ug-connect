 "use client"
import { create } from "zustand"
import type { ReelMovie } from "@/components/media/reels/reels-types"

type EpisodesPanelState = {
  isOpen: boolean
  movieId: string | null
  movie: ReelMovie | null
  open: (movieId: string, movie?: ReelMovie | null) => void
  // close() only flips isOpen. movie/movieId stay so the panel can
  // keep rendering its content while it slides out.
  close: () => void
}

export const useEpisodesPanel = create<EpisodesPanelState>((set) => ({
  isOpen: false,
  movieId: null,
  movie: null,
  open: (movieId, movie) => set({ isOpen: true, movieId, movie: movie ?? null }),
  close: () => set({ isOpen: false }),
}))

