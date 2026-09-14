"use client";
import { SeasonManager, SeasonDraft } from "./tv-series";

export default function MiniSeriesManager({ seasons, setSeasons }: {
  seasons: SeasonDraft[],
  setSeasons: (s: SeasonDraft[]) => void
}) {
  return <SeasonManager seasons={seasons} setSeasons={setSeasons} label="Season" />;
}

// also export type for convenience
export type { SeasonDraft } from "./tv-series";
