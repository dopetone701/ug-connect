"use client";
import { useEffect, useRef, useState } from "react";
import { attachNoonScroll } from "./noon-scroll";
import "./genre-filter.css";

// SINGLE SOURCE OF TRUTH - export this
export const GENRES = [
  { id: "all", label: "All", img: "/genre-filter-images/rango-all.PNG", fallback: "A" },
  { id: "action", label: "Action", img: "/genre-filter-images/action.JPG" },
  { id: "adventure", label: "Adventure", img: "/genre-filter-images/adventure.JPG" },
  { id: "animations", label: "Animation", img: "/genre-filter-images/animations.jpg" },
  { id: "cartoon", label: "Cartoon", img: "/genre-filter-images/cartoon.WEBP" },
  { id: "comedy", label: "Comedy", img: "/genre-filter-images/comedy.webp" },
  { id: "crime", label: "Crime", img: "/genre-filter-images/crime.PNG" },
  { id: "drama", label: "Drama", img: "/genre-filter-images/drama.webp" },
  { id: "family", label: "Family", img: "/genre-filter-images/family.webp" },
  { id: "fantasy", label: "Fantasy", img: "/genre-filter-images/fantasy.webp" },
  { id: "high-school", label: "High School", img: "/genre-filter-images/high-school.JPG" },
  { id: "history", label: "History", img: "/genre-filter-images/history.webp" },
  { id: "horror", label: "Horror", img: "/genre-filter-images/horror.PNG" },
  { id: "love-story", label: "Love Story", img: "/genre-filter-images/love-story.webp" },
  { id: "mystery", label: "Mystery", img: "/genre-filter-images/mystery.webp" },
  { id: "detective", label: "Detective", img: "/genre-filter-images/detective.JPG" },
  { id: "race", label: "Race", img: "/genre-filter-images/race.AVIF" },
  { id: "romantic", label: "Romance", img: "/genre-filter-images/romantic.PNG" },
  { id: "scifi", label: "Sci-Fi", img: "/genre-filter-images/scify.PNG" },
  { id: "thriller", label: "Thriller", img: "/genre-filter-images/thriller.jpg" },
  { id: "true-story", label: "True Story", img: "/genre-filter-images/true-story.AVIF" },
  { id: "war", label: "War", img: "/genre-filter-images/war.WEBP" },
];

// export image map for others to import
export const GENRE_IMAGE_MAP: Record<string, string> = GENRES.reduce((acc: any, g) => {
  acc[g.id] = g.img;
  acc[g.label.toLowerCase()] = g.img;
  return acc;
}, {} as Record<string, string>);

// extra aliases for legacy
GENRE_IMAGE_MAP["rango-all"] = "/genre-filter-images/rango-all.PNG";
GENRE_IMAGE_MAP["scify"] = "/genre-filter-images/scify.PNG";
GENRE_IMAGE_MAP["sci-fi"] = "/genre-filter-images/scify.PNG";
GENRE_IMAGE_MAP["animation"] = "/genre-filter-images/animations.jpg";
GENRE_IMAGE_MAP["romance"] = "/genre-filter-images/romantic.PNG";

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
            className={`genre-card ${active === g.id ? "on" : ""}`}
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
              <span className="genre-fallback">{(g as any).fallback || g.label[0]}</span>
            </div>
            <span className="genre-label">{g.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

