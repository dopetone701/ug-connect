"use client";
import { useRef, useEffect } from "react";
import "./latest-movies.css";

type Movie = { id:number; title:string; genre:string; vj:string; cover:string; desc:string; video:string; preview:string[] };

export default function LatestMovies({ movies = [] }: { movies?: Movie[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(()=>{
    const mount = mountRef.current;
    if(!mount) return;
    let isDown=false, isHorizontal=false, startX=0, startY=0, left=0;

    const onDown = (e: MouseEvent | TouchEvent)=>{
      if((e.target as HTMLElement).closest('button')) return;
      isDown=true; isDraggingRef.current=false; isHorizontal=false;
      const p = 'touches' in e? e.touches[0] : e as MouseEvent;
      startX=p.pageX; startY=p.pageY;
      left=mount.scrollLeft;
      mount.classList.add('is-dragging');
    };
    const onUp = ()=>{
      if(!isDown) return;
      isDown=false; isHorizontal=false;
      mount.classList.remove('is-dragging');
      setTimeout(()=>{ isDraggingRef.current=false; },100);
    };
    const onMove = (e: MouseEvent | TouchEvent)=>{
      if(!isDown) return;
      const p = 'touches' in e? e.touches[0] : e as MouseEvent;
      const dx = p.pageX - startX;
      const dy = p.pageY - startY;

      // IF VERTICAL > HORIZONTAL — ABORT, LET PAGE SCROLL
      if(!isHorizontal && Math.abs(dy) > Math.abs(dx)){
        isDown=false;
        mount.classList.remove('is-dragging');
        return;
      }
      if(Math.abs(dx) > 5){
        isHorizontal=true;
        isDraggingRef.current=true;
        // FIX: prevent browser from fighting us on mobile
        if ('touches' in e) e.preventDefault();
        mount.scrollLeft = left - dx;
      }
    };

    mount.addEventListener('mousedown', onDown);
    mount.addEventListener('touchstart', onDown, {passive:true});
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    window.addEventListener('mousemove', onMove);
    // FIX 2: passive:false so preventDefault works = no sticky
    window.addEventListener('touchmove', onMove, {passive:false});

    return ()=>{
      mount.removeEventListener('mousedown', onDown);
      mount.removeEventListener('touchstart', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
    }
  },[]);

  if (!movies.length) return null;

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">latest movies</h3>
        <button className="latest-see" onClick={()=>{ if(isDraggingRef.current) return; location.hash="#/movies" }}>SEE ALL</button>
      </div>

      <div ref={mountRef} id="latestMount" className="latest-track">
        <div className="rp-scroll">
          {movies.map((m) => (
            <div key={m.id} className="latest-card">
              <div className="l-card-cover">
                <img src={m.cover} alt={m.title} loading="lazy" draggable={false} />
                <div className="l-card-fade" />
                <div className="l-card-vj-on">{m.vj}</div>
                <div className="l-card-actions">
                  <button className="l-a-btn play on" onClick={(e)=>{
                    e.stopPropagation(); if(isDraggingRef.current) return;
                    if(m.video) window.open(m.video, "_blank")
                  }}>PLAY</button>
                  <button className="l-a-btn prev on" onClick={(e)=>{
                    e.stopPropagation(); if(isDraggingRef.current) return;
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
