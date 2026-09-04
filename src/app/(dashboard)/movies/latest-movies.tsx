"use client";
import { useRef, useEffect } from "react";
import "./latest-movies.css";

type Movie = { id:number; title:string; genre:string; vj:string; cover:string; desc:string; video:string; preview:string[] };

export default function LatestMovies({ movies = [] }: { movies?: Movie[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  let isDragging = false;

  useEffect(()=>{
    const mount = mountRef.current;
    if(!mount) return;
    let isDown=false, startX=0, left=0;
    const getScroll = ()=> mount.scrollLeft;

    const onDown = (e: MouseEvent | TouchEvent)=>{
      const target = e.target as HTMLElement;
      if(target.closest('button')) return;
      isDown=true; isDragging=false;
      startX = 'touches' in e? e.touches[0].pageX : (e as MouseEvent).pageX;
      left=getScroll();
      mount.classList.add('is-dragging');
    };
    const onUp = ()=>{
      if(!isDown) return;
      isDown=false; mount.classList.remove('is-dragging');
      setTimeout(()=>{ isDragging=false; },80);
    };
    const onMove = (e: MouseEvent | TouchEvent)=>{
      if(!isDown) return;
      const pageX = 'touches' in e? e.touches[0].pageX : (e as MouseEvent).pageX;
      const walk = pageX - startX;
      if(Math.abs(walk)>5) isDragging=true;
      if(isDragging) mount.scrollLeft = left - walk;
    };

    mount.addEventListener('mousedown', onDown);
    mount.addEventListener('touchstart', onDown, {passive:true});
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    window.addEventListener('mousemove', onMove);
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
    <div className="latest-root rp-wrap rp-active">
      <div className="latest-head rp-head">
        <h3 className="latest-title rp-heading">latest movies</h3>
        <button className="latest-see" onClick={()=>{
          if(isDragging) return;
          location.hash="#/movies"
        }}>SEE ALL</button>
      </div>

      <div ref={mountRef} id="latestMount" className="rp-mount">
        <div className="rp-scroll">
          {movies.map((m) => (
            <div key={m.id} className="latest-card rp-card">
              <div className="l-card-cover rp-cover">
                <img src={m.cover} alt={m.title} loading="lazy" draggable={false} />
                <div className="l-card-fade" />
                <div className="l-card-vj-on">{m.vj}</div>
                <div className="l-card-actions">
                  <button className="l-a-btn play on" onClick={(e)=>{
                    e.stopPropagation(); if(isDragging) return;
                    if(m.video) window.open(m.video, "_blank")
                  }}>PLAY</button>
                  <button className="l-a-btn prev on" onClick={(e)=>{
                    e.stopPropagation(); if(isDragging) return;
                    if(m.preview?.[0]) window.open(m.preview[0], "_blank")
                  }}>PRE</button>
                </div>
              </div>
              <div className="l-card-title centered rp-title">{m.title}</div>
            </div>
          ))}
          <div className="rp-card more-card" onClick={()=>{ if(isDragging) return; location.hash="#/movies"; }}>
            <div className="rp-cover more-cover"><div className="more-grid"><div className="more-dot"></div><div className="more-dot"></div><div className="more-dot"></div><div className="more-dot"></div><div className="more-dot"></div><div className="more-dot"></div></div></div>
            <div className="rp-title">View All</div>
          </div>
        </div>
      </div>
    </div>
  );
}
