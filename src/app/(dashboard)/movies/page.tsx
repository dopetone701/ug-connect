"use client"
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import "./movies.css";
import "./latest-movies.css";
import MovieRow from "./_components/movie-row";
import UserListsRow from "./_components/user-lists-row";
import { getSections } from "./_lib/sections.config";
import { useMovieStore } from "./_lib/use-movie-store";
import { Movie as LibMovie } from "./_lib/types";
import ExploreMore from "./_lib/explore-more";
import GenreFilter from "./_lib/genre-filter";
import { useGlobalSearch } from "@/stores/use-global-search";

type ApiMovie = {
  id: number;
  title: string;
  genre: string;
  vj: string;
  description: string;
  cover_url: string;
  video_url: string;
  preview_urls: string[];
  views?: number;
  likes?: number;
  is_editors_pick?: boolean;
  created_at?: string;
};

const API_URL = "https://movie-server-api.connectu89.workers.dev/api/movies";

export default function MoviesPage(){
  const [allMovies, setAllMovies] = useState<LibMovie[]>([]);
  const [active, setActive] = useState(0);
  const [anchor, setAnchor] = useState<"full"|"preview">("full");
  const [clicking, setClicking] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const pauseRef = useRef<number>(0);
  const { favIds, recentIds, lists, createList } = useMovieStore() as any;
  const store = useMovieStore() as any;
  const router = useRouter();

  useEffect(()=>{
    async function load(){
      const res = await fetch(API_URL, { cache: "no-store" });
      const data: ApiMovie[] = await res.json();
      const mapped: LibMovie[] = data.map(m=>({
        id: m.id,
        title: m.title.toLowerCase(),
        genre: m.genre,
        vj: m.vj,
        cover: m.cover_url,
        desc: m.description,
        video: m.video_url,
        preview: m.preview_urls,
        views: (m as any).views || Math.floor(Math.random()*5000),
        likes: (m as any).likes || Math.floor(Math.random()*1000),
        isEditorsPick: (m as any).is_editors_pick || false,
        createdAt: (m as any).created_at,
      }));
      setAllMovies(mapped);
      useGlobalSearch.getState().setAll(mapped)
    }
    load();
  },[]);

  const movies = useMemo(() => allMovies.slice(0,6), [allMovies]);
  useEffect(()=>{ if(!movies.length) return; const t=setInterval(()=> setActive(p=> (p+1)%movies.length),30000); return ()=>clearInterval(t)},[movies]);
  useEffect(()=>{
    const t=setInterval(()=>{
      if(Date.now() < pauseRef.current) return;
      setAnchor(p=> p==="full"?"preview":"full")
    },5000);
    return ()=>clearInterval(t)
  },[]);

  const handleManualAnchor = (type: "full"|"preview") => {
    setAnchor(type);
    pauseRef.current = Date.now() + 20000;
  };

  const m = movies[active];
  const isInMyList = useMemo(() => lists?.[0]?.movieIds?.includes(m?.id), [lists, m]);

  const handleAddToList = useCallback(()=>{
    if(!m) return;
    if(isInMyList){
      if(store.removeFromMyList) store.removeFromMyList(m.id);
      else if(store.toggleListMovie) store.toggleListMovie("my-list", m.id);
      return;
    }
    let myList = lists?.[0];
    if(!myList){
      createList("my-list");
      myList = lists?.[0] || { id: "my-list" };
    }
    if(store.addMovieToList) store.addMovieToList(myList.id, m.id);
    else if(store.addToList) store.addToList(myList.id, m.id);
    else if(store.toggleListMovie) store.toggleListMovie(myList.id, m.id);
    else if(store.addToMyList) store.addToMyList(m.id);
    setJustAdded(true);
    setTimeout(()=> setJustAdded(false), 1200);
  },[m, lists, createList, store, isInMyList]);

  const handleShare = useCallback(async ()=>{
    if(!m) return;
    const url = `${window.location.origin}/movies/watch/${m.id}?t=${anchor}`;
    if((navigator as any).share){
      try{ await (navigator as any).share({ title: m.title, url }); }catch{}
    }else{
      await navigator.clipboard.writeText(url);
    }
  },[m, anchor]);

  const handlePlay = useCallback(()=>{
    if(!m) return;
    setClicking(true);
    setTimeout(()=>setClicking(false),420);
    router.push(`/movies/watch/${m.id}?t=${anchor}`);
  },[m, anchor, router]);

  // DYNAMIC SEE ALL - NO HARDCODED NAMES
  const handleSeeAll = useCallback((value: string) => {
  let clean = value.toLowerCase().trim()
  if(!clean || clean === "all"){
    useGlobalSearch.getState().setQuery("")
    useGlobalSearch.getState().setSection(null)
    return
  }
  if(!clean.includes("movies") && clean.split(" ").length === 1){
    clean = `${clean} movies`
  }
  const store = useGlobalSearch.getState() as any
  store.setQuery(clean)
  store.setSection?.(clean)
  // toggle island bar - THIS WAS MISSING
  store.setOpen?.(true)
  store.setIsOpen?.(true)
  store.openDrawer?.()
  store.setShowDrawer?.(true)
}, [])


  const sections = useMemo(() => getSections(allMovies, { favIds, recentIds }), [allMovies, favIds, recentIds]);

  if(!allMovies.length) return <div className="film-root"><div className="film-giant" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>Loading latest...</div></div>;

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
            <div className="center-top">
              <span className="c-pill" style={{cursor:"pointer"}} onClick={()=>handleSeeAll(m.genre)}>{m.genre}</span>
              <span className="c-pill muted" style={{cursor:"pointer"}} onClick={()=>handleSeeAll(m.vj)}>{m.vj}</span>
            </div>
            <div className="center-desc">
              <div className="c-title" style={{cursor:"pointer"}} onClick={()=>handleSeeAll(m.title)}>{m.title}</div>
              <div className="c-meta">{m.genre} • {m.vj}</div>
              <div className="c-text">{m.desc}</div>
            </div>

            <div className="hero-corner-actions pc-only">
              <button className={`hca-btn ${isInMyList? "added": ""} ${justAdded? "pop": ""}`} onClick={handleAddToList}>
                {isInMyList? (
                  <><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>ADDED</>
                ) : (
                  <><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>MY LIST</>
                )}
              </button>
              <button className="hca-btn" onClick={handleShare}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
                SHARE
              </button>
            </div>

            <button className={`play-3d glass ${anchor} ${clicking?"clicking":""}`} onClick={handlePlay} aria-label="play">
              <span key={anchor} className={`play-smoke ${anchor}`}></span>
              <span className="play-smoke-2"></span>
              <span className="play-core"><svg viewBox="0 0 24 24" className="play-tri" aria-hidden><path d="M8 5.8 L18 12 L8 18.2 Z" fill="white" /></svg></span>
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
          <div className="dots-wrap pc-only">{movies.map((_,i)=><button key={i} className={`dot ${i===active?"active":""}`} onClick={()=> setActive(i)}/>)}</div>
          <div className="anchor-btns pc-only">
            <button className={`a-btn full ${anchor==="full"?"on":""}`} onClick={()=> handleManualAnchor("full")}>FULL MOVIE</button>
            <button className={`a-btn prev ${anchor==="preview"?"on":""}`} onClick={()=> handleManualAnchor("preview")}>PREVIEW</button>
          </div>

          <div className="mobile-same-line mobile-only">
            <button className={`m-icon-btn left ${isInMyList? "added": ""} ${justAdded? "pop": ""}`} onClick={handleAddToList} aria-label="my list">
              {isInMyList? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              )}
            </button>
            <div className="anchor-btns">
              <button className={`a-btn full ${anchor==="full"?"on":""}`} onClick={()=> handleManualAnchor("full")}>FULL MOVIE</button>
              <button className={`a-btn prev ${anchor==="preview"?"on":""}`} onClick={()=> handleManualAnchor("preview")}>PREVIEW</button>
            </div>
            <button className="m-icon-btn right" onClick={handleShare} aria-label="share">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
            </button>
          </div>
        </div>
      </div>

      <GenreFilter onSelect={handleSeeAll} />

      {sections.map(s => {
        if((s as any).hidden) return null;
        if(!s.data?.length) return null;
        return <MovieRow key={s.id} title={s.title} movies={s.data} onSeeAll={handleSeeAll} />
      })}

      <UserListsRow movies={allMovies} />
      <ExploreMore movies={allMovies} />
    </div>
  )
}
