"use client";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./latest-movies.css";
import { useGlobalSearch } from "@/stores/use-global-search";

type Movie = {
  id:number;
  title:string;
  genre:string;
  vj:string;
  cover:string;
  cover_url?:string;
  desc:string;
  video:string;
  video_url?:string;
  preview:string[];
  preview_urls?:string[];
};

function isMobileDevice() {
  if (typeof window === "undefined") return true;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return true;
  if (typeof navigator !== "undefined" && (navigator as any).maxTouchPoints > 0 && window.innerWidth <= 1024) return true;
  return false;
}

export default function LatestMovies({ movies = [] }: { movies?: Movie[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;
    let rafId = 0;

    const killMomentum = () => cancelAnimationFrame(rafId);
    const momentum = () => {
      cancelAnimationFrame(rafId);
      const step = () => {
        velocity *= 0.92;
        if (Math.abs(velocity) < 0.5) return;
        container.scrollLeft += velocity;
        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    };

    const onDown = (x: number) => {
      killMomentum();
      isDown = true;
      isDraggingRef.current = false;
      startX = x;
      lastX = x;
      scrollStart = container.scrollLeft;
      lastTime = performance.now();
      velocity = 0;
      container.classList.add('is-dragging');
    };

    const onMove = (x: number, e?: Event) => {
      if (!isDown) return;
      const now = performance.now();
      const dx = x - startX;
      const dist = x - lastX;
      const dt = now - lastTime || 16;
      if (Math.abs(dx) > 3) isDraggingRef.current = true;
      if (isDraggingRef.current) {
        e?.preventDefault();
        velocity = (dist / dt) * 16;
        container.scrollLeft = scrollStart - dx;
      }
      lastX = x;
      lastTime = now;
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('is-dragging');
      if (Math.abs(velocity) > 2) {
        velocity = -velocity;
        momentum();
      }
      setTimeout(() => { isDraggingRef.current = false; }, 60);
    };

    const md = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('.l-a-btn')) return; onDown(e.pageX); };
    const mm = (e: MouseEvent) => onMove(e.pageX, e);
    const mu = () => onUp();
    const td = (e: TouchEvent) => { if ((e.target as HTMLElement).closest('.l-a-btn')) return; onDown(e.touches[0].pageX); };
    const tm = (e: TouchEvent) => onMove(e.touches[0].pageX, e);
    const tu = () => onUp();

    container.addEventListener('mousedown', md);
    window.addEventListener('mousemove', mm, { passive: false } as any);
    window.addEventListener('mouseup', mu);
    container.addEventListener('touchstart', td, { passive: true } as any);
    container.addEventListener('touchmove', tm, { passive: false } as any);
    container.addEventListener('touchend', tu, { passive: true } as any);

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousedown', md);
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mouseup', mu);
      container.removeEventListener('touchstart', td as any);
      container.removeEventListener('touchmove', tm as any);
      container.removeEventListener('touchend', tu as any);
    };
  }, [movies]);

  if (!movies.length) return null;

  const handleSeeAll = () => {
    const clean = "latest movies";
    const mobile = isMobileDevice();

    const gs = useGlobalSearch.getState() as any;
    gs.setQuery(clean);
    gs.setSection?.(clean);
    gs.openSearch?.();
    gs.setOpen?.(true);
    gs.setIsOpen?.(true);

    // GOAT TRICK: mobile = drawer only, no PC sneak
    if (mobile) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ug-open-search-panel"));
      }
      return;
    }

    // desktop only
    const param = encodeURIComponent(clean);
    router.push(`/search?q=${param}&filter=${param}&section=${param}`);
  };

  const openMovie = (m: Movie, t: "full" | "preview") => {
    if (isDraggingRef.current) return;
    router.push(`/movies/watch/${m.id}?t=${t}`);
  };

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title" onClick={handleSeeAll} style={{cursor:"pointer"}}>latest movies</h3>
        <button className="latest-see" onClick={handleSeeAll}>SEE ALL</button>
      </div>

      <div className="latest-track" ref={trackRef}>
        {movies.map((m) => (
          <div key={m.id} className="latest-card">
            <div className="l-card-cover">
              <img src={(m as any).cover_url || m.cover} alt={m.title} loading="lazy" draggable={false} />
              <div className="l-card-fade" />
              <div className="l-card-vj-on">{m.vj}</div>
              <div className="l-card-actions">
                <button className="l-a-btn play on" onClick={(e)=>{ e.stopPropagation(); openMovie(m, "full"); }}>PLAY</button>
                <button className="l-a-btn prev on" onClick={(e)=>{ e.stopPropagation(); openMovie(m, "preview"); }}>PRE</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

