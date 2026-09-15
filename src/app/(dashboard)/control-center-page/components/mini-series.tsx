"use client";
import { SeasonManager } from "./tv-series";
import type { SeasonDraft } from "./tv-series";

export default function MiniSeriesManager(props: {
  seasons: SeasonDraft[],
  setSeasons: (s: SeasonDraft[]) => void
}) {
  return <SeasonManager {...props} label="Part" />;
}

export type { SeasonDraft, EpisodeDraft } from "./tv-series";
