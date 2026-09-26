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

const getYear = (m: any): number | null => {
  const raw = m.year || m.releaseYear || m.release_year || m.date || "";
  const y = parseInt(String(raw).slice(0,4), 10);
  return isNaN(y) ? null : y;
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

  filtered: () => {
    const { allMovies, query, activeSection } = get()
    const rawQ = (query || activeSection || "").trim()
    if (!rawQ) return allMovies

    const q = rawQ.toLowerCase()
    const qClean = q.replace(/\s*movies\s*$/,"").trim()

    // === YEAR SEARCH MODE: 2005, 1999, etc ===
    const yearMatch = q.match(/^(19|20)\d{2}$/)
    if (yearMatch) {
      const targetYear = parseInt(q, 10)
      
      // get all movies within 5 above / 5 below
      const withYear = allMovies
        .map(m => ({ m, year: getYear(m) }))
        .filter(({ year }) => year!== null && Math.abs(year! - targetYear) <= 5)

      // sort: exact first, then closest year, then newer first
      withYear.sort((a,b) => {
        const da = Math.abs(a.year! - targetYear)
        const db = Math.abs(b.year! - targetYear)
        if (da!== db) return da - db
        if (a.year === targetYear) return -1
        if (b.year === targetYear) return 1
        return b.year! - a.year!
      })

      // inject group labels for UI
      return withYear.map(({ m, year }) => ({
        ...m,
        _group: year === targetYear ? `Exact: ${targetYear}` : year! > targetYear ? `From ${targetYear} release` : `Before ${targetYear} release`,
        _sortYear: year
      }))
    }

    // === NORMAL SEARCH ===
    return allMovies.filter((m: any) => {
      const title = (m.title || "").toLowerCase()
      const genre = (m.genre || "").toLowerCase()
      const vj = (m.vj || "").toLowerCase()
      const actor = (m.actor || m.actors || m.cast || "").toString().toLowerCase()
      const year = getYear(m)?.toString() || ""

      if (title.includes(q) || genre.includes(q) || vj.includes(q) || actor.includes(q) || year.includes(qClean)) return true
      if (genre === qClean || vj === qClean) return true
      if (q.includes(genre) && genre.length > 2) return true
      if (activeSection && (genre === activeSection.toLowerCase() || vj === activeSection.toLowerCase())) return true
      return false
    })
  }
}))
