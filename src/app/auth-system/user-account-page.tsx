"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMovieStore } from "@/stores/use-movie-store";
import { useGlobalSearch } from "@/stores/use-global-search";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { useReelsDrawer } from "@/stores/use-reels-drawer";
import "./user-account-page.css";

type User = { name?: string; email?: string; avatarUrl?: string; avatar_url?: string; avatar?: string; };

export default function UserAccountPage(){
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { lists, favIds, recentIds, _hydrate, hydrated } = useMovieStore() as any;
  const { allMovies = [] } = useGlobalSearch() as any;

  useEffect(() => {
    const raw = localStorage.getItem("ug_user");
    if(raw) try{ setUser(JSON.parse(raw)) }catch{}
    if(!hydrated) _hydrate?.();
  }, []);

  const name = user?.name || "Tcide";
  const email = user?.email || "last seen 24/09/26";
  const initial = (name?.[0] || "T").toUpperCase();
  const avatar = (user as any)?.avatarUrl || (user as any)?.avatar_url || (user as any)?.avatar;

  const mainList = lists?.[0];
  const myMovies = (allMovies || []).filter((m:any) => mainList?.movieIds?.includes(String(m.id)) || mainList?.movieIds?.includes(m.id));
  const favMovies = (allMovies || []).filter((m:any) => favIds?.includes(String(m.id)) || favIds?.includes(m.id));
  const recentMovies = (allMovies || []).filter((m:any) => recentIds?.includes(String(m.id)) || recentIds?.includes(m.id));

  return (
    <div className="account-sheet-root">
      <div className="account-top-edit-wrap">
        <button className="account-edit-btn" onClick={() => window.dispatchEvent(new CustomEvent("ug-open-edit-profile"))}>
          Edit
        </button>
      </div>

      <div className="account-avatar-wrap">
        <div className="account-avatar">
          {avatar? <img src={avatar} alt={name} /> : initial}
        </div>
        <h2 className="account-name">{name}</h2>
        <p className="account-sub">{typeof email === 'string' && email.includes('@')? email : "last seen 24/09/26"}</p>
      </div>

      <div className="account-cubes">
        <Cube icon={<PlusIcon/>} label="add" onClick={() => window.dispatchEvent(new CustomEvent("ug-open-lists-sheet"))} />
        <Cube icon={<BellIcon/>} label="mute" />
        <Cube icon={<HeartIcon/>} label="liked" onClick={() => document.getElementById("fav-row")?.scrollIntoView({ behavior: "smooth" })} />
        <Cube icon={<DownloadIcon/>} label="saved" />
        <Cube icon={<MoreIcon/>} label="more" />
      </div>

      <div className="account-mobile-card">
        <div className="account-mobile-label">mobile</div>
        <div className="account-mobile-value">{user?.email || "+971 52 767 5021"}</div>
      </div>

      <div className="account-lists-wrap">
        <MovieRowPrivate
          title="my list"
          count={mainList?.movieIds?.length || 0}
          movies={myMovies}
          leading={<EmptyListCard onClick={() => window.dispatchEvent(new CustomEvent("ug-open-lists-sheet"))} />}
        />
        {favMovies.length > 0 && <MovieRowPrivate id="fav-row" title="liked" count={favMovies.length} movies={favMovies} />}
        {recentMovies.length > 0 && <MovieRowPrivate title="recent" count={recentMovies.length} movies={recentMovies} />}

        {myMovies.length === 0 && favMovies.length === 0 && recentMovies.length === 0 && (
          <div className="account-empty-hint">Your private lists will appear here. Tap + to create.</div>
        )}
      </div>
    </div>
  );
}

function MovieRowPrivate({ title, movies, count, leading, id }: any){
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="latest-root" id={id}>
      <div className="latest-head">
        <h3 className="latest-title">{title}</h3>
        <span className="latest-see">{count} movies</span>
      </div>
      <div className="latest-track-wrap">
        <div ref={ref} className="latest-track">
          {leading}
          {movies.map((m:any) => <MovieCardPrivate key={String(m.id)} m={m} allMovies={movies} />)}
        </div>
      </div>
    </div>
  );
}

function MovieCardPrivate({ m, allMovies }: any){
  const { addRecent } = useMovieStore() as any;
  const { openDrawer } = useWatchDrawer() as any;
  const { openReels } = useReelsDrawer() as any;
  const router = useRouter();
  const openMovie = (type: "full" | "preview" = "full") => {
    const id = String(m.id);
    addRecent(id);
    try{ sessionStorage.setItem("movies_home_scroll_v1", String(window.scrollY)); }catch{}
    if(window.innerWidth > 768){ router.push(`/movies/watch/${id}?t=${type}`); return; }
    if(type === "preview"){ openReels(allMovies?.map((x:any)=>({...x, id:String(x.id), preview_url:x.preview_urls?.[0] || x.preview_url })), 0); return; }
    openDrawer(id);
  };
  return (
    <div className="latest-card" onClick={() => openMovie("full")}>
      <div className="l-card-cover">
        <img src={m.cover || m.cover_url} alt={m.title} loading="lazy" draggable={false} />
        <div className="l-card-fade" />
        <div className="l-card-actions">
          <button className="l-a-btn play on" onClick={(e)=>{e.stopPropagation(); openMovie("full")}}>PLAY</button>
          <button className="l-a-btn prev on" onClick={(e)=>{e.stopPropagation(); openMovie("preview")}}>PRE</button>
        </div>
      </div>
    </div>
  );
}

function EmptyListCard({ onClick }: { onClick?: () => void }){
  return (
    <div className="latest-card" onClick={onClick}>
      <div className="l-card-cover dashed">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ opacity:.7 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </div>
      <div className="l-card-title centered">create list</div>
    </div>
  );
}

function Cube({ icon, label, onClick }: any){ return <button className="account-cube" onClick={onClick}>{icon}<span>{label}</span></button> }
function PlusIcon(){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg> }
function BellIcon(){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7v4.5l-1.5 1.5V16h17v-1L19 13.5V9a7 7 0 0 0-7-7Z"/></svg> }
function HeartIcon(){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-6.5-4.35-8.5-8.5A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6.5C18.5 16.65 12 21 12 21Z"/></svg> }
function DownloadIcon(){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v13"/><path d="M5 16l7 5 7-5"/><path d="M3 21h18"/></svg> }
function MoreIcon(){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg> }