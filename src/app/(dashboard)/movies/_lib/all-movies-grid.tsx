"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMovieStore } from "../_lib/use-movie-store";

export function AllMoviesGrid({ movies, filters }: any) {
  const router = useRouter();
  const { addRecent } = useMovieStore() as any;
  const [zoomedId, setZoomedId] = useState<number | null>(null);

  const filtered = useMemo(()=>{
    return movies.filter((m:any)=>{
      if(filters.vj && m.vj!==filters.vj) return false;
      if(filters.genre && filters.genre!=="all" && filters.genre!==""){
        const g = filters.genre.toLowerCase();
        if(["ugandan","nigerian","western","korean","filipino","indian"].includes(g)){
          if(!( (m.title+" "+(m.genre||"")+" "+(m.vj||"")).toLowerCase().includes(g.slice(0,4)) )) return false;
        } else {
          if(!(m.genre||"").toLowerCase().includes(g)) return false;
        }
      }
      if(filters.section){
        // section filter handled outside, but keep safe
      }
      if(filters.search && !`${m.title} ${m.genre||""} ${m.vj||""}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if(filters.quick && filters.quick!=="All"){
        if(filters.quick==="Ugandan" && !`${m.title} ${m.genre||""}`.toLowerCase().includes("ugan")) return false;
        if(filters.quick==="New"){
          // keep all, sorted elsewhere
        }
      }
      return true;
    })
  },[movies, filters]);

  return (
    <div className="all-grid">
      <div className="all-grid-meta">{filtered.length} titles • {filters.genre || filters.vj || filters.section || "All"}</div>
      
      {filtered.length===0 ? (
        <div className="empty-grid"><p>No movies for this filter</p><span>Try clearing filters</span></div>
      ) : (
        <>
          {zoomedId && <div className="zoom-backdrop" onClick={()=> setZoomedId(null)} />}
          <div className={`all-grid-inner ${zoomedId ? 'has-zoomed' : ''}`}>
            {filtered.map((m:any)=>(
              <div
                key={m.id}
                className={`all-card ${zoomedId===m.id ? 'is-zoomed' : ''}`}
                onClick={()=>{
                  if(zoomedId===m.id) setZoomedId(null)
                  else setZoomedId(m.id)
                }}
              >
                <div className="all-card-inner">
                  <img src={m.cover_url || m.cover} alt={m.title} loading="lazy" draggable={false} />
                  <div className="all-fade" />
                  <div className="all-vj">{m.vj}</div>
                  <div className="all-actions">
                    <button
                      className="all-a-btn play"
                      onClick={(e)=>{
                        e.stopPropagation();
                        addRecent(m.id)
                        router.push(`/movies/watch/${m.id}?t=full`)
                        setZoomedId(null)
                      }}
                    >PLAY</button>
                    <button
                      className="all-a-btn prev"
                      onClick={(e)=>{
                        e.stopPropagation();
                        addRecent(m.id)
                        router.push(`/movies/watch/${m.id}?t=preview`)
                        setZoomedId(null)
                      }}
                    >PRE</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
