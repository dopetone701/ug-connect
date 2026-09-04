"use client";
import { useRef, useMemo } from "react";
import "./recommended.css";

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

export default function RecommendedMovies({ movies = [] }: { movies?: Movie[] }) {
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

  // LOGIC DIFFERENT: shuffle + reverse to feel like recommendation
  const rec = useMemo(() => {
    const shuffled = [...movies].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, [movies]);

  if (!rec.length) return null;

  return (
    <div className="rec-root">
      <div className="rec-head">
        <h3 className="rec-title">recommended for you</h3>
        <button className="rec-see">SEE ALL</button>
      </div>

      <div className="rec-track-wrap">
        <div
          ref={trackRef}
          className="rec-track"
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {rec.map((m) => (
            <div key={`rec-${m.id}`} className="rec-card">
              <div className="rec-card-cover">
                <img src={m.cover} alt={m.title} loading="lazy" />
                <div className="rec-card-fade" />
                <div className="rec-card-vj-on">{m.vj}</div>
                <div className="rec-card-actions">
                  <button className="rec-a-btn play on" onClick={() => m.video && window.open(m.video, "_blank")}>PLAY</button>
                  <button className="rec-a-btn prev on" onClick={() => m.preview[0] && window.open(m.preview[0], "_blank")}>PRE</button>
                </div>
              </div>
              <div className="rec-card-title centered">{m.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
