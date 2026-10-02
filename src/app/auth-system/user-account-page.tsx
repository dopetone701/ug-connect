"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMovieStore } from "@/stores/use-movie-store";
import { useGlobalSearch } from "@/stores/use-global-search";
import { useWatchDrawer } from "@/stores/use-watch-drawer";
import { useReelsDrawer } from "@/stores/use-reels-drawer";

type User = { name?: string; email?: string; avatarUrl?: string; avatar_url?: string; avatar?: string; };

export default function UserAccountPage(){
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { lists, favIds, recentIds, createList, _hydrate, hydrated } = useMovieStore() as any;
  const { allMovies = [] } = useGlobalSearch() as any;

  useEffect(() => {
    const raw = localStorage.getItem("ug_user");
    if(raw) try{ setUser(JSON.parse(raw)) }catch{}
    if(!hydrated) _hydrate?.();
  }, []);

  const name = user?.name || "Tchide";
  const email = user?.email || user?.name || "last seen 24/09/26";
  const initial = (name?.[0] || "T").toUpperCase();
  const avatar = (user as any)?.avatarUrl || (user as any)?.avatar_url || (user as any)?.avatar;

  const mainList = lists?.[0];
  const myMovies = (allMovies || []).filter((m:any) => mainList?.movieIds?.includes(String(m.id)) || mainList?.movieIds?.includes(m.id));
  const favMovies = (allMovies || []).filter((m:any) => favIds?.includes(String(m.id)) || favIds?.includes(m.id));
  const recentMovies = (allMovies || []).filter((m:any) => recentIds?.includes(String(m.id)) || recentIds?.includes(m.id));

  return (
    <div style={{ background: "hsl(var(--bg))", color: "hsl(var(--text))", minHeight: "100%", paddingBottom: 90 }}>
      {/* Top Edit like ref */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px 0" }}>
        <button onClick={() => window.dispatchEvent(new CustomEvent("ug-open-edit-profile"))}
          style={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 999, padding: "8px 18px", fontSize: 14, fontWeight: 600 }}>
          Edit
        </button>
      </div>

      {/* Avatar center */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 10 }}>
        <div style={{ width: 110, height: 110, borderRadius: "50%", background: avatar? "transparent" : "linear-gradient(135deg,#a0f0b5,#3ecf62)", display: "grid", placeItems: "center", fontSize: 48, fontWeight: 800, color: "#fff", overflow: "hidden", border: "1px solid hsl(var(--border))" }}>
          {avatar? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
        </div>
        <h2 style={{ marginTop: 14, fontSize: 26, fontWeight: 800 }}>{name}</h2>
        <p style={{ marginTop: 2, fontSize: 14, color: "hsl(var(--text-muted))" }}>{typeof email === 'string' && email.includes('@')? email : "last seen 24/09/26"}</p>
      </div>

      {/* CUBES: + / bell / liked / downloads / more */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, padding: "22px 14px 0" }}>
        <Cube icon={<PlusIcon/>} label="add" onClick={() => window.dispatchEvent(new CustomEvent("ug-open-lists-sheet"))} />
        <Cube icon={<BellIcon/>} label="mute" />
        <Cube icon={<HeartIcon/>} label="liked" onClick={() => document.getElementById("fav-row")?.scrollIntoView({ behavior: "smooth" })} />
        <Cube icon={<DownloadIcon/>} label="saved" />
        <Cube icon={<MoreIcon/>} label="more" />
      </div>

      {/* mobile card like ref */}
      <div style={{ margin: "20px 14px 0", background: "hsl(var(--surface))", border: "1px solid hsl(var(--border))", borderRadius: 22, padding: "14px 16px" }}>
        <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>mobile</div>
        <div style={{ marginTop: 2, fontSize: 16, color: "hsl(var(--primary))" }}>{user?.email || "+971 52 767 5021"}</div>
      </div>

      {/* PRIVATE LISTS - ONLY HERE, NOT HOME */}
      <div style={{ marginTop: 22 }}>
        {/* My List */}
        <MovieRowPrivate
          title="my list"
          movies={myMovies}
          count={mainList?.movieIds?.length || 0}
          leading={<EmptyListCard onClick={() => window.dispatchEvent(new CustomEvent("ug-open-lists-sheet"))} />}
        />
        {/* Liked */}
        {favMovies.length > 0 && <MovieRowPrivate title="liked" movies={favMovies} count={favMovies.length} id="fav-row" />}
        {/* Recent */}
        {recentMovies.length > 0 && <MovieRowPrivate title="recent" movies={recentMovies} count={recentMovies.length} />}

        {/* Empty state if no movies at all */}
        {myMovies.length === 0 && favMovies.length === 0 && recentMovies.length === 0 && (
          <div style={{ padding: "10px 14px" }}>
            <div style={{ background: "hsl(var(--surface))", border: "1px dashed hsl(var(--border))", borderRadius: 16, padding: 20, textAlign: "center", color: "hsl(var(--text-muted))" }}>
              Your private lists will appear here. Tap + to create.
            </div>
          </div>
        )}
      </div>

      <style>{`
       .account-cube{ background:hsl(var(--surface)); border:1px solid hsl(var(--border)); border-radius:18px; height:72px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px }
       .account-cube svg{ color:hsl(var(--primary)); }
       .account-cube span{ font-size:12px; color:hsl(var(--primary)); font-weight:500 }
       .latest-root{ padding:14px 0 0 }
       .latest-head{ display:flex; justify-content:space-between; align-items:center; padding:0 14px 10px }
       .latest-title{ font-size:18px; font-weight:800; text-transform:lowercase; cursor:pointer }
       .latest-see{ font-size:12px; opacity:.6; background:none; border:none; color:hsl(var(--text)) }
       .latest-track-wrap{ overflow:hidden }
       .latest-track{ display:flex; gap:10px; overflow-x:auto; padding:0 14px 8px; scrollbar-width:none }
       .latest-track::-webkit-scrollbar{ display:none }
       .latest-card{ min-width:118px; width:118px; flex-shrink:0 }
       .l-card-cover{ width:100%; height:168px; border-radius:12px; overflow:hidden; position:relative; background:hsl(var(--surface)) }
       .l-card-cover img{ width:100%; height:100%; object-fit:cover }
       .l-card-fade{ position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,.7), transparent 50%) }
       .l-card-actions{ position:absolute; bottom:0; left:0; right:0; display:flex }
       .l-a-btn{ flex:1; border:none; padding:7px 0; font-size:11px; font-weight:800; background:rgba(0,0,0,.7); color:#fff }
       .l-card-title.centered{ text-align:center; font-size:12px; font-weight:700; margin-top:6px; opacity:.8 }
      `}</style>
    </div>
  );
}

// ---- PRIVATE ROW THAT USES YOUR CARD LOGIC ----
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
    <div className="latest-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="l-card-cover" style={{ borderStyle:"dashed", borderWidth:1, borderColor:"hsl(var(--border))", display:"grid", placeItems:"center", background:"hsl(var(--surface) / 0.5)", borderRadius:12[STRIPPED 24 bytes]"28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ opacity:.7 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </div>
      <div className="l-card-title centered">create list</div>
    </div>
  );
}

// icons
function Cube({ icon, label, onClick }: any){ return <button className="account-cube" onClick={onClick}>{icon}<span>{label}</span></button> }
function PlusIcon(){ return[STRIPPED 12 bytes]"22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14"/></svg> }
function BellIcon(){ return[STRIPPED 12 bytes]"22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7v4.5l-1.5 1.5V16h17v-1L19 13.5V9a7 7 0 0 0-7-7Z"/></svg> }
function HeartIcon(){ return[STRIPPED 12 bytes]"22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-6.5-4.35-8.5-8.5A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6.5C18.5 16.65 12 21 12 21Z"/></svg> }
function DownloadIcon(){ return[STRIPPED 12 bytes]"22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v13"/><path d="M5 16l7 5 7-5"/><path d="M3 21h18"/></svg> }
function MoreIcon(){ return[STRIPPED 12 bytes]"22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg> }