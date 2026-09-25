'use client'
import { create } from 'zustand'

export const useReelsDrawer = create<any>((set: any) => ({
  isOpen: false,
  movies: [] as any[],
  startIndex: 0,
  currentMovie: null as any,
  openReels: (movies: any[], startIndex = 0) => set({
    isOpen: true,
    movies,
    startIndex,
    currentMovie: movies[startIndex]
  }),
  closeReels: () => set({ isOpen: false }),
}))
