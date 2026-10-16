"use client";
import { useMemo } from "react";
import { useGlobalSearch } from "@/stores/use-global-search";
import { getSections } from "@/app/(dashboard)/movies/_lib/sections.config";
import { useMovieStore } from "@/stores/use-movie-store";

function getDate(m: any) {
  const raw = m.created_at || m.createdAt || m.release_date || m.year;
  if (!raw) return 0;
  const d = new Date(raw).getTime();
  return isNaN(d) ? 0 : d;
}

export function useDrawerSearch() {
  const { allMovies, query, activeSection } = useGlobalSearch();
  const { favIds, recentIds, lists } = useMovieStore() as any;

  const baseSections = useMemo(() => getSections(allMovies, { favIds, recentIds }), [allMovies, favIds, recentIds]);

  const result = useMemo(() => {
    const q = query.toLowerCase().trim();
    const qCleanForCheck = q.replace(/\s*movies\s*$/,"").trim();

    const isTvQuery = (v: string) => {
      const s = v.toLowerCase().trim();
      return s === "tv series" || s === "tv" || s === "series" || s === "full" || s.includes("tv series");
    };
    const isMiniQuery = (v: string) => {
      const s = v.toLowerCase().trim();
      return s === "mini series" || s === "mini" || s.includes("mini series");
    };
    const isLatestQuery = (v: string) => {
      const s = v.toLowerCase().trim();
      return s === "latest" || s === "latest movies" || s.includes("latest");
    };
    const isMyListQuery = (v: string) => {
      const s = v.toLowerCase().trim();
      return s === "my list" || s === "mylist" || s === "my-list" || s.includes("my list");
    };

    if (activeSection) {
      const activeLower = activeSection.toLowerCase().trim();
      const activeClean = activeLower.replace(/\s*movies\s*$/,"").trim();

      if (isMyListQuery(activeLower) || isMyListQuery(activeClean)) {
        const mainList = lists?.[0];
        const ids: string[] = mainList?.movieIds?.map((x:any)=>String(x)) || [];
        const data = ids.length ? (allMovies as any[]).filter((m:any)=> ids.includes(String(m.id))) : [];
        return { mode: "section", title: "My List", data } as const;
      }
      if (isLatestQuery(activeLower) || isLatestQuery(activeClean)) {
        const data = [...(allMovies as any[])].sort((a:any,b:any)=> getDate(b) - getDate(a));
        return { mode: "section", title: "Latest Movies", data } as const;
      }
      if (isTvQuery(activeLower) || isTvQuery(activeClean)) {
        const data = (allMovies as any[]).filter((m: any) => (m.type || "").toLowerCase() === "full");
        return { mode: "section", title: "TV Series", data } as const;
      }
      if (isMiniQuery(activeLower) || isMiniQuery(activeClean)) {
        const data = (allMovies as any[]).filter((m: any) => (m.type || "").toLowerCase() === "mini");
        return { mode: "section", title: "Mini Series", data } as const;
      }

      const sec = baseSections.find(s => s.id === activeSection || s.title.toLowerCase() === activeSection.toLowerCase());
      if(sec) return { mode: "section", title: sec.title, data: sec.data } as const;
     
      const clean = activeSection.replace(/\s*movies\s*$/,"").trim().toLowerCase();
      const fallback = baseSections.find(s => s.title.toLowerCase().includes(clean));
      if(fallback) return { mode: "section", title: fallback.title, data: fallback.data } as const;

      if (isMyListQuery(clean)) {
        const mainList = lists?.[0];
        const ids: string[] = mainList?.movieIds?.map((x:any)=>String(x)) || [];
        const data = ids.length ? (allMovies as any[]).filter((m:any)=> ids.includes(String(m.id))) : [];
        return { mode: "section", title: "My List", data } as const;
      }
      if (isLatestQuery(clean)) {
        const data = [...(allMovies as any[])].sort((a:any,b:any)=> getDate(b) - getDate(a));
        return { mode: "section", title: "Latest Movies", data } as const;
      }
      if (isTvQuery(clean)) {
        const data = (allMovies as any[]).filter((m: any) => (m.type || "").toLowerCase() === "full");
        return { mode: "section", title: "TV Series", data } as const;
      }
      if (isMiniQuery(clean)) {
        const data = (allMovies as any[]).filter((m: any) => (m.type || "").toLowerCase() === "mini");
        return { mode: "section", title: "Mini Series", data } as const;
      }
    }

    if (q) {
      const qClean = q.replace(/\s*movies\s*$/,"").trim();
      const words = qClean.split(" ").filter(w => w.length >= 1);

      if (isMyListQuery(q) || isMyListQuery(qClean) || isMyListQuery(qCleanForCheck)) {
        const mainList = lists?.[0];
        const ids: string[] = mainList?.movieIds?.map((x:any)=>String(x)) || [];
        const filtered = ids.length ? (allMovies as any[]).filter((m:any)=> ids.includes(String(m.id))) : [];
        return { mode: "search", title: "My List", data: filtered } as const;
      }
      if (isLatestQuery(q) || isLatestQuery(qClean) || isLatestQuery(qCleanForCheck)) {
        const filtered = [...(allMovies as any[])].sort((a:any,b:any)=> getDate(b) - getDate(a));
        return { mode: "search", title: "Latest Movies", data: filtered } as const;
      }
      if (isTvQuery(q) || isTvQuery(qClean) || isTvQuery(qCleanForCheck)) {
        const filtered = (allMovies as any[]).filter((m: any) => (m.type || "").toLowerCase() === "full");
        return { mode: "search", title: "TV Series", data: filtered } as const;
      }
      if (isMiniQuery(q) || isMiniQuery(qClean) || isMiniQuery(qCleanForCheck)) {
        const filtered = (allMovies as any[]).filter((m: any) => (m.type || "").toLowerCase() === "mini");
        return { mode: "search", title: "Mini Series", data: filtered } as const;
      }

      const filtered = allMovies.filter((m: any) => {
        const title = (m.title || "").toLowerCase();
        const genre = (m.genre || "").toLowerCase();
        const vj = (m.vj || "").toLowerCase();
        const type = (m.type || "").toLowerCase();
        const actors = (m.actors || "").toLowerCase();
        const hay = `${title} ${genre} ${vj} ${type} ${actors}`;
        if (hay.includes(q)) return true;
        if (genre === qClean) return true;
        if (vj === qClean) return true;
        if (type === qClean) return true;
        if (words.length > 1 && words.every((w: string) => hay.includes(w))) return true;
        if (hay.includes(qClean)) return true;
        return false;
      });
      return { mode: "search", title: `Filtered: ${query}`, data: filtered } as const;
    }

    return { mode: "browse", sections: baseSections } as const;
  }, [allMovies, baseSections, query, activeSection, lists]);

  return result;
}

