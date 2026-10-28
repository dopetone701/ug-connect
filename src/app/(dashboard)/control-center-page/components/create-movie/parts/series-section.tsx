// src/app/(dashboard)[STRIPPED 65 bytes].tsx
"use client";
import React from "react";

// FIXED PATHS - go 2 levels up to components/
import { SeasonManager } from "../../tv-series";
import MiniSeriesManager from "../../mini-series";

import type { MovieType, SeasonDraft } from "../types";

interface SeriesSectionProps {
  type: MovieType;
  seasons: SeasonDraft[];
  setSeasons: React.Dispatch<React.SetStateAction<SeasonDraft[]>>;
}

/** Season / episode editor. Renders nothing for single movies. */
export default function SeriesSection({ type, seasons, setSeasons }: SeriesSectionProps) {
  if (type === "Single") return null;

  return (
    <div style={{ marginTop: 18 }}>
      {type === "Full" ? (
        <SeasonManager seasons={seasons} setSeasons={setSeasons} label="Season" />
      ) : (
        <MiniSeriesManager seasons={seasons} setSeasons={setSeasons} />
      )}
    </div>
  );
}
