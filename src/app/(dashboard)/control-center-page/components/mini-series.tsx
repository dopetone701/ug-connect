"use client";
import { SeasonManager } from "./tv-series";
import type { SeasonDraft } from "./tv-series";

export default function MiniSeriesManager(props: {
  seasons: SeasonDraft[],
  setSeasons: React.Dispatch<React.SetStateAction<SeasonDraft[]>>
}) {
  // label="Part" makes it show "Part 1, Part 2" instead of "Season 1, 2"
  return <SeasonManager {...props} label="Part" />;
}

export type { SeasonDraft, EpisodeDraft } from "./tv-series";
