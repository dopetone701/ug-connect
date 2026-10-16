"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMovieStore } from "../../../../stores/use-movie-store";
import "../latest-movies.css";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { useReelsDrawer } from "@/stores/use-reels-drawer";
import { useGlobalSearch } from "@/stores/use-global-search";

type Props = {
  movies?: any[];
};

function isMobileDevice() {
  if (typeof window === "undefined") return true;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return true;
  if (typeof navigator !== "undefined" && (navigator as any).maxTouchPoints > 0 && window.innerWidth <= 1024) return true;
  return false;
}

export default function UserListsRow({ movies = [] }: Props) {
  const { lists, createList } = useMovieStore() as any;
  const router = useRouter();

  useEffect(() => {
    if (lists.length === 0) {
      createList("my-list");
    }
  }, [lists.length, createList]);

  const mainList = lists[0];

  const handleSeeAll = () => {
    const clean = "my list";
    const mobile = isMobileDevice();
    const gs = useGlobalSearch.getState() as any;
    gs.setQuery(clean);
    gs.setSection?.(clean);
    gs.openSearch?.();
    gs.setOpen?.(true);
    gs.setIsOpen?.(true);

    if (mobile) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ug-open-search-panel"));
      }
      return;
    }

    const param = encodeURIComponent(clean);
    router.push(`/search?q=${param}&filter=${param}&section=${param}`);
  };

  if (!mainList) {
    return (
      <div className="latest-root">
        <div className="latest-head">
          <h3 className="latest-title" onClick={handleSeeAll} style={{ cursor: "pointer" }}>
            my list
          </h3>
          <button className="latest-see" onClick={handleSeeAll}>SEE ALL</button>
        </div>
        <div className="latest-track-wrap">
          <div className="latest-track">
            <div className="latest-card">
              <div className="l-card-cover" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(var(--surface))", borderRadius: 6 }}>
                <span style={{ fontWeight: 900, fontSize: 13 }}>MY LIST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const myMovies = movies.filter((m: any) => mainList.movieIds?.includes(String(m.id)) || mainList.movieIds?.includes(m.id));

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title" onClick={handleSeeAll} style={{ cursor: "pointer" }}>
          my list
        </h3>
        <button className="latest-see" onClick={handleSeeAll}>
          {mainList.movieIds?.length ? `${mainList.movieIds.length} movies • SEE ALL` : "SEE ALL"}
        </button>
      </div>
      <div className="latest-track-wrap">
        <div className="latest-track">
          {myMovies.length === 0 ? (
            <div className="latest-card">
              <div className="l-card-cover" style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", justifyContent: "center", background: "hsl(var(--surface))", borderRadius: 6 }}>
                <span style={{ fontWeight: 900, fontSize: 14 }}>MY LIST</span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>EMPTY</span>
              </div>
            </div>
          ) : (
            myMovies.map((movie: any) => <ListMovieCard key={String(movie.id)} movie={movie} allMovies={myMovies} />)
          )}
        </div>
      </div>
    </div>
  );
}

function ListMovieCard({ movie, allMovies }: { movie: any; allMovies: any[] }) {
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const { addRecent } = useMovieStore() as any;
  const { openDrawer } = useWatchDrawer() as any;
  const { openReels } = useReelsDrawer() as any;

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    movedRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const dx = Math.abs(e.clientX - startXRef.current);
    const dy = Math.abs(e.clientY - startYRef.current);
    if (dx > 6 || dy > 6) movedRef.current = true;
  };
  const handlePointerUp = () => {
    setTimeout(() => {
      movedRef.current = false;
    }, 100);
  };

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

  const openMovie = (e: React.MouseEvent, mode: "full" | "preview") => {
    e.preventDefault();
    e.stopPropagation();
    if (movedRef.current) return;

    const id = String(movie.id);
    addRecent(id);

    try {
      sessionStorage.setItem(
        `movie_preload_${id}`,
        JSON.stringify({
          id,
          title: movie.title,
          cover_url: movie.cover,
          video_url: movie.video,
          preview_url: movie.preview_url,
          preview_urls: movie.preview_urls,
          genre: movie.genre,
          vj: movie.vj,
          description: movie.desc,
        })
      );
    } catch {}

    if (mode === "preview") {
      const list = allMovies.map(normalize);
      const idx = allMovies.findIndex((x: any) => String(x.id) === id);
      openReels(list, idx >= 0 ? idx : 0);
      return;
    }

    openDrawer(id);
  };

  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="latest-card" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div className="l-card-cover" style={{ borderRadius: 6 }}>
        <img src={movie.cover} alt={movie.title} draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", userSelect: "none" }} />
        <div className="l-card-fade" />
        <div className="l-card-actions" style={{ borderRadius: "0 0 6px 6px" }}>
          <button type="button" className="l-a-btn play on" style={{ borderRadius: "0 0 0 6px" }} onClick={(e) => openMovie(e, "full")} onPointerDown={stop} onPointerUp={stop}>
            PLAY
          </button>
          <button type="button" className="l-a-btn prev on" style={{ borderRadius: "0 0 6px 0" }} onClick={(e) => openMovie(e, "preview")} onPointerDown={stop} onPointerUp={stop}>
            PRE
          </button>
        </div>
      </div>
    </div>
  );
}

