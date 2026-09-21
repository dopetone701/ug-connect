"use client";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { useEffect, useState } from "react";

const API = "https://movie-server-api.connectu89.workers.dev/api/movies";

export default function MiniBubble() {
  const { minimized, movieId, maximize, closeDrawer } = useWatchDrawer();
  const [movie, setMovie] = useState<any>(null);

  useEffect(() => {
    if (!movieId) return;
    fetch(API).then(r=>r.json()).then(d=>{
      setMovie(d.find((m:any)=>String(m.id)===String(movieId)));
    });
  }, [movieId]);

  if (!minimized ||!movieId ||!movie) return null;

  return (
    <div className="mini-bubble-root">
      <div className="mini-bubble-card" onClick={maximize}>
        <img src={movie.cover_url || movie.cover} alt="" draggable={false} />
        <div className="mini-bubble-fade" />
        <div className="mini-bubble-title">{movie.title}</div>
        <div className="mini-bubble-play">▶</div>
      </div>
      <button className="mini-bubble-close" onClick={(e)=>{e.stopPropagation(); closeDrawer()}}>✕</button>
      <button className="mini-bubble-expand" onClick={maximize}>⤢</button>
    </div>
  );
}
