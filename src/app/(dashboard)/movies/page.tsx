"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import "./movies.css";

type ApiMovie = {
  id: number;
  title: string;
  genre: string;
  vj: string;
  description: string;
  cover_url: string;
  video_url: string;
  preview_urls: string[];
};

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

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies";

export default function MoviesPage(){
  const [movies, setMovies] = useState<Movie[]>([]);
  const [active, setActive] = useState(0);
  const [anchor, setAnchor] = useState<"full"|"preview">("full");
  const [clicking, setClicking] = useState(false);
  const pauseRef = useRef<number>(0);

  useEffect(()=>{
    async function load(){
      const res = await fetch(API_URL, { cache: "no-store" });
      const data: ApiMovie[] = await res.json();
      setMovies(data.slice(0,6).map(m=>({
        id: m.id,
        title: m.title.toLowerCase(),
        genre: m.genre,
        vj: m.vj,
        cover: m.cover_url,
        desc: m.description,
        video: m.video_url,
        preview: m.preview_urls,
      })));
    }
    load();
  },[]);

  // 30 sec big card
  useEffect(()=>{ if(!movies.length) return; const t=setInterval(()=> setActive(p=> (p+1)%movies.length),30000); return ()=>clearInterval(t)},[movies]);

  // 5 sec anchor toggle, but respect 20 sec pause after manual click
  useEffect(()=>{
    const t=setInterval(()=>{
      if(Date.now() < pauseRef.current) return;
      setAnchor(p=> p==="full"?"preview":"full")
    },5000);
    return ()=>clearInterval(t)
  },[]);

  const handleManualAnchor = (type: "full"|"preview") => {
    setAnchor(type);
    pauseRef.current = Date.now() + 20000; // delay auto toggle 20 sec
  };

  const m = movies[active];

  const handlePlay = useCallback(()=>{
    if(!m) return;
    setClicking(true);
    setTimeout(()=>setClicking(false),420);

    if(anchor==="full"){
      if(m.video) window.open(m.video, "_blank");
    }else{
      if(m.preview[0]) window.open(m.preview[0], "_blank");
    }
  },[m, anchor]);

  if(!movies.length) return <div className="film-root"><div className="film-giant" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>Loading latest...</div></div>;

  return (
    <div className="film-root">
      <div className="film-giant">
        <div className="film-bg"><div className="gblob b1"/><div className="gblob b2"/></div>

        <div className="strip-wrap upper full">
          <div className="strip-track ltr">
            {[...movies,...movies,...movies].map((x,i)=>(
              <button key={`u-${i}`} className="strip-card" onClick={()=> setActive(i%movies.length)}>
                <img src={x.cover} alt={x.title} loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div className="film-center">
          <div className="center-cover">
            <img src={m.cover} alt={m.title} />
            <div className="center-fade"/>
            <div className="center-top"><span className="c-pill">{m.genre}</span><span className="c-pill muted">{m.vj}</span></div>
            <div className="center-desc">
              <div className="c-title">{m.title}</div>
              <div className="c-meta">{m.genre} • {m.vj}</div>
              <div className="c-text">{m.desc}</div>
            </div>
            <button className={`play-3d glass ${anchor} ${clicking?"clicking":""}`} onClick={handlePlay} aria-label="play">
              <span key={anchor} className={`play-smoke ${anchor}`}></span>
              <span className="play-smoke-2"></span>
              <span className="play-core">
                <svg viewBox="0 0 24 24" className="play-tri" aria-hidden>
                  <path d="M8 5.8 L18 12 L8 18.2 Z" fill="white" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div className="strip-wrap lower full">
          <div className="strip-track rtl">
            {[...movies,...movies,...movies].reverse().map((x,i)=>(
              <button key={`l-${i}`} className="strip-card" onClick={()=> setActive(i%movies.length)}>
                <img src={x.cover} alt={x.title} loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div className="controls-row">
          <div className="dots-wrap">
            {movies.map((_,i)=><button key={i} className={`dot ${i===active?"active":""}`} onClick={()=> setActive(i)}/>)}
          </div>
          <div className="anchor-btns">
            <button className={`a-btn full ${anchor==="full"?"on":""}`} onClick={()=> handleManualAnchor("full")}>FULL MOVIE</button>
            <button className={`a-btn prev ${anchor==="preview"?"on":""}`} onClick={()=> handleManualAnchor("preview")}>PREVIEW</button>
          </div>
        </div>
      </div>
    </div>
  )
}
