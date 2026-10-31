// edit-movie/types.ts - SOLID edit types - mirrors create-movie

import type { MovieCategoryId } from "./constants";

export type MovieType = "Single" | "Mini" | "Full";

export interface CastMember {
  name: string;
  photo: string | null; // R2 key: "actors/xyz.jpg" or https url
}

export interface EpisodeDraft {
  id: string;
  title: string;
  main_url: string; // R2 key
  preview_url?: string | null;
  // local only - not saved to D1
  file?: File | null;
  objectUrl?: string | null;
  progress?: number;
  status?: "idle" | "uploading" | "done" | "error";
}

export interface SeasonDraft {
  id: string;
  name: string;
  episodes: EpisodeDraft[];
}

export interface MoviePayload {
  title: string;
  genre: string;
  vj: string;
  type: MovieType;
  year: number;
  /** comma separated names - for old screens */
  actors: string;
  /** names + headshots - NEW cast system */
  cast: CastMember[];
  description: string;
  cover_url: string;
  main_url?: string;
  preview_urls: string[];
  seasons?: SeasonDraft[];
  // ===== CATEGORY SYSTEM =====
  category?: MovieCategoryId;
  origin?: string;
  country?: string;
}

export interface EditMovieModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  movieId?: string;
  initialData?: MoviePayload & { id: string; created_at?: string };
}

// Re-export for hooks
export interface EditFormState {
  title: string;
  genre: string;
  vj: string;
  type: MovieType;
  year: string;
  actors: string;
  cast: CastMember[];
  description: string;
  // ===== CATEGORY SYSTEM =====
  category: MovieCategoryId | "";
  origin?: string;
  country?: string;
}

