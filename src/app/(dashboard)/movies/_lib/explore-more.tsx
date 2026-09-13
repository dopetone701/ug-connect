"use client";
import "./explore-more.css";
import { Movie } from "./types";
import { useGlobalSearch } from "@/stores/use-global-search";

type Props = { movies: Movie[] };

const CATS = [
  { id: "popular", label: "MOST POPULAR" },
  { id: "western", label: "WESTERN" },
  { id: "ugandan", label: "UGANDAN" },
  { id: "nigerian", label: "NIGERIAN" },
  { id: "korean", label: "KOREAN" },
  { id: "filipino", label: "FILIPINO" },
  { id: "indian", label: "INDIAN" },
];

export default function ExploreMore({ movies }: Props) {
  const handleCat = (cat: typeof CATS[0]) => {
    let q = ""
    if(cat.id === "popular"){
      q = "most watched"
    } else {
      q = cat.label.toLowerCase() // "western" -> western, not western movies? will auto add movies in parent if single word
      if(q.split(" ").length === 1) q = `${q} movies`
    }
    useGlobalSearch.getState().setQuery(q)
    useGlobalSearch.getState().setSection(q)
  }

  return (
    <div className="em-root">
      <div className="em-head">
        <h2 className="em-main-title">Explore More</h2>
      </div>

      <div className="em-track">
        {CATS.map(cat => {
          const sample = movies.find(m =>
            cat.id==="popular"? true :
            (m.title+" "+m.genre+" "+m.vj).toLowerCase().includes(cat.label.toLowerCase().slice(0,4))
          );
          const hasData = cat.id==="popular"? movies.length>0 :!!sample;

          return (
            <div
              key={cat.id}
              className={`em-card ${!hasData? "coming" : ""}`}
              onClick={()=>{
                if(!hasData) return;
                handleCat(cat)
              }}
            >
              {sample? (
                <img src={sample.cover} alt={cat.label} loading="lazy" draggable={false} />
              ) : (
                <div className="em-placeholder" />
              )}
              <div className="em-overlay" />
              <div className="em-label">{cat.label}</div>
              {!hasData && <div className="em-coming">COMING SOON</div>}
              {hasData && <div className="em-count">{cat.id==="popular"? `${movies.length} titles` : "Explore →"}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
