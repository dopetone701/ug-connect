"use client";

import { useRef, useCallback, useMemo } from "react";
import "./explore-more.css";
import { Movie } from "./types";
import { useGlobalSearch } from "@/stores/use-global-search";
import { CATEGORY_OPTIONS } from "@/app/(dashboard)/control-center-page/components/edit-movie/constants";

type Props = { movies: Movie[] };

// Normalize: west-african = west_african = west african = westafrican
function norm(s: string) {
  return String(s || "").toLowerCase().trim().replace(/[-\s]+/g, "_").replace(/_+/g, "_");
}

function getMovieCategory(m: any): string {
  return norm(m.category || m.origin || m.country || "");
}

function isMovieInCategory(movie: any, catId: string) {
  if (catId === "popular") return true;
  const mCat = getMovieCategory(movie);
  if (!mCat) return false;
  const cId = norm(catId);
  // exact match: western = western, west_african = west-african
  if (mCat === cId) return true;
  // legacy support: west_african includes nigerian etc via CATEGORY_OPTIONS matchKeys not needed here
  return false;
}

export default function ExploreMore({ movies }: Props) {
  const handleCat = useCallback((cat: typeof CATEGORY_OPTIONS[number]) => {
    useGlobalSearch.getState().setQuery(cat.searchQuery);
    useGlobalSearch.getState().setSection(cat.searchQuery);
  }, []);

  const availableCats = useMemo(() => {
    if (!movies || movies.length === 0) return [];
    // Only categories that actually have movies in D1 - single source of truth
    return CATEGORY_OPTIONS.filter(cat => {
      if (cat.id === "popular") return movies.length > 0;
      // skip legacy duplicates (ugandan, nigerian, etc) - they are mapped to new ids
      if (["ugandan","nigerian","indian","korean","filipino"].includes(cat.id as any)) return false;
      return movies.some(m => isMovieInCategory(m, cat.id));
    });
  }, [movies]);

  if (!movies || movies.length === 0) return null;
  if (availableCats.length === 0) return null;

  return (
    <div className="em-root">
      <div className="em-head">
        <h2 className="em-main-title">Explore More</h2>
      </div>
      <div className="em-track">
        {availableCats.map((cat) => {
          const sample = movies.find((m) => isMovieInCategory(m, cat.id));
          return (
            <ExploreCard
              key={cat.id}
              cat={cat}
              sample={sample}
              total={movies.length}
              onOpen={() => handleCat(cat)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ExploreCard({
  cat,
  sample,
  total,
  onOpen,
}: {
  cat: typeof CATEGORY_OPTIONS[number];
  sample?: any;
  total: number;
  onOpen: () => void;
}) {
  const movedRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    movedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (movedRef.current) return;
    const dx = Math.abs(e.clientX - startRef.current.x);
    const dy = Math.abs(e.clientY - startRef.current.y);
    if (dx > 8 || dy > 8) movedRef.current = true;
  };
  const handlePointerUp = () => setTimeout(() => (movedRef.current = false), 150);
  const handleClick = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onOpen();
  };


  return (
    <div className="em-card" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onClick={handleClick}>
      {sample ? <img src={sample.cover || sample.cover_url} alt={cat.label} loading="lazy" draggable={false} /> : <div className="em-placeholder" />}
      <div className="em-overlay" />
      <div className="em-label">{cat.label}</div>
      <div className="em-count">{cat.id === "popular" ? `${total} titles` : "Explore →"}</div>
    </div>
  );
}

