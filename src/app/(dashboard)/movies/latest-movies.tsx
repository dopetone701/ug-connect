"use client";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./latest-movies.css";
import { usesingleplayer } from "./_components/single-player";
import { useGlobalSearch } from "@/stores/use-global-search";

type Movie = { id:number; title:string; genre:string; vj:string; cover:string; cover_url?:string; desc:string; video:string; video_url?:string; preview:string[]; preview_urls?:string[] };

export default function latestmovies({ movies = [] }: { movies?: Movie[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const router = useRouter();
  const { playmovie } = usesingleplayer();

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
    const getScroll = () => container.scrollLeft;
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
      scrollStart = getScroll();
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
      if (Math.abs(dx) > 3 &&!isDraggingRef.current) {
        isDraggingRef.current = true;
      }
      if (isDraggingRef.current) {
        if (e) e.preventDefault();
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
    const md = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.l-a-btn')) return;
      onDown(e.pageX);
    };
    const mm = (e: MouseEvent) => onMove(e.pageX, e);
    const mu = () => onUp();
    const td = (e: TouchEvent) => {
      if ((e.target as HTMLElement).closest('.l-a-btn')) return;
      onDown(e.touches[0].pageX);
    };
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
    const clean = "latest movies"
    useGlobalSearch.getState().setQuery(clean)
  }

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
                <button className="l-a-btn play on" onClick={(e)=>{
                  e.stopPropagation();
                  if(isDraggingRef.current) return;
                  playmovie(m);
                  router.push(`/movies/watch/${m.id}?t=full`);
                }}>PLAY</button>
                <button className="l-a-btn prev on" onClick={(e)=>{
                  e.stopPropagation();
                  if(isDraggingRef.current) return;
                  playmovie(m);
                  router.push(`/movies/watch/${m.id}?t=preview`);
                }}>PRE</button>
              </div>
            </div>
            <div className="l-card-title centered">{m.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
