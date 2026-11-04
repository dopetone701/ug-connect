// edit-movie/types.ts - FIXED v2 — mirrors create-movie
// Actor DNA picker: typing -> instant filter -> select -> photo + full name + D1 id auto-fill
// Photos in R2, data in D1 — NOT Google Drive

import type { MovieCategoryId } from "./constants";

export type MovieType = "Single" | "Mini" | "Full";

export interface CastMember {
  name: string;
  photo: string | null; // R2 key "actors/xyz.jpg" or https url — kept for backwards compat
  // [STRIPPED 77 bytes] Actor DNA — lets Edit modal remember "this is an existing D1 actor"
  actorId?: string | null;   // D1 id e.g. "actor_xxx" — null = new actor, will be created on Save via sync-movie
  photoUrl?: string | null;  // Existing R2 photo URL from D1 (photo_url) — reused on Save, no re-upload
  isExisting?: boolean;      // true if picked from dropdown
  // [STRIPPED 77 bytes] Local-only — NEVER sent in JSON payload, never saved to D1 directly
  // [STRIPPED 77 bytes] MovieDetailsFields sets `_file`, update-movie.ts reads `_file ?? file`.
  // [STRIPPED 77 bytes] Your v1 had NEITHER — so `updateCastAt(..., { _file: file })` red-lines in TS.
  _file?: File | null;
  file?: File | null;        // alias — kept so old code checking `c.file` still works
  photoUploading?: boolean;  // true while POST /actors/:id/photo is in flight — shows "…" overlay
}

// Draft used by the Edit modal form while editing (mirrors Create ActorDraft)
// This is what ActorsList edits — file/previewUrl are local-only, never saved to D1
export interface ActorDraft {
  id: string; // local row id (generateShortId) — NOT the D1 actor id
  name: string;
  file: File | null; // newly picked headshot, if any
  previewUrl: string | null; // blob: preview for new file OR R2 https: photo for existing actor
  // [STRIPPED 77 bytes] Actor DNA
  actorId?: string | null;
  photoUrl?: string | null;
  isExisting?: boolean;
  // [STRIPPED 77 bytes] Alias so ActorDraft and CastMember are interchangeable in sync helpers
  _file?: File | null;
  photo?: string | null;
  photoUploading?: boolean;
}

export interface EpisodeDraft {
  id: string;
  title: string;
  main_url: string; // R2 key
  preview_url?: string | null;
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

export interface EditFormState {
  title: string;
  genre: string;
  vj: string;
  type: MovieType;
  year: string;
  actors: string; // comma-separated, kept for old screens — derived from cast on Save
  cast: CastMember[];
  description: string;
  category: MovieCategoryId | "";
  origin?: string;
  country?: string;
}

// [STRIPPED 77 bytes] What the Actor DNA search returns — used by the picker dropdown
export interface ActorSearchResult {
  id: string;
  name: string;
  normalized_name?: string;
  photo?: string | null;
  photo_url?: string | null;
  photo_key?: string | null;
  // Worker returns `movieCount` in some routes, `movie_count` in others — accept both
  movieCount?: number;
  movie_count?: number;
}

