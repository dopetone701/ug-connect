"use client";
import { useRef } from "react";
import "./latest-movies.css";

type Movie = { id:number; title:string; genre:string; vj:string; cover:string; desc:string; video:string; preview:string[] };

export default function LatestMovies({ movies = [] }: { movies?: Movie[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const state = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    left: 0,
    locked: null as null | "x" | "y",
  });

  const isDraggingRef = state as any; // keep your old checks working
  isDraggingRef.current = state.current.isDragging;

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.button!== 0) return;

    state.current.isDown = true;
    state.current.isDragging = false;
    state.current.locked = null;
    state.current.startX = e.clientX;
    state.current.startY = e.clientY;
    state.current.left = mountRef.current!.scrollLeft;

    mountRef.current!.classList.add("is-dragging");
    mountRef.current!.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!state.current.isDown) return;

    const dx = e.clientX - state.current.startX;
    const dy = e.clientY - state.current.startY;

    if (!state.current.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return; // deadzone

      // IF VERTICAL > HORIZONTAL — ABORT, LET PAGE SCROLL
      if (Math.abs(dy) > Math.abs(dx)) {
        state.current.locked = "y";
        state.current.isDown = false;
        mountRef.current!.classList.remove("is-dragging");
        try { mountRef.current!.releasePointerCapture(e.pointerId) } catch {}
        return;
      }
      state.current.locked = "x";
    }

    if (state.current.locked === "x") {
      state.current.isDragging = true;
      // no * multiplier = no snap back
      mountRef.current!.scrollLeft = state.current.left - dx;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!state.current.isDown &&!state.current.isDragging) return;
    state.current.isDown = false;
    state.current.locked = null;
    mountRef.current!.classList.remove("is-dragging");
    try { mountRef.current!.releasePointerCapture(e.pointerId) } catch {}
    setTimeout(() => {
      state.current.isDragging = false;
    }, 150);
  };

  if (!movies.length) return null;

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">latest movies</h3>
        <button className="latest-see" onClick={()=>{ if(state.current.isDragging) return; location.hash="#/movies" }}>SEE ALL</button>
      </div>

      <div
        ref={mountRef}
        id="latestMount"
        className="latest-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(e)=>{
          if(state.current.isDragging){
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div className="rp-scroll">
          {movies.map((m) => (
            <div key={m.id} className="latest-card">
              <div className="l-card-cover">
                <img src={m.cover} alt={m.title} loading="lazy" draggable={false} />
                <div className="l-card-fade" />
                <div className="l-card-vj-on">{m.vj}</div>
                <div className="l-card-actions">
                  <button className="l-a-btn play on" onClick={(e)=>{
                    e.stopPropagation(); if(state.current.isDragging) return;
                    if(m.video) window.open(m.video, "_blank")
                  }}>PLAY</button>
                  <button className="l-a-btn prev on" onClick={(e)=>{
                    e.stopPropagation(); if(state.current.isDragging) return;
                    if(m.preview?.[0]) window.open(m.preview[0], "_blank")
                  }}>PRE</button>
                </div>
              </div>
              <div className="l-card-title centered">{m.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
