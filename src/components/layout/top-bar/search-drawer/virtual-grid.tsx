"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./search-drawer.css";

export function VirtualGrid({ movies }: { movies: any[] }) {
  const [visible, setVisible] = useState(30);
  const [zoomed, setZoomed] = useState<any>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => setVisible(30), [movies]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(v => Math.min(v + 30, movies.length));
    }, { rootMargin: "500px" });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [movies.length]);

  if (!movies.length) {
    return <div style={{padding:"40px", textAlign:"center", color:"hsl(var(--text-muted))"}}>No match</div>;
  }

  const Card = ({ m, isZoom = false }: { m: any; isZoom?: boolean }) => (
    <div className={isZoom? "latest-card search-zoom-card" : "latest-card"} onClick={() =>!isZoom && setZoomed(m)}>
      <div className="l-card-cover">
        <img src={m.cover_url || m.cover} alt={m.title} loading="lazy" draggable={false} />
        <div className="l-card-fade" />
        <div className="l-card-vj-on">{m.vj}</div>
        <div className="l-card-actions">
          <button
            className="l-a-btn play on"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/movies/watch/${m.id}?t=full`);
            }}
          >
            PLAY
          </button>
          <button
            className="l-a-btn prev on"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/movies/watch/${m.id}?t=preview`);
            }}
          >
            PRE
          </button>
        </div>
      </div>
      <div className="l-card-title centered">{m.title}</div>
    </div>
  );

  return (
    <>
      <div className="search-3col-grid">
        {movies.slice(0, visible).map((m) => (
          <Card key={m.id} m={m} />
        ))}
      </div>
      <div ref={loaderRef} />

      {zoomed && (
        <div className="search-zoom-overlay" onClick={() => setZoomed(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Card m={zoomed} isZoom />
          </div>
        </div>
      )}
    </>
  );
}
