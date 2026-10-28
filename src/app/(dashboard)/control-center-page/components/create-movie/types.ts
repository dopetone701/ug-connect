// src/app/(dashboard)/control-center-page/components/create-movie/types.ts

// The season/episode draft shape is owned by the series manager, so re-use it as is.
// (If you moved tv-series.tsx, change this one path.)
export type { SeasonDraft } from "../tv-series";


export type MovieType = "Single" | "Mini" | "Full";

export type ProgressCallback = (pct: number) => void;

export interface MultipartPart {
  partNumber: number;
  etag: string;
}

/** One actor row in the form. The photo is picked locally, uploaded on save. */
export interface ActorDraft {
  id: string;
  name: string;
  file: File | null;
  previewUrl: string | null;
}

/** One actor as saved on the movie. `photo` is a storage key (like the cover) or null. */
export interface CastMember {
  name: string;
  photo: string | null;
}

export interface MoviePayload {
  title: string;
  genre: string;
  vj: string;
  type: MovieType;
  year: number;
  /** names only, comma separated: keeps older screens working */
  actors: string;
  /** names + headshots, max 5 */
  cast: CastMember[];
  description: string;
  cover_url: string;
  // single movie
  main_url?: string;
  preview_urls?: string[];
  // series
  seasons?: {
    name: string;
    episodes: { title: string; main_url: string; preview_url: string | null }[];
  }[];
}


