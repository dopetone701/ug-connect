"use client";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../latest-movies.css";
import "./similar-movies.css";
import { useMovieStore } from "../../../../../stores/use-movie-store";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
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
};

export default function SimilarMovies({ current }: { current: Movie }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef(false);
  const router = useRouter();
  const { addRecent } = useMovieStore();
  const { openDrawer } = useWatchDrawer();

  useEffect(() => {
    if (!current?.id) return;
    fetch(API_URL, { cache: "no-store" })
     .then((r) => r.json())
     .then((all: Movie[]) => {
        const others = all.filter((m) => String(m.id)!== String(current.id));
        let list = others.filter(
          (m) => m.genre?.toLowerCase().trim() === current.genre?.toLowerCase().trim()
        );
        if (list.length < 8 && current.vj) {
          const byVj = others.filter((m) => m.vj?.toLowerCase().trim() === current.vj?.toLowerCase().trim());
          const seen = new Set(list.map((x) => String(x.id)));
          list = [...list,...byVj.filter((x) =>!seen.has(String(x.id)))];
        }
        if (list.length < 8) {
          const seen = new Set(list.map((x) => String(x.id)));
          list = [...list,...others.filter((x) =>!seen.has(String(x.id)))].slice(0, 12);
        }
        setMovies(list.slice(0, 12));
      });
  }, [current]);

  // SAME LOGIC AS MovieCard - STORE ROUTED WELL
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

    const isPC = window.innerWidth > 768;
    if (isPC) {
      router.push(`/movies/watch/${id}?t=${t}`);
    } else {
      openDrawer(id, t);
    }
  };

  const seeAll = () => {
    let q = (current.genre || current.vj || "").toLowerCase().trim();
    if (q &&!q.includes("movies") && q.split(" ").length === 1) q = `${q} movies`;
    if (!q) q = "action movies";
    useGlobalSearch.getState().setQuery(q);
    useGlobalSearch.getState().setSection(q);
  };

  // drag scroll logic
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let isDown = false, startX = 0, scrollStart = 0, velocity = 0, lastX = 0, lastTime = 0, raf = 0;
    const kill = () => cancelAnimationFrame(raf);
    const momentum = () => {
      cancelAnimationFrame(raf);
      const step = () => {
        velocity *= 0.92;
        if (Math.abs(velocity) < 0.5) return;
        el.scrollLeft += velocity;
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const down = (x: number) => { kill(); isDown = true; dragRef.current = false; startX = x; lastX = x; scrollStart = el.scrollLeft; lastTime = performance.now(); velocity = 0; el.classList.add("is-dragging"); };
    const move = (x: number, e?: Event) => {
      if (!isDown) return;
      const now = performance.now(); const dx = x - startX; const dist = x - lastX; const dt = now - lastTime || 16;
      if (Math.abs(dx) > 3) dragRef.current = true;
      if (dragRef.current) { e?.preventDefault(); velocity = (dist / dt) * 16; el.scrollLeft = scrollStart - dx; }
      lastX = x; lastTime = now;
    };
    const up = () => { if (!isDown) return; isDown = false; el.classList.remove("is-dragging"); if (Math.abs(velocity) > 2) { velocity = -velocity; momentum(); } setTimeout(() => { dragRef.current = false; }, 80); };
    const md = (e: MouseEvent) => { if ((e.target as HTMLElement).closest(".l-a-btn")) return; down(e.pageX); };
    const mm = (e: MouseEvent) => move(e.pageX, e);
    const mu = () => up();
    const td = (e: TouchEvent) => { if ((e.target as HTMLElement).closest(".l-a-btn")) return; down(e.touches[0].pageX); };
    const tm = (e: TouchEvent) => move(e.touches[0].pageX, e);
    const tu = () => up();
    el.addEventListener("mousedown", md); window.addEventListener("mousemove", mm as any); window.addEventListener("mouseup", mu);
    el.addEventListener("touchstart", td as any, { passive: true } as any); el.addEventListener("touchmove", tm as any, { passive: false } as any); el.addEventListener("touchend", tu as any, { passive: true } as any);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousedown", md); window.removeEventListener("mousemove", mm as any); window.removeEventListener("mouseup", mu);
      el.removeEventListener("touchstart", td as any); el.removeEventListener("touchmove", tm as any); el.removeEventListener("touchend", tu as any);
    };
  }, [movies]);

  if (!movies.length) return null;

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title" onClick={seeAll}>More {current.genre || current.vj}</h3>
        <button className="latest-see" onClick={seeAll}>SEE ALL</button>
      </div>
      <div className="latest-track" ref={trackRef}>
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
