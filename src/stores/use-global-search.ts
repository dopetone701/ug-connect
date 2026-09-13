"use client";
import { create } from "zustand";

type Store = {
  allMovies: any[];
  query: string;
  activeSection: string | null;
  isSearchOpen: boolean;
  setAll: (m: any[]) => void;
  setQuery: (q: string) => void;
  setSection: (id: string | null) => void;
  openSearch: () => void;
  closeSearch: () => void;
  filtered: () => any[];
}

export const useGlobalSearch = create<Store>((set, get) => ({
  allMovies: [],
  query: "",
  activeSection: null,
  isSearchOpen: false,

  setAll: (allMovies) => set({ allMovies }),
  setQuery: (query) => set({ query, isSearchOpen: true }),
  setSection: (activeSection) => set({ activeSection, isSearchOpen: true }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false, activeSection: null }),

  // THIS IS THE BRAIN - now understands "action movies"
  filtered: () => {
    const { allMovies, query } = get()
    if (!query?.trim()) return allMovies

    const q = query.toLowerCase().trim() // "action movies"
    const qClean = q.replace(/\s*movies\s*$/,"").trim() // "action" - strip suffix

    return allMovies.filter((m: any) => {
      const title = (m.title || "").toLowerCase()
      const genre = (m.genre || "").toLowerCase()
      const vj = (m.vj || "").toLowerCase()

      // 1. full phrase match
      if (title.includes(q) || genre.includes(q) || vj.includes(q)) return true
      
      // 2. genre match - "action movies" -> genre == "action"
      if (genre === qClean) return true
      if (q.includes(genre) && genre.length > 2) return true
      if (qClean.includes(genre) && genre.length > 2) return true

      // 3. vj match - "vj junior movies" -> vj == "vj junior"
      if (vj === qClean) return true
      if (q.includes(vj) && vj.length > 2) return true

      return false
    })
  }
}))
