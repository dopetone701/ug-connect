"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useMovieStore } from "@/stores/use-movie-store";
import "./favorites-sheet.css";
import MovieRow from "@/app/(dashboard)/movies/_components/movie-row";
import FavoriteEmptySheet from "./favorite-empty-sheet";
import { useGlobalSearch } from "@/stores/use-global-search";
import { useRouter } from "next/navigation";

const MOVIE_API = "https://movie-server-api.connectu89.workers.dev/api/movies";
const USER_API = "https://user-account-server-api.connectu89.workers.dev";

const normalize = (x: any) => {
  const preview = x.preview_urls?.[0] || x.preview_url || x.trailer_url || x.video_preview_url || x.preview;
  return {
    ...x,
    id: String(x.id),
    cover: x.cover || x.cover_url,
    cover_url: x.cover || x.cover_url,
    video: x.video || x.video_url,
    video_url: x.video || x.video_url,
    preview_url: preview,
    preview_urls: x.preview_urls || (preview ? [preview] : []),
    trailer_url: x.trailer_url || preview,
  };
};

function isMobile() {
  if (typeof window === "undefined") return true;
  return window.innerWidth < 1024;
}

export default function FavoritesSheet() {
  const { favIds = [], recentIds = [], lists = [], watchLaterIds = [], hydrated, _hydrate } = useMovieStore() as any;
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const router = useRouter();
  const lastSentRef = useRef("");

  useEffect(() => { if (!hydrated) _hydrate?.(); }, [hydrated, _hydrate]);
  useEffect(() => {
    try {
      const c = localStorage.getItem("ug-all-movies");
      if (c) { const p = JSON.parse(c); if (Array.isArray(p) && p.length) { setAllMovies(p.map(normalize)); return; } }
    } catch {}
    fetch(MOVIE_API, { cache: "no-store" }).then(r => r.json()).then(d => {
      const list = d.movies || d.data || d || [];
      if (Array.isArray(list) && list.length) { const norm = list.map(normalize); setAllMovies(norm); try { localStorage.setItem("ug-all-movies", JSON.stringify(norm)); } catch {} }
    }).catch(() => {});
  }, []);

  // --- NEW: dispatch real IDs to D1 ---
  // Runs only when IDs actually change, not on every render
  useEffect(() => {
    if (!hydrated) return;
    const myList = lists?.find((l: any) => l.id === "my-list");
    const payload = {
      favIds: (favIds || []).map(String),
      recentIds: (recentIds || []).map(String).slice(0, 20),
      myListIds: (myList?.movieIds || []).map(String),
      watchLaterIds: (watchLaterIds || []).map(String),
    };
    const key = JSON.stringify(payload);
    if (key === lastSentRef.current) return;
    lastSentRef.current = key;

    const token = typeof window !== "undefined" ? localStorage.getItem("ug_token") : null;
    if (!token) return; // guest — nothing to save

    // Fire-and-forget, don't block Library UI
    fetch(`${USER_API}/api/user/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [hydrated, favIds, recentIds, lists, watchLaterIds]);

  useEffect(() => {
    const handleSeeAll = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest(".latest-see");
      if (!btn) return;
      const head = btn.closest(".latest-head");
      const title = (head?.querySelector(".latest-title")?.textContent || "").trim().toLowerCase();
      if (!title) return;

      e.preventDefault();
      e.stopPropagation();

      const gs = useGlobalSearch.getState() as any;
      gs.setQuery(title);
      gs.setSection?.(title);

      window.dispatchEvent(new CustomEvent("ug-close-account-sheet" as any));
      window.dispatchEvent(new CustomEvent("ug-close-sheet" as any));
      window.dispatchEvent(new CustomEvent("ug-close-menu-panel" as any));
      document.documentElement.classList.remove("is-sheet-open");
      document.body.style.overflow = "";
      try { (require("@/stores/use-side-sheet") as any).useSideSheet.getState().open(null); } catch {}

      setTimeout(() => {
        gs.openSearch?.();
        gs.setOpen?.(true);
        gs.setIsOpen?.(true);

        if (isMobile()) {
          window.dispatchEvent(new CustomEvent("ug-open-search-panel" as any, { detail: { query: title } }));
        } else {
          const param = encodeURIComponent(title);
          router.push(`/search?q=${param}&filter=${param}&section=${param}`);
        }
      }, 320);
    };

    document.addEventListener("click", handleSeeAll, true);
    return () => document.removeEventListener("click", handleSeeAll, true);
  }, [router]);

  const byId = useMemo(() => { const m = new Map(); allMovies.forEach((x: any) => { if (x?.id != null) m.set(String(x.id), x); }); return m; }, [allMovies]);
  const getMovies = (ids: any[]) => { if (!Array.isArray(ids) || !ids.length) return []; return ids.map((id: any) => { const key = String(id); return byId.get(key) || allMovies.find((a: any) => String(a?.id) === key); }).filter(Boolean); };

  const myList = lists?.find((l: any) => l.id === "my-list");
  const watchLaterList = lists?.find((l: any) => l.id === "watch-later");
  const myListMovies = getMovies(myList?.movieIds);
  const historyMovies = getMovies(recentIds).slice(0, 20);
  const likedMovies = getMovies(favIds);
  const watchLaterMovies = watchLaterIds?.length ? getMovies(watchLaterIds) : getMovies(watchLaterList?.movieIds);

  if (!hydrated) return <div className="vault-empty">Loading...</div>;
  const isEmpty = myListMovies.length === 0 && historyMovies.length === 0 && likedMovies.length === 0 && watchLaterMovies.length === 0;
  if (isEmpty) return <FavoriteEmptySheet />;
  const stop = (e: any) => e.stopPropagation();

  return (
    <div className="vault-root" onTouchStart={stop}>
      <div className="vault-row-block" onTouchStart={stop} onTouchMove={stop} onTouchEnd={stop}><MovieRow title="My List" movies={myListMovies} /></div>
      {historyMovies.length > 0 && <div className="vault-row-block" onTouchStart={stop} onTouchMove={stop} onTouchEnd={stop}><MovieRow title="Continue Watching" movies={historyMovies} /></div>}
      {likedMovies.length > 0 && <div className="vault-row-block" onTouchStart={stop} onTouchMove={stop} onTouchEnd={stop}><MovieRow title="Liked" movies={likedMovies} /></div>}
      {watchLaterMovies.length > 0 && <div className="vault-row-block" onTouchStart={stop} onTouchMove={stop} onTouchEnd={stop}><MovieRow title="Watch Later" movies={watchLaterMovies} /></div>}
    </div>
  );
}
