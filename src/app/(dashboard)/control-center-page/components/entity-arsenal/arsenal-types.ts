// src/app/(dashboard)/control-center-page/components/entity-arsenal/arsenal-types.ts
// FROM SCRATCH - Arsenal only. Does NOT import or change Create types.
// Mirrors Worker1 D1 shape (movies/episodes) but lives in its own table arsenal_items.

export type ArsenalType = "Single" | "Series";
export type ArsenalStatus = "staged" | "published" | "cleared";

export interface ArsenalEpisode {
  /** 1-based inside its season */
  episodeNumber: number;
  title: string;
  /** R2A key, e.g. arsenal/{uploaderId}/{uploadId}/s1-e01.mp4 */
  arsenalKey: string;
  /** Filled at migrate time: live R2 key, e.g. series/{movieId}/s1-e01.mp4 */
  liveKey?: string;
  fileSize?: number | null;
  mime?: string;
  /** UI only - never sent to Worker as source of truth */
  status?: "ready" | "migrating" | "migrated" | "error";
  progress?: number;
}

export interface ArsenalItem {
  id: string;
  uploaderEmail: string;
  titleHint: string;
  type: ArsenalType;
  status: ArsenalStatus;
  /** Single only. Series uses episodes[].arsenalKey */
  arsenalKey: string;
  episodes: ArsenalEpisode[];
  fileSize?: number | null;
  mime?: string;
  /** Set on migrate */
  liveMovieId?: string | null;
  /** ms epoch - published + 90 days. Admin Clear Now ignores this. */
  autoClearAt?: number | null;
  createdAt: number;
  updatedAt: number;
}

/** What Create picker hands to CreateMovieModal. No File objects - keys only. */
export interface ArsenalSelection {
  item: ArsenalItem;
  /** Single: liveKey for the one video. Series: one per episode. */
  liveKeys: string[];
}

/** Receiver register / OTP - no password, no JWT, OTP only. */
export interface ArsenalReceiver {
  email: string;
  verified: boolean;
}

export interface ArsenalListResponse {
  items: ArsenalItem[];
}

export interface ArsenalMigrateRequest {
  id: string;
  liveMovieId: string;
  /** Single only */
  liveKey?: string;
  /** Series: maps each arsenalKey -> liveKey */
  liveEpisodes?: Array<{ arsenalKey: string; liveKey: string }>;
}

export interface ArsenalMigrateResponse {
  success: boolean;
  id: string;
  liveMovieId?: string | null;
  copied: string[];
  autoClearAt: number;
  alreadyPublished?: boolean;
}

