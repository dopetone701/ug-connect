"use client";
import { useEffect, useRef, useState } from "react";
import { attachNoonScroll } from "./noon-scroll";
import "./genre-filter.css";


const GENRES = [
  { id: "all", label: "All", img: "/genre-filter-images/rango-all.PNG", fallback: "A" },
  { id: "action", label: "Action", img: "/genre-filter-images/action.JPG" },
  { id: "adventure", label: "Adventure", img: "/genre-filter-images/adventure.JPG" },
  { id: "animations", label: "Animation", img: "/genre-filter-images/animations.jpg" },
  { id: "crime", label: "Crime", img: "/genre-filter-images/crime.PNG" },
  { id: "horror", label: "Horror", img: "/genre-filter-images/horror.PNG" },
  { id: "romantic", label: "Romance", img: "/genre-filter-images/romantic.PNG" },
  { id: "scifi", label: "Sci-Fi", img: "/genre-filter-images/scify.PNG" },
  { id: "thriller", label: "Thriller", img: "/genre-filter-images/thriller.jpg" },
];

type Props = {
  onSelect?: (genre: string) => void;
};

export default function GenreFilter({ onSelect }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("all");

  useEffect(() => {
    if (!trackRef.current) return;
    const cleanup = attachNoonScroll(trackRef.current);
    return cleanup;
  }, []);

  const handleClick = (id: string) => {
    setActive(id);
    onSelect?.(id);
  };

  return (
    <div className="genre-root">
      <div className="genre-track" ref={trackRef}>
        {GENRES.map((g) => (
          <button
            key={g.id}
            className={`genre-card ${active === g.id? "on" : ""}`}
            onClick={() => handleClick(g.id)}
          >
            <div className="genre-circle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.img}
                alt={g.label}
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="genre-fallback">{g.fallback || g.label[0]}</span>
            </div>
            <span className="genre-label">{g.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
