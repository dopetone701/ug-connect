"use client";
import { useRef, useEffect, useMemo } from "react";
import "./explore-more.css";
import { Movie } from "./types";

type Props = { movies: Movie[] };

const GROUPS = [
  { id: "popular", label: "MOST POPULAR", match: () => true },
  { id: "western", label: "WESTERN MOVIES", match: (m: Movie) => /western|hollywood|action|marvel|spider/i.test(m.title + " " + m.genre + " " + m.vj) },
  { id: "ugandan", label: "UGANDAN MOVIES", match: (m: Movie) => /uganda|ugandan|luganda|bobi|katumba/i.test(m.title + " " + m.genre + " " + m.vj) },
  { id: "nigerian", label: "NIGERIAN MOVIES", match: (m: Movie) => /nigeria|nollywood|naija|yoruba/i.test(m.title + " " + m.genre + " " + m.vj) },
  { id: "korean", label: "KOREAN MOVIES", match: (m: Movie) => /korea|korean|k-drama|kdrama/i.test(m.title + " " + m.genre + " " + m.vj) },
  { id: "philipines", label: "FILIPINO MOVIES", match: (m: Movie) => /philip|filipino|tagalog/i.test(m.title + " " + m.genre + " " + m.vj) },
  { id: "indian", label: "INDIAN MOVIES", match: (m: Movie) => /india|indian|bollywood|hindi|tamil|telugu|south asian/i.test(m.title + " " + m.genre + " " + m.vj) },
];

function useNoonDrag(ref: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let isDown = false, startX = 0, startScroll = 0, vel = 0, lastX = 0, lastT = 0, raf = 0;
    const kill = () => cancelAnimationFrame(raf);
    const momentum = () => {
      const step = () => {
        vel *= 0.92; // noon friction = 0.92 faster stop than for-you 0.94 = different system
        if (Math.abs(vel) < 0.5) return;
        el.scrollLeft += vel;
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const down = (x: number) => { kill(); isDown = true; startX = x; startScroll = el.scrollLeft; lastX = x; lastT = performance.now(); vel = 0; el.classList.add("dragging"); };
    const move = (x: number, e?: Event) => {
      if (!isDown) return;
      const dx = x - startX;
      if (Math.abs(dx) > 5) e?.preventDefault();
      const now = performance.now();
      const dt = now - lastT || 16;
      vel = ((x - lastX) / dt) * 16;
      el.scrollLeft = startScroll - dx;
      lastX = x; lastT = now;
    };
    const up = () => {
      if (!isDown) return;
      isDown = false; el.classList.remove("dragging");
      if (Math.abs(vel) > 2) { vel = -vel; momentum(); }
    };
    const md = (e: MouseEvent) => down(e.pageX);
    const mm = (e: MouseEvent) => move(e.pageX, e);
    const td = (e: TouchEvent) => down(e.touches[0].pageX);
    const tm = (e: TouchEvent) => move(e.touches[0].pageX, e);
    el.addEventListener("mousedown", md);
    window.addEventListener("mousemove", mm as any, { passive: false } as any);
    window.addEventListener("mouseup", up);
    el.addEventListener("touchstart", td as any, { passive: true } as any);
    el.addEventListener("touchmove", tm as any, { passive: false } as any);
    el.addEventListener("touchend", up as any, { passive: true } as any);
    return () => {
      kill();
      el.removeEventListener("mousedown", md);
      window.removeEventListener("mousemove", mm as any);
      window.removeEventListener("mouseup", up);
      el.removeEventListener("touchstart", td as any);
      el.removeEventListener("touchmove", tm as any);
      el.removeEventListener("touchend", up as any);
    };
  }, [ref]);
}

export default function ExploreMore({ movies }: Props) {
  const trackRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const groups = useMemo(() => {
    const sorted = [...movies].sort((a,b) => (b.views||0) - (a.views||0));
    return GROUPS.map(g => {
      if (g.id === "popular") return {...g, data: sorted.slice(0, 12) };
      const data = sorted.filter(m => g.match(m)).slice(0, 12);
      return {...g, data: data.length? data : sorted.slice(0, 6) }; // fallback to popular if empty
    }).filter(g => g.data.length);
  }, [movies]);

  return (
    <div className="em-root">
      <h2 className="em-main-title">Explore More</h2>
      {groups.map(group => (
        <div key={group.id} className="em-section">
          <div className="em-head">
            <h3 className="em-title">{group.label}</h3>
            <button className="em-see" onClick={()=> location.hash="#/movies"}>SEE ALL</button>
          </div>
          <div
            className="em-track"
            ref={el => { trackRefs.current[group.id] = el; }}
            // attach noon drag per row
            onMouseDown={e => {
              const el = trackRefs.current[group.id];
              if(!el) return;
              // quick init if hook not yet - we use inline for multi refs
              const startX = e.pageX;
              const startScroll = el.scrollLeft;
              let vel = 0, lastX = startX, lastT = performance.now(), isDown = true, raf = 0;
              const move = (ev: MouseEvent) => {
                if(!isDown) return;
                const dx = ev.pageX - startX;
                const now = performance.now();
                vel = ((ev.pageX - lastX) / (now - lastT || 16)) * 16;
                el.scrollLeft = startScroll - dx;
                lastX = ev.pageX; lastT = now;
              };
              const up = () => {
                isDown = false;
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
                if(Math.abs(vel) > 2) {
                  let v = -vel;
                  const step = () => { v *= 0.92; if(Math.abs(v) < 0.5) return; el.scrollLeft += v; requestAnimationFrame(step); };
                  requestAnimationFrame(step);
                }
              };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
          >
            {group.data.map(m => (
              <div key={`${group.id}-${m.id}`} className="em-card" onClick={()=> m.video && window.open(m.video, "_blank")}>
                <img src={m.cover} alt={m.title} loading="lazy" draggable={false} />
                <div className="em-overlay" />
                <div className="em-label">{group.label}</div>
                <div className="em-small">{m.title}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
