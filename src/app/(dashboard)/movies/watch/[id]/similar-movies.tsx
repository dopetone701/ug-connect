"use client";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../latest-movies.css";
import "./similar-movies.css";
import { attachNoonScroll } from "../../_lib/noon-scroll";
import { useMovieStore } from "../../../../../stores/use-movie-store";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { useReelsDrawer } from "@/stores/use-reels-drawer";
import { useGlobalSearch } from "@/stores/use-global-search";

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies";

type Movie = {
  id: number | string;
  title: string;
  genre?: string;
  vj?: string;
  cover?: string;
  cover_url?: string;
  video?: string;
  video_url?: string;
  desc?: string;
  preview_urls?: string[];
  preview_url?: string;
  trailer_url?: string;
};

export default function SimilarMovies({ current }: { current: Movie }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const router = useRouter();
  const { addRecent } = useMovieStore();
  const { openDrawer, closeDrawer } = useWatchDrawer();
  const { openReels } = useReelsDrawer();

  useEffect(() => {
    if (!current?.id) return;
    fetch(API_URL, { cache: "no-store" })
      .then((r) => r.json())
      .then((all: Movie[]) => {
        const others = all.filter((m) => String(m.id) !== String(current.id));
        let list = others.filter((m) => m.genre?.toLowerCase().trim() === current.genre?.toLowerCase().trim());
        if (list.length < 8 && current.vj) {
          const byVj = others.filter((m) => m.vj?.toLowerCase().trim() === current.vj?.toLowerCase().trim());
          const seen = new Set(list.map((x) => String(x.id)));
          list = [...list, ...byVj.filter((x) => !seen.has(String(x.id)))];
        }
        if (list.length < 8) {
          const seen = new Set(list.map((x) => String(x.id)));
          list = [...list, ...others.filter((x) => !seen.has(String(x.id)))].slice(0, 12);
        }
        setMovies(list.slice(0, 12));
      });
  }, [current]);

  // NOON-SCROLL — same as Mini Series, no custom drag/momentum
  useEffect(() => {
    if (!trackRef.current) return;
    const cleanup = attachNoonScroll(trackRef.current);
    return cleanup;
  }, [movies]);

  // Tap-vs-swipe guard only — NOT scroll logic
  const onTrackPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
  };
  const onTrackPointerMove = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const dx = Math.abs(e.clientX - startXRef.current);
    const dy = Math.abs(e.clientY - startYRef.current);
    if (dx > 6 || dy > 6) dragRef.current = true;
  };
  const onTrackPointerUp = () => {
    setTimeout(() => { dragRef.current = false; }, 100);
  };

  const normalize = (x: any) => {
    const preview = x?.preview_urls?.[0] || x?.preview_url || x?.trailer_url || x?.video_preview_url || x?.preview;
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

  // INSTANT STOP - same engine as watch-client preview btn
  const stopAllVideosInstant = () => {
    try {
      document.querySelectorAll("video").forEach((v: any) => {
        try {
          v.pause();
          v.muted = true;
          v.currentTime = v.currentTime; // freeze frame
        } catch {}
      });
    } catch {}
    // close any watch drawer that might be playing underneath
    try { closeDrawer?.(); } catch {}
  };

  const openMovie = (m: Movie, t: "full" | "preview" = "full") => {
    if (dragRef.current) return;
    const id = String(m.id);
    addRecent(id);
    try {
      sessionStorage.setItem(`movies_home_scroll_v1`, String(window.scrollY));
      sessionStorage.setItem(
        `movie_preload_${id}`,
        JSON.stringify({
          id,
          title: m.title,
          cover_url: (m as any).cover_url || m.cover,
          video_url: (m as any).video_url || (m as any).video,
          genre: m.genre,
          vj: m.vj,
          description: (m as any).desc,
        })
      );
    } catch {}

    if (t === "preview") {
      // EXACTLY what preview btn does in watch-client
      stopAllVideosInstant();

      const rawList = movies.length ? movies : [m];
      const hasClicked = rawList.some((x) => String(x.id) === String(id));
      const finalRaw = hasClicked ? rawList : [m, ...rawList];
      const list = finalRaw.map(normalize);
      const idx = finalRaw.findIndex((x) => String(x.id) === String(id));

      // open reels instantly - no delay, single engine
      openReels(list, idx >= 0 ? idx : 0);
      return;
    }

    // PLAY = connect player as before
    const isPC = window.innerWidth > 768;
    if (isPC) {
      router.push(`/movies/watch/${id}?t=${t}`);
    } else {
      openDrawer(id, t);
    }
  };

  const seeAll = () => {
    let q = (current.genre || current.vj || "").toLowerCase().trim();
    if (q && !q.includes("movies") && q.split(" ").length === 1) q = `${q} movies`;
    if (!q) q = "action movies";
    useGlobalSearch.getState().setQuery(q);
    useGlobalSearch.getState().setSection(q);
  };

  if (!movies.length) return null;

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title" onClick={seeAll}>More {current.genre || current.vj}</h3>
        <button className="latest-see" onClick={seeAll}>SEE ALL</button>
      </div>
      <div
        className="latest-track noon-scroll"
        ref={trackRef}
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={onTrackPointerUp}
      >
        {movies.map((m) => (
          <div key={m.id} className="latest-card" onClick={() => openMovie(m, "full")}>
            <div className="l-card-cover">
              <img src={(m as any).cover_url || m.cover} alt={m.title} loading="lazy" draggable={false} />
              <div className="l-card-fade" />
              <div className="l-card-vj-on">{m.vj}</div>
              <div className="l-card-actions">
                <button className="l-a-btn play on" onClick={(e) => { e.stopPropagation(); openMovie(m, "full"); }}>PLAY</button>
                <button className="l-a-btn prev on" onClick={(e) => { e.stopPropagation(); openMovie(m, "preview"); }}>PRE</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
