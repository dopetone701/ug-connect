"use client";

import { useRef } from "react";
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
  const handleCat = (cat: (typeof CATS)[number]) => {
    let q = "";

    if (cat.id === "popular") {
      q = "most watched";
    } else {
      q = cat.label.toLowerCase();

      if (q.split(" ").length === 1) {
        q = `${q} movies`;
      }
    }

    useGlobalSearch.getState().setQuery(q);
    useGlobalSearch.getState().setSection(q);
  };

  return (
    <div className="em-root">
      <div className="em-head">
        <h2 className="em-main-title">Explore More</h2>
      </div>

      <div className="em-track">
        {CATS.map((cat) => {
          const sample = movies.find((m) =>
            cat.id === "popular"
              ? true
              : (m.title + " " + m.genre + " " + m.vj)
                  .toLowerCase()
                  .includes(cat.label.toLowerCase().slice(0, 4))
          );

          const hasData =
            cat.id === "popular" ? movies.length > 0 : !!sample;

          return (
            <ExploreCard
              key={cat.id}
              cat={cat}
              sample={sample}
              hasData={hasData}
              onOpen={() => {
                if (!hasData) return;
                handleCat(cat);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}


/* =========================================================
   SCROLL-SAFE EXPLORE CARD
   ========================================================= */

function ExploreCard({
  cat,
  sample,
  hasData,
  onOpen,
}: {
  cat: (typeof CATS)[number];
  sample?: Movie;
  hasData: boolean;
  onOpen: () => void;
}) {
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    movedRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - startXRef.current);
    const dy = Math.abs(e.clientY - startYRef.current);

    // Once the pointer moves more than 6px,
    // this is treated as a scroll/swipe, not a tap.
    if (dx > 6 || dy > 6) {
      movedRef.current = true;
    }
  };

  const handlePointerUp = () => {
    // Keep the lock alive long enough to block the
    // click event that follows pointerup.
    setTimeout(() => {
      movedRef.current = false;
    }, 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (!hasData) return;

    onOpen();
  };

  return (
    <div
      className={`em-card ${!hasData ? "coming" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
    >
      {sample ? (
        <img
          src={sample.cover}
          alt={cat.label}
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="em-placeholder" />
      )}

      <div className="em-overlay" />

      <div className="em-label">
        {cat.label}
      </div>

      {!hasData && (
        <div className="em-coming">
          COMING SOON
        </div>
      )}

      {hasData && (
        <div className="em-count">
          {cat.id === "popular"
            ? `${sample ? " " : ""} ${"titles"}`.trim()
            : "Explore →"}
        </div>
      )}
    </div>
  );
}
