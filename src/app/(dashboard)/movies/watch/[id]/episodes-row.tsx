"use client";
import "./episodes-row.css";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import DotsMenu from "./dots-menu";

type Props = { movie:any; activeEpId?:string|null; onSelect?:(ep:any)=>void };

export default function EpisodesRow({ movie, activeEpId, onSelect }: Props){
  const router = useRouter();
  const pathname = usePathname();
  const trackRef = useRef<HTMLDivElement>(null);
  const [pagesToRender, setPagesToRender] = useState(2);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(()=>{
    const check = ()=> setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return ()=> window.removeEventListener("resize", check);
  },[]);

  const allEps = useMemo(()=>{
    const seasons = movie?.seasons || [];
    return seasons.flatMap((s:any, sIdx:number)=>{
      const eps = s.episodes || [];
      return eps.map((ep:any)=> ({...ep, _seasonName: s.name || `Season ${sIdx+1}`}));
    });
  },[movie]);

  const PAGE = isMobile ? 5 : 10;

  const chunks = useMemo(()=>{
    const out:any[][] = [];
    for(let i=0;i<allEps.length;i+=PAGE) out.push(allEps.slice(i,i+PAGE));
    return out;
  },[allEps, PAGE]);

  const scrollToPage = useCallback((idx:number)=>{
    const el = trackRef.current;
    if(!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  },[]);

  const onScroll = useCallback(()=>{
    const el = trackRef.current;
    if(!el) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentPage(page);
    const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 250;
    if(nearEnd && pagesToRender < chunks.length){
      setPagesToRender((p)=> Math.min(p+1, chunks.length));
    }
  },[pagesToRender, chunks.length]);

  const handleMenuAction = useCallback((type:string, data:any)=>{
    if(type==="download") console.log("Download", data?.id);
    if(type==="list") console.log("Add to list", data?.id);
    if(type==="share"){
      if(typeof navigator !== "undefined" && "share" in navigator){
        (navigator as any).share({ title: data?.title || "Episode", url: window.location.href }).catch(()=>{});
      }
    }
    if(type==="report") console.log("Report", data?.id);
  },[]);

  if(chunks.length === 0) return null;

  const handleKey = (e:React.KeyboardEvent, fn:()=>void)=>{
    if(e.key==="Enter" || e.key===" "){ e.preventDefault(); fn(); }
  };

  return (
    <div className="ep-deck-root">
      <div className="ep-deck-head">
        <div className="ep-head-title">{allEps[0]?._seasonName || "Episodes"}</div>
        <div className="ep-head-count">{allEps.length} Episodes</div>
      </div>

      <div className="ep-deck-wrap">
        <div className="ep-arrow left" role="button" tabIndex={0} aria-label="prev page" onClick={()=> scrollToPage(Math.max(0, currentPage-1))} onKeyDown={(e)=> handleKey(e, ()=> scrollToPage(Math.max(0, currentPage-1)))}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M15 18l-6-6 6-6"/></svg>
        </div>

        <div ref={trackRef} className="ep-deck-track" onScroll={onScroll}>
          {chunks.slice(0, pagesToRender).map((page, pageIdx)=>{
            return (
              <div key={pageIdx} className="ep-deck-page">
                {page.map((row:any, i:number)=>{
                  const isActive = String(activeEpId) === String(row.id) || String(activeEpId) === String(row.episode_number);
                  const num = row.episode_number || pageIdx*PAGE + i + 1;
                  const go = ()=> {
                    if(onSelect) onSelect(row);
                    else router.push(`${pathname}?t=full&ep=${row.id}`);
                  };
                  return (
                    <div key={`${pageIdx}-${row.id || i}`} className={`ep-row-card ${isActive ? "active" : ""}`} role="button" tabIndex={0} onClick={go} onKeyDown={(e)=> handleKey(e, go)}>
                      <div className="ep-row-thumb">
                        <img src={row.preview_url || row.cover_url || movie.cover_url || movie.cover} alt={row.title || `Ep ${num}`} loading="lazy" draggable={false} />
                        <div className="ep-row-badge">{String(num)}</div>
                      </div>
                      <div className="ep-row-info">
                        <div className="ep-row-title">{row.title || `Episode ${num}`}</div>
                        <div className="ep-row-sub">{isActive ? "▶ Now Playing" : row._seasonName}</div>
                      </div>

                      <div className="ep-more-wrap" onClick={(e)=> e.stopPropagation()}>
                        <DotsMenu itemData={row} onAction={handleMenuAction} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="ep-arrow right" role="button" tabIndex={0} aria-label="next page" onClick={()=> scrollToPage(Math.min(chunks.length-1, currentPage+1))} onKeyDown={(e)=> handleKey(e, ()=> scrollToPage(Math.min(chunks.length-1, currentPage+1)))}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M9 18l6-6-6-6"/></svg>
        </div>
      </div>

      <div className="ep-deck-dots">
        {chunks.slice(0, pagesToRender).map((_, i)=>{
          return <div key={i} className={`ep-dot ${i===currentPage ? "active" : ""}`} />;
        })}
      </div>
    </div>
  );
}
