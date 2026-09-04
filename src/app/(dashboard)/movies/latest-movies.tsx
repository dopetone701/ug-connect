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
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const onMouseDown = (e: React.MouseEvent) => {
    isDown = true;
    const track = trackRef.current!;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  };
  const onMouseLeave = () => { isDown = false; };
  const onMouseUp = () => { isDown = false; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const track = trackRef.current!;
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
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
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {movies.map((m) => (
            <div key={m.id} className="latest-card">
              <div className="l-card-cover">
                <img src={m.cover} alt={m.title} loading="lazy" />
                <div className="l-card-fade" />
                <div className="l-card-vj-on">{m.vj}</div>

                {/* BASE DOUBLE PILL - PART OF CARD */}
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
