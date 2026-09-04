"use client";
import { useRef } from "react";
import "./latest-movies.css";

type Movie = {
  id: number;
  title: string;
  genre: string;
  vj: string;
  cover: string;
  desc: string;
  video: string;
  preview: string[];
};

export default function LatestMovies({ movies = [] }: { movies?: Movie[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    isDown.current = true;
    const track = trackRef.current!;
    track.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    scrollLeft.current = track.scrollLeft;
    track.style.cursor = "grabbing";
    track.style.userSelect = "none";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDown.current) return;
    const track = trackRef.current!;
    const x = e.clientX;
    const walk = x - startX.current;
    track.scrollLeft = scrollLeft.current - walk;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    isDown.current = false;
    const track = trackRef.current!;
    track.releasePointerCapture(e.pointerId);
    track.style.cursor = "grab";
    track.style.userSelect = "";
  };

  if (!movies.length) return null;

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">latest movies</h3>
        <button className="latest-see">SEE ALL</button>
      </div>

      <div className="latest-track-wrap">
        <div
          ref={trackRef}
          className="latest-track"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {movies.map((m) => (
            <div key={m.id} className="latest-card">
              <div className="l-card-cover">
                <img src={m.cover} alt={m.title} loading="lazy" draggable={false} />
                <div className="l-card-fade" />
                <div className="l-card-vj-on">{m.vj}</div>
                <div className="l-card-actions">
                  <button className="l-a-btn play on" onClick={() => m.video && window.open(m.video, "_blank")}>PLAY</button>
                  <button className="l-a-btn prev on" onClick={() => m.preview[0] && window.open(m.preview[0], "_blank")}>PRE</button>
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
