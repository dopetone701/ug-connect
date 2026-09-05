"use client";
import "./latest-movies.css";

type Movie = { id:number; title:string; genre:string; vj:string; cover:string; desc:string; video:string; preview:string[] };

export default function LatestMovies({ movies = [] }: { movies?: Movie[] }) {
  if (!movies.length) return null;

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title">latest movies</h3>
        <button className="latest-see" onClick={()=>{ location.hash="#/movies" }}>SEE ALL</button>
      </div>

      <div className="latest-track">
        {movies.map((m) => (
          <div key={m.id} className="latest-card">
            <div className="l-card-cover">
              <img src={m.cover} alt={m.title} loading="lazy" draggable={false} />
              <div className="l-card-fade" />
              <div className="l-card-vj-on">{m.vj}</div>
              <div className="l-card-actions">
                <button className="l-a-btn play on" onClick={(e)=>{
                  e.stopPropagation();
                  if(m.video) window.open(m.video, "_blank")
                }}>PLAY</button>
                <button className="l-a-btn prev on" onClick={(e)=>{
                  e.stopPropagation();
                  if(m.preview?.[0]) window.open(m.preview[0], "_blank")
                }}>PRE</button>
              </div>
            </div>
            <div className="l-card-title centered">{m.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
