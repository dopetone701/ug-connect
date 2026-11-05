"use client";
import { useRouter } from "next/navigation";
import "./latest-movies.css";
import { useGlobalSearch } from "@/stores/use-global-search";

type Movie = {
  id:number;
  title:string;
  genre:string;
  vj:string;
  cover:string;
  cover_url?:string;
  desc:string;
  video:string;
  video_url?:string;
  preview:string[];
  preview_urls?:string[];
};

function isMobileDevice() {
  if (typeof window === "undefined") return true;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return true;
  if (typeof navigator !== "undefined" && (navigator as any).maxTouchPoints > 0 && window.innerWidth <= 1024) return true;
  return false;
}

export default function LatestMovies({ movies = [] }: { movies?: Movie[] }) {
  const router = useRouter();

  if (!movies.length) return null;

  const handleSeeAll = () => {
    const clean = "latest movies";
    const mobile = isMobileDevice();

    const gs = useGlobalSearch.getState() as any;
    gs.setQuery(clean);
    gs.setSection?.(clean);
    gs.openSearch?.();
    gs.setOpen?.(true);
    gs.setIsOpen?.(true);

    // GOAT TRICK: mobile = drawer only, no PC sneak
    if (mobile) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ug-open-search-panel"));
      }
      return;
    }

    // desktop only
    const param = encodeURIComponent(clean);
    router.push(`/search?q=${param}&filter=${param}&section=${param}`);
  };

  const openMovie = (m: Movie, t: "full" | "preview") => {
    router.push(`/movies/watch/${m.id}?t=${t}`);
  };

  return (
    <div className="latest-root">
      <div className="latest-head">
        <h3 className="latest-title" onClick={handleSeeAll} style={{cursor:"pointer"}}>latest movies</h3>
        <button className="latest-see" onClick={handleSeeAll}>SEE ALL</button>
      </div>

      <div className="latest-track">
        {movies.map((m) => (
          <div key={m.id} className="latest-card">
            <div className="l-card-cover">
              <img src={(m as any).cover_url || m.cover} alt={m.title} loading="lazy" draggable={false} />
              <div className="l-card-fade" />
              <div className="l-card-vj-on">{m.vj}</div>
              <div className="l-card-actions">
                <button className="l-a-btn play on" onClick={(e)=>{ e.stopPropagation(); openMovie(m, "full"); }}>PLAY</button>
                <button className="l-a-btn prev on" onClick={(e)=>{ e.stopPropagation(); openMovie(m, "preview"); }}>PRE</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
