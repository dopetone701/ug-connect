"use client";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../latest-movies.css";
import "./similar-movies.css";

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies";

type Movie = { id:number; title:string; genre:string; vj:string; cover:string; cover_url?:string; video?:string; video_url?:string; preview?:string[]; preview_urls?:string[] };

export default function SimilarMovies({ current }: { current: Movie }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const router = useRouter();

  useEffect(()=>{
    if(!current?.id) return;
    fetch(API_URL, {cache:"no-store"})
   .then(r=>r.json())
   .then((all:Movie[])=>{
       const others = all.filter(m=> String(m.id)!== String(current.id));
       let list = others.filter(m=> m.genre && String(m.genre).toLowerCase().trim() === String(current.genre||"").toLowerCase().trim());
       if(list.length < 8 && current.vj){
         const byVj = others.filter(m=> String(m.vj||"").toLowerCase().trim() === String(current.vj||"").toLowerCase().trim());
         const seen = new Set(list.map(x=>String(x.id)));
         list = [...list,...byVj.filter(x=>!seen.has(String(x.id)))];
       }
       if(list.length < 6){
         const seen = new Set(list.map(x=>String(x.id)));
         list = [...list,...others.filter(x=>!seen.has(String(x.id)))].slice(0,12);
       }
       setMovies(list.slice(0,12));
     });
  },[current]);

  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;
    let isDown = false; let startX = 0; let scrollStart = 0; let velocity = 0; let lastX = 0; let lastTime = 0; let rafId = 0;
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
      killMomentum(); isDown = true; isDraggingRef.current = false;
      startX = x; lastX = x; scrollStart = getScroll(); lastTime = performance.now(); velocity = 0;
      container.classList.add('is-dragging');
    };
    const onMove = (x: number, e?: Event) => {
      if (!isDown) return;
      const now = performance.now(); const dx = x - startX; const dist = x - lastX; const dt = now - lastTime || 16;
      if (Math.abs(dx) > 3 &&!isDraggingRef.current) isDraggingRef.current = true;
      if (isDraggingRef.current) { if (e) e.preventDefault(); velocity = (dist / dt) * 16; container.scrollLeft = scrollStart - dx; }
      lastX = x; lastTime = now;
    };
    const onUp = () => {
      if (!isDown) return; isDown = false; container.classList.remove('is-dragging');
      if (Math.abs(velocity) > 2) { velocity = -velocity; momentum(); }
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

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">More {current.genre || current.vj}</h3>
        <button className="latest-see" onClick={()=>{ location.hash="#/movies" }}>SEE ALL</button>
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
                  router.push(`/movies/watch/${m.id}?t=full`);
                }}>PLAY</button>
                <button className="l-a-btn prev on" onClick={(e)=>{
                  e.stopPropagation();
                  if(isDraggingRef.current) return;
                  router.push(`/movies/watch/${m.id}?t=preview`);
                }}>PRE</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
