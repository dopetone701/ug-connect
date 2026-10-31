"use client";
import { create } from "zustand";
import { CATEGORY_OPTIONS } from "@/app/(dashboard)/control-center-page/components/edit-movie/constants";

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

// CATEGORY: west-african = west_african = west african
function norm(s: string) {
  return String(s || "").toLowerCase().trim().replace(/[-\s]+/g, "_").replace(/_+/g, "_");
}

function getCategoryIdFromQuery(q: string): string | null {
  const query = norm(q);
  if (!query) return null;
  for (const cat of CATEGORY_OPTIONS) {
    const cId = norm(cat.id);
    const cLabel = norm(cat.label);
    const cSearch = norm(cat.searchQuery);
    // direct id: western, european, west_african
    if (query === cId || query.includes(cId) || cId.includes(query)) return cat.id;
    if (query === cLabel || cLabel.includes(query)) return cat.id;
    if (cSearch && (query === cSearch || cSearch.includes(query) || query.includes(cSearch))) return cat.id;
    for (const key of cat.matchKeys) {
      const k = norm(key);
      if (!k) continue;
      if (query === k || query.includes(k) || k.includes(query)) return cat.id;
    }
  }
  return null;
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
    const qNorm = norm(rawQ)

    // === CATEGORY SEARCH MODE: western, european, west african, etc ===
    const catId = getCategoryIdFromQuery(rawQ)
    if (catId) {
      const cIdNorm = norm(catId)
      const matched = allMovies.filter((m: any) => {
        const mCat = norm(m.category || m.origin || m.country || "")
        return mCat === cIdNorm
      })
      if (matched.length > 0) return matched
      // if no exact D1 match, fall through to normal search
    }

    // === YEAR SEARCH MODE: 2005, 1999, etc ===
    const yearMatch = q.match(/^(19|20)\d{2}$/)
    if (yearMatch) {
      const targetYear = parseInt(q, 10)
      
      const withYear = allMovies
        .map(m => ({ m, year: getYear(m) }))
        .filter(({ year }) => year!== null && Math.abs(year! - targetYear) <= 5)

      withYear.sort((a,b) => {
        const da = Math.abs(a.year! - targetYear)
        const db = Math.abs(b.year! - targetYear)
        if (da!== db) return da - db
        if (a.year === targetYear) return -1
        if (b.year === targetYear) return 1
        return b.year! - a.year!
      })

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
      const category = norm(m.category || m.origin || m.country || "")
      const year = getYear(m)?.toString() || ""

      if (title.includes(q) || genre.includes(q) || vj.includes(q) || actor.includes(q) || year.includes(qClean)) return true
      if (category && (category.includes(qNorm) || qNorm.includes(category))) return true
      if (genre === qClean || vj === qClean) return true
      if (q.includes(genre) && genre.length > 2) return true
      if (activeSection && (genre === activeSection.toLowerCase() || vj === activeSection.toLowerCase())) return true
      // category section match
      if (activeSection) {
        const secNorm = norm(activeSection)
        if (category && secNorm === category) return true
      }
      return false
    })
  }
}))