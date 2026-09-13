"use client";
import { useMemo } from "react";
import { useGlobalSearch } from "@/stores/use-global-search";
import { getSections } from "@/app/(dashboard)/movies/_lib/sections.config";
import { useMovieStore } from "@/app/(dashboard)/movies/_lib/use-movie-store";

export function useDrawerSearch() {
  const { allMovies, query, activeSection } = useGlobalSearch();
  const { favIds, recentIds } = useMovieStore() as any;

  const baseSections = useMemo(() => getSections(allMovies, { favIds, recentIds }), [allMovies, favIds, recentIds]);

  const result = useMemo(() => {
    const q = query.toLowerCase().trim();
    
    // If a Section was clicked via "See All" - use its real data, not search
    if (activeSection) {
      const sec = baseSections.find(s => s.id === activeSection || s.title.toLowerCase() === activeSection.toLowerCase());
      if(sec) return { mode: "section", title: sec.title, data: sec.data } as const;
      
      // fallback if section id is "action movies" -> strip movies
      const clean = activeSection.replace(/\s*movies\s*$/,"").trim().toLowerCase();
      const fallback = baseSections.find(s => s.title.toLowerCase().includes(clean));
      if(fallback) return { mode: "section", title: fallback.title, data: fallback.data } as const;
    }

    // If searching - BIG BRAIN for "action movies"
    if (q) {
      const qClean = q.replace(/\s*movies\s*$/,"").trim();
      const words = qClean.split(" ").filter(w => w.length >= 1);

      const filtered = allMovies.filter((m: any) => {
        const title = (m.title || "").toLowerCase();
        const genre = (m.genre || "").toLowerCase();
        const vj = (m.vj || "").toLowerCase();
        const hay = `${title} ${genre} ${vj}`;

        if (hay.includes(q)) return true;
        if (genre === qClean) return true;
        if (vj === qClean) return true;
        if (words.length > 1 && words.every((w: string) => hay.includes(w))) return true;
        if (hay.includes(qClean)) return true;
        return false;
      });
      return { mode: "search", title: `Filtered: ${query}`, data: filtered } as const;
    }

    // Default = instant taste
    return { mode: "browse", sections: baseSections } as const;
  }, [allMovies, baseSections, query, activeSection]);

  return result;
}
